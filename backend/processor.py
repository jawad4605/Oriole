import fitz
import pytesseract
from PIL import Image
from docx import Document
import io
import base64
import re

def process_file(file_bytes, filename):
    file_type = filename.split('.')[-1].lower()
    
    if file_type == 'pdf':
        return process_pdf(file_bytes)
    elif file_type in ['png', 'jpg', 'jpeg']:
        return process_image(file_bytes)
    elif file_type == 'docx':
        return process_docx(file_bytes)
    else:
        raise ValueError(f"Unsupported file type: {file_type}")

def process_pdf(file_bytes):
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    result = {"pages": []}
    
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        pix = page.get_pixmap()
        img_bytes = pix.tobytes("png")
        img_base64 = base64.b64encode(img_bytes).decode("utf-8")
        
        text = page.get_text("dict")
        words = []
        
        # Extract words with coordinates
        for block in text["blocks"]:
            if "lines" in block:
                for line in block["lines"]:
                    for span in line["spans"]:
                        for word in span["text"].split():
                            # Simplified bbox for MVP
                            words.append({
                                "text": word,
                                "bbox": span["bbox"],
                                "page": page_num
                            })
        
        result["pages"].append({
            "text": page.get_text(),
            "words": words,
            "dimensions": (pix.width, pix.height),
            "image": f"data:image/png;base64,{img_base64}"
        })
    return result

def process_image(file_bytes):
    image = Image.open(io.BytesIO(file_bytes))
    text_data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
    
    words = []
    for i in range(len(text_data["text"])):
        if text_data["text"][i].strip():
            words.append({
                "text": text_data["text"][i],
                "bbox": [
                    text_data["left"][i],
                    text_data["top"][i],
                    text_data["left"][i] + text_data["width"][i],
                    text_data["top"][i] + text_data["height"][i]
                ]
            })
    
    # Convert image to base64
    buffered = io.BytesIO()
    image.save(buffered, format="PNG")
    img_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")
    
    return {
        "pages": [{
            "text": " ".join(text_data["text"]),
            "words": words,
            "dimensions": image.size,
            "image": f"data:image/png;base64,{img_base64}"
        }]
    }

def process_docx(file_bytes):
    doc = Document(io.BytesIO(file_bytes))
    full_text = []
    for para in doc.paragraphs:
        full_text.append(para.text)
    
    return {
        "pages": [{
            "text": "\n".join(full_text),
            "words": [{"text": word, "bbox": None} for word in " ".join(full_text).split()],
            "dimensions": (612, 792),  # Standard US letter size
            "image": None
        }]
    }