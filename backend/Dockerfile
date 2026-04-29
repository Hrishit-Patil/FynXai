# 1. Use the specific Python 3.11.7 slim image
FROM python:3.11.7-slim

# 2. Install system dependencies for EasyOCR & OpenCV
# These are essential for the 'cv2' and 'EasyOCR' libraries to function
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# 3. Set the working directory
WORKDIR /app

# 4. Copy and install requirements
# We do this before copying the whole project to utilize Docker's cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy your entire backend folder
# This includes ocr.py, main.py, your .pkl model, and the training .csv
COPY . .

# 6. Expose and Run
# Hugging Face looks for port 7860 specifically
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]