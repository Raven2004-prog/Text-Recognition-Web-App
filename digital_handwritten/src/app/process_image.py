import sys
import base64
import numpy as np
from io import BytesIO
from PIL import Image
import easyocr
import json
from spellchecker import SpellChecker

spell = SpellChecker()

def correct_text(text):
    """
    Corrects OCR text using spellchecker.
    """
    words = text.split()
    corrected_words = [spell.correction(word) if spell.correction(word) else word for word in words]
    return " ".join(corrected_words)

def extract_text_from_base64(image_base64):
    """
    Extracts text from a base64-encoded image using EasyOCR.
    """
    try:
        # Decode base64 image
        image_data = base64.b64decode(image_base64)
        image = Image.open(BytesIO(image_data))

        # Convert PIL Image to NumPy array (EasyOCR expects this format)
        image_np = np.array(image)

        # Initialize EasyOCR reader
        reader = easyocr.Reader(['en'], gpu=False)  # Set gpu=True if you have a GPU

        # Extract text from the image
        result = reader.readtext(image_np)

        if not result:
            return "No text detected"

        extracted_text = " ".join([text[1] for text in result])
        
        # Apply spell correction
        corrected_text = correct_text(extracted_text)
        
        return corrected_text

    except Exception as e:
        return f"Error processing image: {str(e)}"

# Main script execution
if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Invalid arguments. Usage: python process_image.py <base64_file_path>"}))
        sys.exit(1)

    base64_file_path = sys.argv[1]

    try:
        with open(base64_file_path, "r") as file:
            image_base64 = file.read()

        extracted_text = extract_text_from_base64(image_base64)

        # Output JSON
        print(json.dumps({"text": extracted_text}))
    except Exception as e:
        print(json.dumps({"error": f"Failed to read or process file: {str(e)}"}))
