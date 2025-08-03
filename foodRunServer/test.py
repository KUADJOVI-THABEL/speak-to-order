import os
# import requests
from elevenlabs.client import ElevenLabs
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not set. Please set it as an environment variable or in a .env file.")

genai.configure(api_key=GEMINI_API_KEY)


def transcribe_audio(filepath):
    elevenlabs = ElevenLabs(
        api_key=os.getenv("ELEVENLABS_API_KEY"),
    )

    trans = elevenlabs.speech_to_text.convert(
        file=open(filepath, "rb"),
        model_id="scribe_v1",
        tag_audio_events=True,
        language_code="eng",
        diarize=True
    )

    print(type(trans.text))
    return trans.text
    # Example usage
    # filepath = "C:\\Users\\pc\\test_new_things\\speak-to-order\\foodRunServer\\uploads\\recording.webm"
    # transcribe_audio(filepath)


def get_product_name_and_quantity_from_transcription(transcription_text):
    # This will process using Gemini or Open AI to extract product names and quantities
    import json
    model = genai.GenerativeModel("gemini-1.5-flash")
    prompt = f"Extract product names and quantities from the following transcription: {transcription_text} give me the result in JSON list format if no products found return empty list"
    response = model.generate_content(prompt)
    string_response = response.text if hasattr(response, "text") else response.candidates[0].content.parts[0].text
    try:
        # Attempt to parse the response as JSON
        product_data = json.loads(string_response)
    except Exception:
        # If parsing fails, return an empty list
        product_data = []
    return product_data

if __name__ == "__main__":
    # Example usage
    transcription_text = "I would like to order a pizza and a coke"
    product_data = get_product_name_and_quantity_from_transcription(transcription_text)
    print(product_data)
    # Output should be a JSON list of products with their names and quantities  