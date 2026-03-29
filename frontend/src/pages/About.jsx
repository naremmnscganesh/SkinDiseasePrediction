import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './About.css';

const About = () => {
  return (
    <motion.div 
      className="container about-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="page-title">About the Model</h1>
      <p className="page-intro">
        A simple explanation of how DermAI works — in plain language, no complicated jargon.
      </p>

      <section className="about-section">
        <h2>What is DermAI?</h2>
        <p>
          DermAI is an AI tool that looks at a photo of skin and tries to guess what skin condition it might show. 
          It can recognize 23 common skin diseases, like acne, eczema, psoriasis, fungal infections, and even some serious ones like melanoma.
        </p>
        <p>
          It was built as a student project to show how artificial intelligence can help with healthcare — but it is <strong>not a doctor</strong>. 
          It’s just a helpful tool to give you an idea, nothing more.
        </p>
      </section>

      <section className="about-section">
        <h2>The Dataset (The Photos It Learned From)</h2>
        <p>
          The AI learned from a public collection called <strong>DermNet</strong>, which has about 19,000 real skin photos submitted by people and doctors.
          These photos are divided into 23 different skin conditions.
        </p>
        <p>
          Some conditions have many photos (like psoriasis or nail fungus), while others have fewer. 
          This makes it harder for the AI to learn the rare ones, but we used special tricks to help it treat all conditions fairly.
        </p>
      </section>

      <div className="highlight">
        <strong>Example conditions it knows:</strong><br/>
        Acne & Rosacea, Eczema, Psoriasis, Fungal Infections (like ringworm), Warts, Melanoma (a type of skin cancer), Nail Fungus, and many more.
      </div>

      <section className="about-section">
        <h2>How the AI Model Works</h2>
        <p>
          The brain of DermAI is a type of AI called a <strong>Convolutional Neural Network (CNN)</strong>. 
          Think of it like a super-smart photo analyzer that looks for patterns, colors, textures, and shapes in skin images.
        </p>
        <ul>
          <li>We used a ready-made model called <strong>EfficientNetB0</strong> — one of the best and fastest CNNs available.</li>
          <li>It was first trained on millions of everyday photos (like cats, cars, etc.) to learn basic image recognition.</li>
          <li>Then we taught it skin diseases using the DermNet photos.</li>
          <li>We made small changes to the photos during training (flipping, zooming a little) so it learns to handle real-world variations.</li>
        </ul>
      </section>

      <section className="about-section">
        <h2>How Accurate Is It?</h2>
        <p>On test photos it has never seen before:</p>
        <ul>
          <li><strong>Top-1 Accuracy:</strong> About 41% — it picks the correct disease as the #1 guess 41% of the time.</li>
          <li><strong>Top-5 Accuracy:</strong> About 75% — the correct disease is usually in the top 5 suggestions.</li>
        </ul>
        <p>
          This is decent for a challenging dataset with 23 different conditions, but it’s not perfect. 
          Some diseases look very similar (like different types of rashes), which confuses the AI.
        </p>
      </section>

      <div className="highlight">
        The model is strongest on clear, common conditions like nail fungus and acne, and weaker on rare or similar-looking ones.
      </div>

      <div style={{ textAlign: "center", marginTop: "40px" }}>
        <Link to="/" className="back-btn">← Back to Home</Link>
      </div>
    </motion.div>
  );
};

export default About;
