import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './Diseases.css';

const diseasesData = [
  {
    id: 1,
    title: "1. Acne and Rosacea",
    desc: "Acne is very common, especially in teenagers — it causes pimples, blackheads, and red bumps, usually on the face, back, or chest. Rosacea is similar but usually appears in adults; it causes redness, visible blood vessels, and sometimes pimples on the face. Both can be triggered by hormones, stress, or certain foods.",
    img: "https://dermnetnz.org/assets/Uploads/acne/rosacea1.jpg"
  },
  {
    id: 2,
    title: "2. Actinic Keratosis, Basal Cell Carcinoma",
    desc: "These are early or actual skin cancers caused by too much sun exposure. Actinic keratosis feels rough and scaly like sandpaper. Basal cell carcinoma is the most common skin cancer — it often looks like a shiny bump or sore that doesn't heal. Early detection is very important.",
    img: "https://dermnetnz.org/assets/Uploads/lesions/ak-face/235.jpg"
  },
  {
    id: 3,
    title: "3. Atopic Dermatitis",
    desc: "A common itchy rash that often starts in childhood. Skin becomes dry, red, and inflamed, especially in skin folds like elbows and knees. It can come and go, triggered by allergies, stress, or irritants.",
    img: "https://dermnetnz.org/assets/Uploads/SCORAD/atopic-oozy-2.jpg"
  },
  {
    id: 4,
    title: "4. Bullous Diseases",
    desc: "These cause large, fluid-filled blisters on the skin. Common types include pemphigus and bullous pemphigoid, often seen in older adults. The blisters can be painful and may break open, leading to infection risk.",
    img: "https://dermnetnz.org/assets/collection-O/Bullous-pemphigoid/bullous-pemphigoid-00096__FillWzEyMDAsNjI4XQ.jpg"
  },
  {
    id: 5,
    title: "5. Cellulitis, Impetigo",
    desc: "Bacterial infections of the skin. Impetigo causes honey-colored crusty sores (common in children). Cellulitis is deeper — red, swollen, warm, and painful skin that spreads quickly. Needs antibiotics.",
    img: "https://dermnetnz.org/assets/collection/Impetigo/impetigo-0009.jpg"
  },
  {
    id: 6,
    title: "6. Eczema",
    desc: "Dry, itchy, red patches on the skin. It can appear anywhere but often on hands, neck, and inside elbows/knees. Caused by a combination of genes and environment; moisturizing and avoiding triggers help.",
    img: "https://dermnetnz.org/assets/Uploads/SCORAD/atopic-oozy-2.jpg"
  },
  {
    id: 7,
    title: "7. Exanthems and Drug Eruptions",
    desc: "Rashes caused by viral infections or reactions to medicines. They often appear suddenly as widespread red spots or bumps and usually go away on their own once the cause is removed.",
    img: "https://dermnetnz.org/assets/Uploads/viral/exanth2.jpg"
  },
  {
    id: 8,
    title: "8. Hair Loss",
    desc: "Thinning or complete loss of hair. Common types include androgenetic alopecia (pattern baldness) and alopecia areata (patchy loss). Can be caused by genetics, stress, illness, or autoimmune issues.",
    img: "https://dermnetnz.org/assets/collection/Alopecia-areata/alopecia-areata-00004.jpg"
  },
  {
    id: 9,
    title: "9. Herpes, HPV, and Other STDs",
    desc: "Skin symptoms from sexually transmitted infections. Herpes causes painful blisters or sores, usually around the mouth or genitals. HPV can cause warts on hands, feet, or genitals.",
    img: "https://dermnetnz.org/assets/Uploads/viral/hsimpl2.jpg"
  },
  {
    id: 10,
    title: "10. Pigmentation Disorders",
    desc: "Conditions affecting skin color. Includes vitiligo (loss of pigment in patches), melasma (dark patches, often on face), or albinism (very light skin and hair). Some are triggered by sun or hormones.",
    img: "https://dermnetnz.org/assets/Uploads/colour/chloas3.jpg"
  },
  {
    id: 11,
    title: "11. Lupus",
    desc: "Autoimmune conditions where the body attacks its own tissues. Lupus often causes a butterfly-shaped rash on the face, joint pain, and fatigue. Skin symptoms can come and go.",
    img: "https://dermnetnz.org/assets/Uploads/immune/sle-05.jpg"
  },
  {
    id: 12,
    title: "12. Melanoma",
    desc: "Melanoma is the most dangerous skin cancer — it can look like an irregular, changing mole. Regular moles are usually harmless. Check for asymmetry, irregular borders, varied color, diameter >6mm, or evolving shape.",
    img: "https://dermnetnz.org/assets/manualthumbnails/lesions/img/mel4-sm.jpg"
  },
  {
    id: 15,
    title: "15. Psoriasis and Lichen Planus",
    desc: "Psoriasis causes thick, scaly, red patches, often on elbows, knees, and scalp. Lichen planus causes itchy, purple, flat-topped bumps. Both are autoimmune and can come and go.",
    img: "https://dermnetnz.org/assets/Uploads/scaly/plaque-psoriasis/26261a.jpg"
  },
  {
    id: 19,
    title: "19. Tinea (Ringworm)",
    desc: "Ringworm causes circular, red, scaly patches (not a worm!). Candida (yeast) infections cause red, moist rashes in skin folds. Common in warm, moist areas.",
    img: "https://dermnetnz.org/assets/Uploads/fungal/s/tincorp9-v2.jpg"
  }
];

const Diseases = () => {
  return (
    <motion.div 
      className="container diseases-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="page-title">Skin Conditions Explained</h1>
      <p className="page-intro">
        Here are simple explanations of the skin conditions DermAI recognizes, with sample clinical images for each. 
        These are real patient photos for educational purposes — skin conditions can vary greatly.
      </p>

      <div className="diseases-list">
        {diseasesData.map((d, index) => (
          <motion.div 
            className="disease-section" 
            key={d.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <h2>{d.title}</h2>
            <p>{d.desc}</p>
            {d.img && (
              <div className="disease-image-container">
                <img src={d.img} alt={`Example of ${d.title}`} loading="lazy" />
                <p className="disease-image-caption">Example clinical image (DermNet NZ)</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="disclaimer">
        Disclaimer: Information is provided for educational purposes only. Always consult a healthcare professional.
      </div>

      <div style={{ textAlign: "center", marginTop: "40px" }}>
        <Link to="/" className="back-btn">← Back to Home</Link>
      </div>
    </motion.div>
  );
};

export default Diseases;
