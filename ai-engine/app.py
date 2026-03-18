# ai-engine/app.py
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import pytesseract
from PIL import Image
import io
import re
import cv2
import numpy as np
from datetime import datetime
import logging
from typing import Optional, Dict, Any
import torch
from transformers import pipeline

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI Expense Tracker Engine", version="1.0.0")
security = HTTPBearer()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

nlp_pipeline = pipeline("text-classification", model="distilbert-base-uncased-finetuned-sst-2-english")

class OCRResult(BaseModel):
    success: bool
    data: Dict[str, Any]
    confidence: float
    requires_confirmation: bool = True

class AIInsight(BaseModel):
    type: str
    title: str
    description: str
    priority: str = "medium"
    actionable: bool = True
    suggestions: list = []

def preprocess_image(image: Image.Image) -> Image.Image:
    img_array = np.array(image)
    if len(img_array.shape) == 3:
        img_array = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
    _, binary = cv2.threshold(img_array, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    denoised = cv2.fastNlMeansDenoising(binary)
    return Image.fromarray(denoised)

def extract_amount(text: str) -> Optional[float]:
    patterns = [r'\$?\s*(\d+\.\d{2})', r'(?:Total|Amount).*?\$?\s*(\d+\.\d{2})']
    for pattern in patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches:
            return float(matches[0])
    return None

def predict_category(text: str) -> str:
    keywords = {'grocery': 'groceries', 'restaurant': 'dining', 'gas': 'transportation'}
    text_lower = text.lower()
    for k, v in keywords.items():
        if k in text_lower: return v
    return 'other'

@app.post("/extract-receipt", response_model=OCRResult)
async def extract_receipt(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents))
    text = pytesseract.image_to_string(preprocess_image(image))
    amount = extract_amount(text)
    category = predict_category(text)
    return OCRResult(success=True, data={"amount": amount, "category": category}, confidence=0.7)