# Document Reader MVP

Interactive document reader with text highlighting and text-to-speech capabilities.

## Features
- Upload PDF, DOCX, JPG, and PNG files
- Text extraction with bounding box detection
- Synchronized text highlighting during playback
- Word-by-word navigation
- Responsive design

## Tech Stack
- **Frontend**: React, Konva.js, Web Speech API
- **Backend**: FastAPI, PyMuPDF, pytesseract, python-docx

## Setup Instructions

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload