import sys
import base64
from io import BytesIO
from PIL import Image
import easyocr

def extract_text(image_base64):
    # Decode base64 image
    image_data = base64.b64decode(image_base64)
    image = Image.open(BytesIO(image_data))

    # Initialize EasyOCR
    reader = easyocr.Reader(['en'])
    result = reader.readtext(image)

    # Extract text
    extracted_text = " ".join([text[1] for text in result])
    return extracted_text

if __name__ == "__main__":
    image_base64 = sys.argv[1]
    text = extract_text(image_base64)
    print(text)  # This will be sent back to Node.js
