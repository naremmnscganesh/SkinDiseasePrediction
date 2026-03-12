from flask import Flask, request, jsonify, send_from_directory
import tensorflow as tf
import numpy as np
import json
from tensorflow.keras.preprocessing import image
from PIL import Image
import io
import os
from flask_cors import CORS

# ─────────────────────────────────────────────
#  Absolute base directory
# ─────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ─────────────────────────────────────────────
#  Flask
# ─────────────────────────────────────────────
app = Flask(__name__,
            static_folder=os.path.join(BASE_DIR, 'static'),
            static_url_path='')
CORS(app)

# ─────────────────────────────────────────────
#  File paths
# ─────────────────────────────────────────────
WEIGHTS_PATH     = os.path.join(BASE_DIR, "best_weights.weights.h5")
ARCH_PATH        = os.path.join(BASE_DIR, "model_architecture.json")
CLASS_NAMES_PATH = os.path.join(BASE_DIR, "class_names.json")
SYMPTOMS_PATH    = os.path.join(BASE_DIR, "symptoms.json")
MEDICINES_PATH   = os.path.join(BASE_DIR, "medicines.json")
IMG_SIZE         = (224, 224)

# ─────────────────────────────────────────────
#  Load Model & Data
# ─────────────────────────────────────────────
print("Loading model architecture...")
with open(ARCH_PATH, 'r', encoding='utf-8') as f:
    model_json = f.read()
model = tf.keras.models.model_from_json(model_json)

print("Loading trained weights...")
model.load_weights(WEIGHTS_PATH)

with open(CLASS_NAMES_PATH, 'r', encoding='utf-8') as f:
    class_names = json.load(f)

with open(SYMPTOMS_PATH, 'r', encoding='utf-8') as f:
    DISEASE_SYMPTOMS = json.load(f)

with open(MEDICINES_PATH, 'r', encoding='utf-8') as f:
    MEDICINES_DB = json.load(f)

print(f"✅ Model loaded! {len(class_names)} classes ready.")


# ─────────────────────────────────────────────
#  Image Preprocessing
# ─────────────────────────────────────────────
def preprocess_image(img_bytes):
    img = Image.open(io.BytesIO(img_bytes)).convert('RGB').resize(IMG_SIZE)
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = (img_array / 127.5) - 1.0
    return img_array


# ─────────────────────────────────────────────
#  Routes
# ─────────────────────────────────────────────
@app.route('/')
def serve_index():
    return send_from_directory(os.path.join(BASE_DIR, 'static'), 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory(os.path.join(BASE_DIR, 'static'), filename)


@app.route('/predict', methods=['POST'])
def predict():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400

        user_info = {}
        if 'user_info' in request.form:
            try:
                user_info = json.loads(request.form['user_info'])
            except Exception:
                pass

        user_name     = user_info.get("name", "Patient")
        user_age      = user_info.get("age", "N/A")
        symptoms_text = user_info.get("symptoms", "")
        user_symptoms = [s.strip() for s in symptoms_text.replace(",", " ").split() if s.strip()]

        # Predict
        img_bytes     = file.read()
        processed_img = preprocess_image(img_bytes)
        predictions   = model.predict(processed_img)[0]

        top_idx           = int(np.argmax(predictions))
        confidence        = float(predictions[top_idx] * 100)
        predicted_disease = class_names[top_idx]

        # Symptom matching
        known_symptoms = DISEASE_SYMPTOMS.get(predicted_disease, [])
        matching = [s for s in user_symptoms if any(s.lower() == k.lower() for k in known_symptoms)]
        missing  = [k for k in known_symptoms if not any(k.lower() == u.lower() for u in user_symptoms)]
        match_score = (
            f"{len(matching)} of {len(known_symptoms)} typical symptoms match"
            if known_symptoms else "No symptom data available"
        )

        meds = MEDICINES_DB.get(predicted_disease, {})

        return jsonify({
            "disease":     predicted_disease,
            "confidence":  f"{confidence:.2f}",
            "match_score": match_score,
            "matching":    matching,
            "missing":     missing,
            "medicines":   meds
        })

    except Exception as e:
        print("❌ Error:", e)
        return jsonify({"error": "Prediction failed"}), 500


# ─────────────────────────────────────────────
#  Entry Point
# ─────────────────────────────────────────────
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=7860, debug=False)