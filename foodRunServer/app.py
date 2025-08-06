from flask import Flask
import time
import os
from dotenv import load_dotenv
from io import BytesIO
import tempfile

import sqlite3
from flask import Flask, request, render_template, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS  # <-- Add this import
from seeding import seed_products_db
# import requests
import requests
from elevenlabs.client import ElevenLabs
from dotenv import load_dotenv

from get_order_from_transcript import get_products_from_transcript
from queries_foods import find_product_by_name_like, parse_fetch_to_json
import boto3
import json

# Load environment variables
load_dotenv()

# Lambda-specific configurations
IS_LAMBDA = os.environ.get('AWS_LAMBDA_FUNCTION_NAME') is not None
elevenlabs = ElevenLabs(
  api_key=os.getenv("ELEVENLABS_API_KEY"),
)
app = Flask(__name__)
CORS(app)  # <-- Enable CORS for all routes

# Lambda-compatible upload folder
if IS_LAMBDA:
    UPLOAD_FOLDER = '/tmp'  # Lambda's writable temporary directory
else:
    UPLOAD_FOLDER = 'uploads'
    
# Database path - use environment variable or default
DB_PATH = os.getenv('DATABASE_PATH', 'products.db')


@app.route("/")
def index():
    # For debugging purposes, remove in production
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
ALLOWED_EXTENSIONS = {'mp3', 'wav', 'aac', 'flac', 'ogg', 'webm'} # Gemini supports various audio formats
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
# Limit file size to 20MB (approx) as a common inline upload limit for Gemini
app.config['MAX_CONTENT_LENGTH'] = 20 * 1024 * 1024

# Create the upload folder if it doesn't exist (only for local development)
if not IS_LAMBDA:
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Configure Gemini API
# It's highly recommended to use environment variables for API keys in production
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not set. Please set it as an environment variable or in a .env file.")



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
            app.logger.info("Received file: %s", file)
            
            # Use temporary file for Lambda compatibility
            if IS_LAMBDA:
                # Create temporary file in Lambda's /tmp directory
                with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file.filename.rsplit('.', 1)[1].lower()}", dir='/tmp') as temp_file:
                    file.save(temp_file.name)
                    filepath = temp_file.name
            else:
                filename = secure_filename(file.filename)
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)
                
            app.logger.info("Saved local file: %s", filepath)
            
            transcription = elevenlabs.speech_to_text.convert(
                file=open(filepath, "rb"),
                model_id="scribe_v1",
                tag_audio_events=True,
              
                diarize=True
            )
            product_data = get_products_from_transcript(transcription.text)
            return jsonify({"explanation": transcription.text, "products": product_data}), 200
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
        
       


@app.route('/search', methods=['POST'])
def search_products():
    """
    Searches for products by name using a LIKE query.
    Expects a JSON payload with a 'name' field.
    """
    data = request.get_json()
    if not data or 'name' not in data:
        return jsonify({"error": "Invalid request, 'name' field is required"}), 400

    name = data['name']
    conn = sqlite3.connect(DB_PATH)
    
    try:
        results = find_product_by_name_like(conn, name)
        return jsonify(parse_fetch_to_json(results)), 200
    except Exception as e:
        app.logger.error(f"Error searching products: {e}", exc_info=True)
        return jsonify({"error": f"Error searching products: {str(e)}"}), 500
    finally:
        conn.close()

@app.route('/submit_feedback', methods=['POST'])
def submit_feedback():
    """
    Receives feedback as JSON and stores it in the Feedback table.
    If the table does not exist, it will be created.
    Expects JSON body: { "ip": ..., "rating": ..., "comment": ... }
    """
    data = request.get_json()
    if not data or 'ip' not in data or 'rating' not in data or 'comment' not in data:
        return jsonify({"error": "Missing required fields: ip, rating, comment"}), 400

    conn = sqlite3.connect(DB_PATH)
    try:
        # Create table if it doesn't exist
        conn.execute("""
            CREATE TABLE IF NOT EXISTS Feedback (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ip TEXT,
                rating INTEGER,
                comment TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        # Insert feedback
        conn.execute(
            "INSERT INTO Feedback (ip, rating, comment) VALUES (?, ?, ?)",
            (data['ip'], data['rating'], data['comment'])
        )
        conn.commit()
        return jsonify({"message": "Feedback submitted successfully"}), 200
    except Exception as e:
        app.logger.error(f"Error submitting feedback: {e}", exc_info=True)
        return jsonify({"error": f"Error submitting feedback: {str(e)}"}), 500
    finally:
        conn.close()

@app.route("/ping")
def ping():
    """
    Simple endpoint to check if the server is running.
    """
    return jsonify({"status": "ok"}), 200

@app.route("/seed_products", methods=["GET"])
def seed_products():
    """
    Seeds the database with initial product data.
    """
    try:
        # Download all_products.json from S3 and seed the database

        s3_bucket = "products-bucket"  # Replace with your S3 bucket name
        s3_key = "all_products.json"
        local_json_path = "/tmp/all_products.json"

        s3 = boto3.client("s3")
        s3.download_file(s3_bucket, s3_key, local_json_path)

        seed_products_db(json_path=local_json_path, db_path=DB_PATH)
        return jsonify({"message": "Database seeded successfully"}), 200
    except Exception as e:
        app.logger.error(f"Error seeding products: {e}", exc_info=True)
        return jsonify({"error": f"Error seeding products: {str(e)}"}), 500