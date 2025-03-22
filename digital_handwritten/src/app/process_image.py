import sys
import base64
import numpy as np
from io import BytesIO
from PIL import Image
import easyocr
import json


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
        result = reader.readtext(image_np)  # ✅ Pass NumPy array

        if not result:
            return "No text detected"

        extracted_text = " ".join([text[1] for text in result])
        return extracted_text

    except Exception as e:
        return f"Error processing image: {str(e)}"


# Main script execution
if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Invalid arguments. Usage: python process_image.py <base64_file_path>"}))
        sys.exit(1)

    # Get base64 file path from command-line argument
    base64_file_path = sys.argv[1]

    try:
        # Read base64 string from the file
        with open(base64_file_path, "r") as file:
            image_base64 = file.read()

        # Extract text
        extracted_text = extract_text_from_base64(image_base64)

        # Output JSON
        print(json.dumps({"text": extracted_text}))
    except Exception as e:
        print(json.dumps({"error": f"Failed to read or process file: {str(e)}"}))