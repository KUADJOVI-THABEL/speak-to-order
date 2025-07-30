from flask import Flask
import time
import os
from dotenv import load_dotenv
from io import BytesIO
import os
import google.generativeai as genai
from flask import Flask, request, render_template, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS  # <-- Add this import

# import requests
from elevenlabs.client import ElevenLabs
from dotenv import load_dotenv

load_dotenv()
elevenlabs = ElevenLabs(
  api_key=os.getenv("ELEVENLABS_API_KEY"),
)
app = Flask(__name__)
CORS(app)  # <-- Enable CORS for all routes


@app.route("/")
def index():
    print(f"API Key: {elevenlabs.api_key}")  # For debugging purposes, remove in production
    return "<p>Hello, World!</p>"




@app.route("/transcribe")
def transcribe_audio():
    audio_url = (
        "https://storage.googleapis.com/eleven-public-cdn/audio/marketing/nicole.mp3"
    )
    response = requests.get(audio_url)
    audio_data = BytesIO(response.content)

    transcription = elevenlabs.speech_to_text.convert(
        file=audio_data,
        model_id="scribe_v1", # Model to use, for now only "scribe_v1" is supported
        tag_audio_events=True, # Tag audio events like laughter, applause, etc.
        language_code="eng", # Language of the audio file. If set to None, the model will detect the language automatically.
        diarize=True, # Whether to annotate who is speaking
    )


# --- Configuration ---
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'mp3', 'wav', 'aac', 'flac', 'ogg', 'webm'} # Gemini supports various audio formats
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
# Limit file size to 20MB (approx) as a common inline upload limit for Gemini
app.config['MAX_CONTENT_LENGTH'] = 20 * 1024 * 1024

# Create the upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Configure Gemini API
# It's highly recommended to use environment variables for API keys in production
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not set. Please set it as an environment variable or in a .env file.")

genai.configure(api_key=GEMINI_API_KEY)

# Initialize the Gemini model for multimodal input
# Use a model that supports audio input, e.g., 'gemini-pro-vision' or newer multimodal models
# Refer to Google AI Studio documentation for the latest recommended models for audio.
# For audio, 'gemini-1.5-flash' or 'gemini-1.5-pro' are good choices.
# We'll use 'gemini-1.5-flash' for this example.
model = genai.GenerativeModel('gemini-1.5-flash')


def allowed_file(filename):
    """Checks if the file extension is allowed."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/upload_audio', methods=['POST'])
def upload_audio():
    """
    Receives an audio file, sends it to Gemini for explanation,
    and returns the explanation.
    """
    # Changed 'audio' back to 'audio_file' to match the provided HTML form's name attribute
    if 'audio_file' not in request.files:
        return jsonify({"error": "No audio_file part in the request"}), 400

    # Debugging line to check uploaded files - keep this for development if needed
    app.logger.info("request.files: %s", request.files)
    file = request.files['audio_file']

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    filepath = None  # Initialize filepath to None
    audio_file_part = None  # Initialize audio_file_part to None

    try:
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            app.logger.info(f"Saved local file: {filepath}")

            # Upload file to Gemini's Files API
            audio_file_part = genai.upload_file(filepath)
            app.logger.info(f"Uploaded file to Gemini: {audio_file_part.name}")

            # --- Polling for file status ---
            max_retries = 15  # Increased retries for potentially larger files or slower processing
            retry_delay_seconds = 2  # Initial delay
            
            for i in range(max_retries):
                retrieved_file = genai.get_file(name=audio_file_part.name)
                if retrieved_file.state.name == 'ACTIVE':
                    app.logger.info(f"File {audio_file_part.name} is ACTIVE after {i+1} checks.")
                    break
                else:
                    app.logger.info(f"File {audio_file_part.name} state: {retrieved_file.state.name}. Retrying in {retry_delay_seconds} seconds...")
                    time.sleep(retry_delay_seconds)
                    # Optional: Exponential backoff for retries
                    # retry_delay_seconds = min(retry_delay_seconds * 1.5, 30) # Cap delay at 30 seconds
            else:
                # If loop completes without breaking, file never became active
                raise Exception(f"File {audio_file_part.name} did not become ACTIVE within the allowed time. Current state: {retrieved_file.state.name}")

            # Now that the file is ACTIVE, proceed with content generation
            prompt = "Please explain the content of this audio. What is happening or being said?"
            response = model.generate_content([prompt, audio_file_part])

            return jsonify({"explanation": response.text})
        else:
            return jsonify({"error": "Invalid file type. Allowed types are: " + ', '.join(ALLOWED_EXTENSIONS)}), 400

    except Exception as e:
        app.logger.error(f"Error in upload_audio: {e}", exc_info=True)
        return jsonify({"error": f"Error processing audio with Gemini: {str(e)}"}), 500
    finally:
        # --- Robust Cleanup ---
        # Delete the local file
        if filepath and os.path.exists(filepath):
            try:
                os.remove(filepath)
                app.logger.info(f"Deleted local file: {filepath}")
            except OSError as e:
                app.logger.warning(f"Error deleting local file {filepath}: {e}")
        
        # Delete the file from Gemini's storage
        if audio_file_part and audio_file_part.name:
            try:
                genai.delete_file(audio_file_part.name)
                app.logger.info(f"Deleted Gemini file: {audio_file_part.name}")
            except Exception as e:
                # Log a warning if Gemini file deletion fails, but don't block the response
                app.logger.warning(f"Failed to delete Gemini file {audio_file_part.name}: {e}")
