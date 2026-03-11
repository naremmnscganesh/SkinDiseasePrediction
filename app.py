import os
import json
import numpy as np
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from PIL import Image
import io

# ── TensorFlow / Keras ────────────────────────────────────────────
import tensorflow as tf
from tensorflow.keras.models import model_from_json
from tensorflow.keras.applications.efficientnet import preprocess_input

app = Flask(__name__, static_folder="static")
CORS(app)

# ── Load split model (JSON architecture + H5 weights) ─────────────
print("Loading model architecture...")
with open("model_architecture.json", "r") as f:
    model = model_from_json(f.read())

print("Loading model weights...")
model.load_weights("best_weights.h5")
print("✅ Model loaded successfully")

# ── Class names (23 DermNet classes, alphabetical — Keras order) ──
CLASS_NAMES = [
    "Acne and Rosacea Photos",
    "Actinic Keratosis Basal Cell Carcinoma and other Malignant Lesions",
    "Atopic Dermatitis Photos",
    "Bullous Disease Photos",
    "Cellulitis Impetigo and other Bacterial Infections",
    "Eczema Photos",
    "Exanthems and Drug Eruptions",
    "Hair Loss Photos Alopecia and other Hair Diseases",
    "Herpes HPV and other STDs Photos",
    "Light Diseases and Disorders of Pigmentation",
    "Lupus and other Connective Tissue diseases",
    "Melanoma Skin Cancer Nevi and Moles",
    "Nail Fungus and other Nail Disease",
    "Poison Ivy Photos and other Contact Dermatitis",
    "Psoriasis pictures Lichen Planus and related diseases",
    "Scabies Lyme Disease and other Infestations and Bites",
    "Seborrheic Keratoses and other Benign Tumors",
    "Systemic Disease",
    "Tinea Ringworm Candidiasis and other Fungal Infections",
    "Urticaria Hives",
    "Vascular Tumors",
    "Vasculitis Photos",
    "Warts Molluscum and other Viral Infections",
]

# ── Symptom database ──────────────────────────────────────────────
DISEASE_SYMPTOMS = {
    "Acne and Rosacea Photos": ["pimples", "blackheads", "redness", "oily skin", "pustules", "whiteheads", "facial flushing"],
    "Actinic Keratosis Basal Cell Carcinoma and other Malignant Lesions": ["scaly patch", "rough skin", "bleeding", "non-healing sore", "crusty lesion", "pink growth"],
    "Atopic Dermatitis Photos": ["itching", "dry skin", "rash", "redness", "inflammation", "flaking", "scaly patches"],
    "Bullous Disease Photos": ["blisters", "fluid-filled bumps", "skin peeling", "burning", "pain", "raw skin"],
    "Cellulitis Impetigo and other Bacterial Infections": ["redness", "swelling", "warmth", "pain", "crusting", "oozing", "fever"],
    "Eczema Photos": ["itching", "dry patches", "redness", "inflammation", "cracking", "oozing", "scaling"],
    "Exanthems and Drug Eruptions": ["widespread rash", "fever", "itching", "red spots", "hives", "skin peeling"],
    "Hair Loss Photos Alopecia and other Hair Diseases": ["hair thinning", "bald patches", "hair fall", "scalp irritation", "receding hairline"],
    "Herpes HPV and other STDs Photos": ["sores", "blisters", "pain", "itching", "burning", "genital lesions", "warts"],
    "Light Diseases and Disorders of Pigmentation": ["skin discoloration", "white patches", "dark spots", "uneven skin tone", "sun sensitivity"],
    "Lupus and other Connective Tissue diseases": ["butterfly rash", "joint pain", "fatigue", "sun sensitivity", "hair loss", "mouth sores"],
    "Melanoma Skin Cancer Nevi and Moles": ["changing mole", "asymmetric lesion", "dark spot", "bleeding mole", "irregular border"],
    "Nail Fungus and other Nail Disease": ["thickened nails", "yellow nails", "brittle nails", "nail discoloration", "nail separation"],
    "Poison Ivy Photos and other Contact Dermatitis": ["itching", "redness", "blistering", "swelling", "rash", "burning sensation"],
    "Psoriasis pictures Lichen Planus and related diseases": ["silver scales", "red plaques", "itching", "dry skin", "joint pain", "thickened skin"],
    "Scabies Lyme Disease and other Infestations and Bites": ["intense itching", "burrows", "rash", "small bumps", "night itching", "bull's eye rash"],
    "Seborrheic Keratoses and other Benign Tumors": ["waxy growths", "brown spots", "rough patches", "stuck-on appearance", "painless bumps"],
    "Systemic Disease": ["skin rash", "fatigue", "joint pain", "fever", "weight loss", "organ involvement"],
    "Tinea Ringworm Candidiasis and other Fungal Infections": ["ring-shaped rash", "itching", "scaly patches", "redness", "athlete's foot", "nail changes"],
    "Urticaria Hives": ["hives", "welts", "itching", "swelling", "red bumps", "angioedema"],
    "Vascular Tumors": ["red growths", "bleeding lesion", "port wine stain", "hemangioma", "vascular birthmark"],
    "Vasculitis Photos": ["purple spots", "skin ulcers", "redness", "pain", "joint pain", "bruising"],
    "Warts Molluscum and other Viral Infections": ["warts", "rough bumps", "skin tags", "pearly papules", "painless lumps"],
}

# ── Medicine database ─────────────────────────────────────────────
MEDICINES = {
    "Acne and Rosacea Photos": {
        "topical": ["Benzoyl Peroxide 2.5–5%", "Tretinoin 0.025–0.1%", "Clindamycin gel 1%", "Azelaic Acid 15–20%"],
        "oral_moderate": ["Doxycycline 100 mg/day", "Minocycline 50–100 mg/day"],
        "rosacea_specific": ["Metronidazole 0.75% gel", "Ivermectin 1% cream", "Brimonidine 0.33% gel"],
        "caution": "Avoid prolonged antibiotic use. Use non-comedogenic sunscreen daily.",
    },
    "Actinic Keratosis Basal Cell Carcinoma and other Malignant Lesions": {
        "actinic_keratosis": ["Fluorouracil 5% cream", "Imiquimod 5% cream", "Diclofenac 3% gel"],
        "basal_cell_carcinoma": ["Mohs micrographic surgery", "Vismodegib (advanced cases)", "Radiation therapy"],
        "monitoring": "Regular dermatology follow-up every 3–6 months. Full-body skin exams.",
        "caution": "Urgent dermatology referral required for malignant lesions.",
    },
    "Atopic Dermatitis Photos": {
        "topical_steroids": ["Hydrocortisone 1–2.5% (mild)", "Triamcinolone 0.1% (moderate)", "Clobetasol 0.05% (severe)"],
        "calcineurin_inhibitors": ["Tacrolimus 0.03–0.1% ointment", "Pimecrolimus 1% cream"],
        "oral_moderate": ["Dupilumab (Dupixent) 300 mg biweekly", "Cyclosporine 3–5 mg/kg/day"],
        "emollients": ["CeraVe Moisturizing Cream", "Eucerin Original", "Vaseline Petroleum Jelly"],
        "caution": "Avoid known triggers (wool, soaps, stress). Bathe in lukewarm water.",
    },
    "Bullous Disease Photos": {
        "first_line": ["Prednisone 0.5–1 mg/kg/day", "Dapsone 50–100 mg/day"],
        "immunotherapy": ["Rituximab 1000 mg IV (x2)", "Mycophenolate mofetil 1–3 g/day", "Azathioprine 1–3 mg/kg/day"],
        "wound_care": ["Non-adhesive dressings", "Silver sulfadiazine for open areas", "Saline wound irrigation"],
        "caution": "Specialist dermatology/immunology management essential.",
    },
    "Cellulitis Impetigo and other Bacterial Infections": {
        "impetigo_topical": ["Mupirocin 2% ointment 3×/day", "Retapamulin 1% ointment"],
        "cellulitis_oral": ["Cephalexin 500 mg 4×/day × 5–7 days", "Amoxicillin-clavulanate 875 mg 2×/day"],
        "severe_iv": ["Vancomycin IV (MRSA)", "Piperacillin-tazobactam IV", "Clindamycin 600 mg IV q8h"],
        "caution": "Mark cellulitis border with pen to monitor spread. Seek ER if fever develops.",
    },
    "Eczema Photos": {
        "topical_steroids": ["Hydrocortisone 1% (face/folds)", "Betamethasone 0.1% (body)", "Clobetasol 0.05% (palms/soles)"],
        "calcineurin_inhibitors": ["Tacrolimus 0.03% ointment", "Pimecrolimus 1% cream"],
        "oral_moderate": ["Dupilumab (Dupixent)", "Cetirizine 10 mg (antipruritic)"],
        "emollients": ["Apply within 3 min of bathing", "CeraVe Healing Ointment", "Aquaphor Healing Ointment"],
        "caution": "Avoid scratching. Use fragrance-free laundry detergent.",
    },
    "Exanthems and Drug Eruptions": {
        "mild_to_moderate": ["Antihistamines: Cetirizine 10 mg", "Topical steroids: Hydrocortisone 1%"],
        "moderate_to_severe": ["Prednisone 0.5–1 mg/kg/day × 5–7 days", "Methylprednisolone IV (severe)"],
        "sjs_ten_emergency": ["Stop causative drug immediately", "IV fluids and electrolytes", "IVIG 1 g/kg/day × 3 days", "Urgent burns unit transfer"],
        "caution": "Identify and permanently avoid the causative drug.",
    },
    "Hair Loss Photos Alopecia and other Hair Diseases": {
        "androgenetic_alopecia": ["Minoxidil 5% solution/foam topically", "Finasteride 1 mg/day (males)", "Dutasteride 0.5 mg/day"],
        "alopecia_areata": ["Intralesional triamcinolone 5–10 mg/mL", "Baricitinib 4 mg/day (JAK inhibitor)", "Topical anthralin"],
        "tinea_capitis": ["Griseofulvin 10–20 mg/kg/day × 6–8 weeks", "Terbinafine 250 mg/day × 4 weeks"],
        "monitoring": "Check thyroid, iron, vitamin D, and ferritin levels.",
    },
    "Herpes HPV and other STDs Photos": {
        "herpes_simplex": ["Acyclovir 400 mg 3×/day × 7–10 days", "Valacyclovir 1 g 2×/day × 7–10 days"],
        "herpes_zoster": ["Valacyclovir 1 g 3×/day × 7 days", "Famciclovir 500 mg 3×/day"],
        "hpv_warts": ["Podophyllotoxin 0.5% solution", "Imiquimod 5% cream 3×/week", "Cryotherapy (liquid nitrogen)"],
        "caution": "Notify sexual partners. Practice safe sex. HPV vaccine recommended.",
    },
    "Light Diseases and Disorders of Pigmentation": {
        "vitiligo": ["Tacrolimus 0.1% ointment", "Narrowband UVB phototherapy", "Ruxolitinib 1.5% cream (Opzelura)"],
        "melasma": ["Hydroquinone 4% cream", "Tretinoin 0.05% + Hydroquinone combo", "Tranexamic acid 250 mg 2×/day"],
        "photodermatoses": ["Sunscreen SPF 50+ (broad spectrum)", "Hydroxychloroquine 200 mg/day", "Beta-carotene supplements"],
        "caution": "Strict sun avoidance and daily SPF 50+ sunscreen is essential.",
    },
    "Lupus and other Connective Tissue diseases": {
        "cutaneous_lupus": ["Hydroxychloroquine 200–400 mg/day", "Topical tacrolimus 0.1%", "Sunscreen SPF 50+ daily"],
        "systemic_lupus": ["Prednisone 0.5–1 mg/kg/day", "Methotrexate 7.5–25 mg/week", "Belimumab (Benlysta) IV/SC"],
        "monitoring": "Regular CBC, CMP, urinalysis, and complement levels (C3, C4).",
        "caution": "Strict sun avoidance. Rheumatology co-management required.",
    },
    "Melanoma Skin Cancer Nevi and Moles": {
        "surgical": ["Wide local excision (primary treatment)", "Sentinel lymph node biopsy"],
        "targeted_therapy": ["Dabrafenib + Trametinib (BRAF V600E+)", "Vemurafenib (BRAF mutated)"],
        "immunotherapy": ["Pembrolizumab (Keytruda)", "Nivolumab (Opdivo)", "Ipilimumab (Yervoy)"],
        "monitoring": "Urgent biopsy for any suspicious lesion. Oncology referral required.",
        "caution": "Do NOT delay evaluation of suspicious moles. Melanoma is life-threatening.",
    },
    "Nail Fungus and other Nail Disease": {
        "onychomycosis_topical": ["Ciclopirox 8% nail lacquer", "Efinaconazole 10% solution", "Tavaborole 5% solution"],
        "onychomycosis_oral": ["Terbinafine 250 mg/day × 12 weeks (fingernails) or 16 weeks (toenails)", "Itraconazole pulse therapy 200 mg 2×/day × 1 week/month"],
        "nail_psoriasis": ["Calcipotriol + betamethasone gel", "Intralesional triamcinolone"],
        "monitoring": "Liver function tests before and during oral antifungal therapy.",
    },
    "Poison Ivy Photos and other Contact Dermatitis": {
        "mild": ["Hydrocortisone 1–2.5% cream", "Calamine lotion", "Oatmeal baths"],
        "moderate_to_severe": ["Prednisone 40–60 mg/day × 5–7 days (tapering)", "Triamcinolone ointment 0.1%"],
        "antipruritic": ["Diphenhydramine (Benadryl) 25–50 mg at night", "Cetirizine 10 mg/day", "Cool wet compresses"],
        "allergic_contact_dermatitis": ["Identify and strictly avoid allergen", "Patch testing by dermatologist"],
        "caution": "Wash exposed skin with soap within 10 min of contact to reduce severity.",
    },
    "Psoriasis pictures Lichen Planus and related diseases": {
        "topical_psoriasis": ["Calcipotriol (Dovonex) 0.005%", "Betamethasone dipropionate 0.05%", "Tazarotene 0.05–0.1% gel"],
        "systemic_psoriasis": ["Methotrexate 7.5–25 mg/week", "Acitretin 25–50 mg/day", "Cyclosporine 2.5–5 mg/kg/day"],
        "biologics_psoriasis": ["Secukinumab (Cosentyx) 300 mg SC", "Adalimumab (Humira)", "Ixekizumab (Taltz)"],
        "lichen_planus": ["Topical betamethasone 0.05%", "Hydroxychloroquine 200–400 mg/day"],
        "caution": "Monitor for psoriatic arthritis. Regular liver/kidney checks on systemic therapy.",
    },
    "Scabies Lyme Disease and other Infestations and Bites": {
        "scabies_first_line": ["Permethrin 5% cream (full body, leave 8–14 hours)", "Ivermectin 200 mcg/kg oral (×2, one week apart)"],
        "scabies_adjuncts": ["Antihistamines for itch", "Topical corticosteroids for post-scabies itch"],
        "lyme_disease": ["Doxycycline 100 mg 2×/day × 10–21 days", "Amoxicillin 500 mg 3×/day (children/pregnant)"],
        "insect_bites": ["Hydrocortisone 1% cream", "Oral antihistamines", "Cold packs"],
        "caution": "Treat all household contacts simultaneously for scabies.",
    },
    "Seborrheic Keratoses and other Benign Tumors": {
        "seborrheic_keratosis": ["Cryotherapy (liquid nitrogen)", "Curettage", "Hydrogen peroxide 40% solution (Eskata)"],
        "dermatofibroma": ["Observation (usually benign)", "Cryotherapy", "Surgical excision if bothersome"],
        "lipoma": ["Observation if asymptomatic", "Surgical excision", "Liposuction (large lipomas)"],
        "caution": "Biopsy any lesion with atypical features to rule out malignancy.",
    },
    "Systemic Disease": {
        "general_approach": ["Treat the underlying systemic disease", "Dermatology + internal medicine co-management"],
        "diabetes_related": ["Glycemic control (HbA1c target <7%)", "Wound care", "Antifungals for candidal infections"],
        "thyroid_related": ["Thyroid hormone replacement/suppression", "Symptom-directed skin care"],
        "liver_disease": ["Ursodeoxycholic acid (cholestatic itch)", "Cholestyramine", "Antihistamines"],
        "monitoring": "Regular organ function monitoring. Address the root systemic condition.",
    },
    "Tinea Ringworm Candidiasis and other Fungal Infections": {
        "tinea_topical": ["Clotrimazole 1% cream 2×/day × 2–4 weeks", "Terbinafine 1% cream × 1–2 weeks", "Miconazole 2% cream"],
        "tinea_oral": ["Terbinafine 250 mg/day × 2–4 weeks", "Itraconazole 200 mg/day × 2 weeks"],
        "candidiasis": ["Nystatin cream/powder", "Fluconazole 150 mg single dose (oral/vaginal)", "Clotrimazole pessary"],
        "monitoring": "Liver function tests with prolonged oral antifungal therapy.",
    },
    "Urticaria Hives": {
        "acute_urticaria": ["Cetirizine 10–20 mg/day", "Loratadine 10 mg/day", "Fexofenadine 180 mg/day"],
        "chronic_urticaria": ["Non-sedating antihistamines (double dose)", "Omalizumab (Xolair) 300 mg SC monthly"],
        "anaphylaxis_emergency": ["Epinephrine auto-injector (EpiPen) 0.3 mg IM immediately", "Call emergency services", "IV methylprednisolone 125 mg"],
        "caution": "Identify and avoid triggers. Carry EpiPen if risk of anaphylaxis.",
    },
    "Vascular Tumors": {
        "infantile_hemangioma": ["Propranolol 1–3 mg/kg/day (first-line)", "Timolol 0.5% topical drops"],
        "pyogenic_granuloma": ["Cauterization", "Laser (PDL)", "Surgical excision"],
        "port_wine_stain": ["Pulsed dye laser (PDL) — multiple sessions"],
        "cherry_angioma": ["Electrodesiccation", "Laser ablation (usually cosmetic)"],
        "caution": "Specialist vascular dermatology/surgery referral for complex vascular tumors.",
    },
    "Vasculitis Photos": {
        "cutaneous_small_vessel": ["Colchicine 0.6 mg 2×/day", "Dapsone 50–100 mg/day", "Prednisone 0.5 mg/kg/day"],
        "systemic_vasculitis": ["High-dose prednisone 1 mg/kg/day", "Cyclophosphamide IV", "Rituximab IV"],
        "monitoring": "CBC, CMP, ANCA, complement levels, urinalysis regularly.",
        "caution": "Immediate rheumatology evaluation required. Organ involvement is life-threatening.",
    },
    "Warts Molluscum and other Viral Infections": {
        "warts": ["Salicylic acid 17–40% (daily application)", "Cryotherapy (liquid nitrogen) every 2–3 weeks", "Imiquimod 5% cream"],
        "molluscum_contagiosum": ["Cantharidin solution (applied by physician)", "Cryotherapy", "Potassium hydroxide 10% solution"],
        "viral_skin_infections_general": ["Supportive care", "Keep area clean and dry", "Avoid picking/spreading"],
        "caution": "Warts are contagious. Avoid sharing towels/personal items.",
    },
}

# ── Symptom matcher ────────────────────────────────────────────────
def match_symptoms(user_symptoms_text, disease):
    user_syms = [s.strip().lower() for s in user_symptoms_text.replace(",", " ").split()]
    known_syms = DISEASE_SYMPTOMS.get(disease, [])
    matching = [s for s in known_syms if any(u in s.lower() or s.lower() in u for u in user_syms)]
    missing  = [s for s in known_syms if s not in matching][:4]
    total    = len(known_syms) if known_syms else 1
    score    = f"{len(matching)}/{total} symptoms matched"
    return matching, missing, score

# ── Predict endpoint ───────────────────────────────────────────────
@app.route("/predict", methods=["POST"])
def predict():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No image file provided"}), 400

        file      = request.files["file"]
        user_info = json.loads(request.form.get("user_info", "{}"))
        symptoms  = user_info.get("symptoms", "")

        # Preprocess image
        img = Image.open(io.BytesIO(file.read())).convert("RGB")
        img = img.resize((224, 224))
        img_array = np.array(img, dtype=np.float32)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = preprocess_input(img_array)

        # Predict
        predictions   = model.predict(img_array, verbose=0)
        pred_index    = int(np.argmax(predictions[0]))
        confidence    = float(predictions[0][pred_index]) * 100
        disease       = CLASS_NAMES[pred_index]

        # Symptom match
        matching, missing, match_score = match_symptoms(symptoms, disease)

        return jsonify({
            "disease":    disease,
            "confidence": round(confidence, 2),
            "match_score": match_score,
            "matching":   matching,
            "missing":    missing,
            "medicines":  MEDICINES.get(disease, {}),
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── Serve frontend ─────────────────────────────────────────────────
@app.route("/")
def index():
    return send_from_directory("static", "index.html")

@app.route("/chat-ui")
def chat_ui():
    return "<h2>Dr. Derm Chat — coming soon</h2>"


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))   # HuggingFace uses 7860
    app.run(host="0.0.0.0", port=port)