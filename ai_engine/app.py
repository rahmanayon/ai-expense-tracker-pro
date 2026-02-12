# ai_engine/app.py
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pytesseract
from PIL import Image
import io
import re
from datetime import datetime

app = FastAPI(title="AI Expense Tracker Engine")

import os

allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/extract-receipt")
async def extract_receipt(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # OCR processing
        text = pytesseract.image_to_string(image)
        
        # Extract data using regex patterns
        extracted = {
            "amount": extract_amount(text),
            "date": extract_date(text),
            "merchant": extract_merchant(text),
            "category": predict_category(text),
            "raw_text": text
        }
        
        return {
            "success": True,
            "data": extracted,
            "requires_confirmation": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def extract_amount(text: str) -> float:
    # Pattern: $##.## or ##.## USD etc.
    patterns = [
        r'\$?(\d+\.\d{2})',
        r'(\d+\.\d{2})\s*(?:USD|BDT|EUR)'
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return float(match.group(1))
    return 0.0

def extract_date(text: str) -> str:
    patterns = [
        r'(\d{1,2}[/-]\d{1,2}[/-]\d{4})',
        r'(\d{4}[/-]\d{1,2}[/-]\d{1,2})'
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(1)
    return datetime.now().strftime("%Y-%m-%d")

def extract_merchant(text: str) -> str:
    # Simple heuristic: first non-empty line
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    return lines[0] if lines else "Unknown"

def predict_category(text: str) -> str:
    # Simple keyword-based classification
    text_lower = text.lower()
    if any(word in text_lower for word in ['grocery', 'supermarket', 'food']):
        return 'Groceries'
    elif any(word in text_lower for word in ['gas', 'fuel', 'transport']):
        return 'Transportation'
    elif any(word in text_lower for word in ['restaurant', 'cafe', 'dining']):
        return 'Dining Out'
    return 'Other'