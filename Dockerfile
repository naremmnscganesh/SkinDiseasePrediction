# ─── Stage 1: Build React Frontend ───────────────────────────────────────────
FROM node:20-slim AS frontend-builder

WORKDIR /frontend

# Copy package files first for better layer caching
COPY frontend/package*.json ./
RUN npm ci

# Copy source and build
COPY frontend/ ./
RUN npm run build

# ─── Stage 2: Python Backend ──────────────────────────────────────────────────
FROM python:3.10.13-slim

WORKDIR /app

# Install system dependencies required by TensorFlow / Pillow
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source files
COPY app.py .
COPY db.py .
COPY encryption_utils.py .
COPY model_architecture.json .
COPY best_weights.weights.h5 .
COPY class_names.json .
COPY symptoms.json .
COPY medicines.json .
COPY static/ ./static/

# Copy built React frontend from Stage 1
COPY --from=frontend-builder /frontend/dist ./frontend/dist

EXPOSE 7860

# Use $PORT env var (Railway injects it); fallback to 7860
CMD gunicorn --bind 0.0.0.0:${PORT:-7860} --timeout 120 --workers 1 app:app