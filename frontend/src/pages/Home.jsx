import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, User, Phone, Image as ImageIcon, CheckCircle, RefreshCw, Activity, HeartPulse, ShieldAlert, FileText, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './Home.css';

const LABELS = {
  topical:"Topical Treatment",oral_moderate:"Oral — Moderate",oral_severe:"Oral — Severe",
  systemic:"Systemic Treatment",first_line:"First-Line Treatment",adjuvants:"Adjuvant Therapy",
  antipruritic:"Antipruritic",antihistamines:"Antihistamines",emollients:"Emollients",
  surgical:"Surgical Treatment",immunotherapy:"Immunotherapy",targeted_therapy:"Targeted Therapy",
  biologics_psoriasis:"Biologic Therapy",systemic_psoriasis:"Systemic (Psoriasis)",
  topical_psoriasis:"Topical (Psoriasis)",lichen_planus:"Lichen Planus",
  rosacea_specific:"Rosacea-Specific",vitiligo:"Vitiligo",melasma:"Melasma",
  photodermatoses:"Photodermatosis",actinic_keratosis:"Actinic Keratosis",
  basal_cell_carcinoma:"Basal Cell Carcinoma",squamous_cell_carcinoma:"Squamous Cell Carcinoma",
  impetigo_topical:"Impetigo (Topical)",cellulitis_oral:"Cellulitis (Oral)",
  severe_iv:"Severe / IV Therapy",scabies_first_line:"Scabies First-Line",
  scabies_adjuncts:"Scabies Adjuncts",lyme_disease:"Lyme Disease",
  insect_bites:"Insect Bites",onychomycosis_topical:"Nail Fungus (Topical)",
  onychomycosis_oral:"Nail Fungus (Oral)",nail_psoriasis:"Nail Psoriasis",
  tinea_topical:"Tinea (Topical)",tinea_oral:"Tinea (Oral)",candidiasis:"Candidiasis",
  acute_urticaria:"Acute Urticaria",chronic_urticaria:"Chronic Urticaria",
  anaphylaxis_emergency:"⚠️ Anaphylaxis Emergency",herpes_simplex:"Herpes Simplex",
  herpes_zoster:"Herpes Zoster",hpv_warts:"HPV / Warts",
  androgenetic_alopecia:"Androgenetic Alopecia",alopecia_areata:"Alopecia Areata",
  telogen_effluvium:"Telogen Effluvium",tinea_capitis:"Tinea Capitis",
  mild:"Mild Cases",moderate_to_severe:"Moderate–Severe",mild_to_moderate:"Mild to Moderate",
  sjs_ten_emergency:"⚠️ SJS/TEN Emergency",
  allergic_contact_dermatitis:"Allergic Contact Dermatitis",
  infantile_hemangioma:"Infantile Hemangioma",pyogenic_granuloma:"Pyogenic Granuloma",
  port_wine_stain:"Port Wine Stain",cherry_angioma:"Cherry Angioma",
  cutaneous_small_vessel:"Cutaneous Vasculitis",systemic_vasculitis:"Systemic Vasculitis",
  cutaneous_lupus:"Cutaneous Lupus",systemic_lupus:"Systemic Lupus",
  warts:"Warts",molluscum_contagiosum:"Molluscum Contagiosum",
  viral_skin_infections_general:"General Viral Care",
  seborrheic_keratosis:"Seborrheic Keratosis",dermatofibroma:"Dermatofibroma",
  lipoma:"Lipoma",general_approach:"General Approach",diabetes_related:"Diabetes-Related",
  thyroid_related:"Thyroid-Related",liver_disease:"Liver Disease",
  bullous_pemphigoid:"Bullous Pemphigoid",wound_care:"Wound Care",
  topical_steroids:"Topical Steroids",calcineurin_inhibitors:"Calcineurin Inhibitors",
  supportive:"Supportive Care"
};

const Home = () => {
  const { user, token } = useAuth();
  const [userInfo, setUserInfo] = useState({ name: '', age: '', phone: '', symptoms: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewSrc, setPreviewSrc] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [pastCases, setPastCases] = useState([]);
  const [showPrescription, setShowPrescription] = useState(null);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user && token && user.role === 'patient') {
      fetchPastCases();
    }
  }, [user, token]);

  const fetchPastCases = async () => {
    try {
      const res = await fetch("/patient/cases", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPastCases(data);
      }
    } catch (e) { console.error(e); }
  };

  const showToast = (msg, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev.slice(-2), { id, msg, type }]); 
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const handleChange = (e) => setUserInfo({ ...userInfo, [e.target.id]: e.target.value });

  const handleFile = (file) => {
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreviewSrc(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return showToast("Please upload a skin image first.", "warn");
    if (!userInfo.name.trim() || !userInfo.age || !userInfo.symptoms.trim()) return showToast("Please fill in all required fields.", "warn");

    setIsLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("user_info", JSON.stringify(userInfo));

    try {
      const res = await fetch("/predict", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Prediction failed");

      setResult(data);
      showToast("✅ Analysis complete!", "success");
      fetchPastCases(); // refresh history
      setTimeout(() => document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const renderMedicines = (meds) => {
    if (!meds) {
      return <div className="med-card full-width"><p style={{ color: "var(--muted)" }}>No medication data available.</p></div>;
    }
    if (typeof meds === 'string') {
      return <div className="med-card full-width"><div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{meds}</div></div>;
    }
    if (Object.keys(meds).length === 0) {
      return <div className="med-card full-width"><p style={{ color: "var(--muted)" }}>No medication data available.</p></div>;
    }
    const cards = [];
    Object.entries(meds).forEach(([key, value]) => {
      if (key === 'monitoring' || key === 'caution') return;
      cards.push(
        <div className="med-card" key={key}>
          <div className="med-card-title">💊 {LABELS[key] || key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</div>
          {Array.isArray(value) ? <ul>{value.map((v, i) => <li key={i}>{v}</li>)}</ul> : <p>{value}</p>}
        </div>
      );
    });
    return (
      <>
        {cards}
        {meds.monitoring && <div className="med-monitoring"><strong>📊 Monitoring:</strong> {meds.monitoring}</div>}
        {meds.caution && <div className="med-caution"><strong>⚠️ Caution:</strong> {meds.caution}</div>}
      </>
    );
  };

  if (!user || user.role !== 'patient') {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '100px' }}>
        <Lock size={48} color="var(--teal)" style={{ marginBottom: '20px' }} />
        <h1 style={{ fontFamily: '"Syne", sans-serif', fontSize: '32px', marginBottom: '16px' }}>Login Required</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '30px' }}>You must be logged in as a patient to use the DermAI analyzer.</p>
        <Link to="/login" className="submit-btn" style={{ maxWidth: '200px', margin: '0 auto', display: 'inline-flex', textDecoration: 'none' }}>Go to Login</Link>
      </div>
    );
  }

  return (
    <>
      <section className="hero" id="home">
        <div className="hero-badge"><span>🩺</span> AI-Powered Dermatology</div>
        <h1>Skin Condition<br/><span>Analyzer</span></h1>
        <p>Upload a photo of the affected area, describe your symptoms, and receive an instant AI-powered analysis with treatment guidelines.</p>
      </section>

      <main className="main-section" id="analyze">
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="card">
            <div className="card-header">
              <div className="card-icon"><User size={20} /></div>
              <div><h2>Patient Information</h2><p>Tell us a bit about yourself</p></div>
            </div>
            <div className="card-body">
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="name">Full Name <span className="req">★ required</span></label>
                  <div className="input-wrap">
                    <User className="input-icon" size={18} />
                    <input type="text" id="name" required placeholder="e.g. Srikar" value={userInfo.name} onChange={handleChange} />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="age">Age <span className="req">★ required</span></label>
                  <div className="input-wrap">
                    <Activity className="input-icon" size={18} />
                    <input type="number" id="age" required min="1" max="120" placeholder="e.g. 24" value={userInfo.age} onChange={handleChange} />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="phone">Phone Number <span className="opt">optional</span></label>
                  <div className="input-wrap">
                    <Phone className="input-icon" size={18} />
                    <input type="tel" id="phone" placeholder="e.g. +91 98765 43210" value={userInfo.phone} onChange={handleChange} />
                  </div>
                </div>
                <div className="field span-2">
                  <label htmlFor="symptoms">Symptoms <span className="req">★ required</span></label>
                  <div className="input-wrap">
                    <FileText className="input-icon textarea-icon" size={18} />
                    <textarea id="symptoms" required placeholder="Describe your symptoms" value={userInfo.symptoms} onChange={handleChange}></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-icon"><ImageIcon size={20} /></div>
              <div><h2>Skin Image</h2><p>Upload a clear, well-lit close-up photo of the affected area</p></div>
            </div>
            <div className="card-body">
              {!selectedFile ? (
                <div className={`upload-zone ${isDragging ? 'drag-over' : ''}`} onClick={() => fileInputRef.current?.click()} onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop}>
                  <div className="upload-icon-wrap"><Upload size={24} /></div>
                  <div className="upload-title">Click or drag & drop your photo here</div>
                  <input type="file" ref={fileInputRef} className="file-input" accept="image/*" onChange={(e) => handleFile(e.target.files[0])} />
                </div>
              ) : (
                <div className="upload-success">
                  <div className="success-top">
                    <div className="success-info">
                      <div className="success-badge"><CheckCircle size={16} /></div>
                      <div>
                        <div className="success-label">Image uploaded successfully</div>
                        <div className="success-filename">{selectedFile.name}</div>
                      </div>
                    </div>
                    <button type="button" className="change-btn" onClick={() => { setSelectedFile(null); setPreviewSrc(''); }}>
                      <RefreshCw size={14} style={{ display: 'inline', marginRight: 4 }} /> Change
                    </button>
                  </div>
                  <div className="preview-wrap"><img src={previewSrc} alt="Preview" className="previewImg" /></div>
                </div>
              )}
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? <div className="btn-spinner"></div> : <><Activity size={18} /> Analyze Now</>}
          </button>
        </form>

        <AnimatePresence>
          {result && (
            <motion.div id="results-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="card" style={{ marginTop: "32px", border: '2px solid var(--teal)' }}>
                <div className="result-header">
                  <div className="result-icon"><Activity size={24} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "var(--teal)", marginBottom: "4px" }}>Predicted Condition</div>
                    <div className="result-disease">{result.disease}</div>
                    <span style={{ display: 'inline-block', background: '#fffbeb', color: '#d97706', padding: '4px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: '600', marginTop: '6px' }}>Status: {result.status}</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <div className="card-icon"><HeartPulse size={20} /></div>
                  <div><h2>Treatment Protocol</h2><p>Reference guidelines, pending doctor approval</p></div>
                </div>
                <div className="medicines-body">
                  <div className="med-intro">⚠️ These are <strong>reference guidelines only</strong>. Always follow your dermatologist's prescription. Do not self-medicate.</div>
                  <div className="med-grid">
                    {renderMedicines(result.medicines)}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {pastCases.length > 0 && (
          <div className="card" style={{ marginTop: '50px' }}>
            <div className="card-header">
              <h2>Your Past Consultations</h2>
            </div>
            <div style={{ padding: '20px' }}>
              {pastCases.map(c => (
                <div key={c._id} style={{ borderBottom: '1px solid var(--border)', padding: '16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '600' }}>{c.predicted_disease}</h4>
                    <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>Date: {new Date(c.created_at).toLocaleDateString()}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {c.approved_by_doctor ? (
                      <>
                        <span style={{ background: '#f0fdfa', color: '#059669', padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: '600' }}>Approved by Doctor</span>
                        <button onClick={() => setShowPrescription(c)} style={{ background: 'var(--teal)', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>View Prescription</button>
                      </>
                    ) : (
                      <span style={{ background: '#fffbeb', color: '#d97706', padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: '600' }}>Pending Approval</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Prescription Modal */}
      {showPrescription && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderRadius: '16px 16px 0 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={24} color="var(--teal)" />
                <h2 style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: 'var(--teal)', margin: 0 }}>DermAI Prescription</h2>
              </div>
              <button onClick={() => setShowPrescription(null)} style={{ background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: 'var(--muted)', lineHeight: '1' }}>&times;</button>
            </div>
            
            <div style={{ padding: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--border)', paddingBottom: '20px', marginBottom: '20px' }}>
                <div style={{ fontSize: '14px' }}>
                  <p style={{ margin: '0 0 6px' }}><strong>Patient:</strong> {showPrescription.patient_info?.name || 'Unknown'}</p>
                  <p style={{ margin: '0 0 6px' }}><strong>Age:</strong> {showPrescription.patient_info?.age}</p>
                  <p style={{ margin: '0' }}><strong>Contact:</strong> {showPrescription.patient_info?.phone || 'N/A'}</p>
                </div>
                <div style={{ fontSize: '14px', textAlign: 'right' }}>
                  <p style={{ margin: '0 0 6px' }}><strong>Date:</strong> {new Date(showPrescription.created_at).toLocaleDateString()}</p>
                  <p style={{ margin: '0 0 6px' }}><strong>Case ID:</strong> {showPrescription._id.substring(0,8).toUpperCase()}</p>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--ink)', marginBottom: '8px' }}>Diagnosis</h3>
                <p style={{ fontSize: '16px', color: 'var(--teal)', fontWeight: '600', margin: 0 }}>{showPrescription.predicted_disease}</p>
              </div>

              <div>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px', fontWeight: '700', color: 'var(--ink)', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                  <span style={{ fontSize: '24px', fontFamily: 'serif', fontStyle: 'italic', fontWeight: 'bold' }}>Rx</span> Recommendations
                </h3>
                <div style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--ink-soft)' }}>
                  {typeof showPrescription.medicines_recommended === 'string' ? (
                     <div style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                       {showPrescription.medicines_recommended}
                     </div>
                  ) : (
                    Object.entries(showPrescription.medicines_recommended || {}).map(([key, value]) => {
                      if (key === 'monitoring' || key === 'caution') return null;
                      return (
                        <div key={key} style={{ marginBottom: '16px' }}>
                          <strong style={{ display: 'block', color: 'var(--ink)', marginBottom: '4px' }}>• {LABELS[key] || key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</strong>
                          {Array.isArray(value) ? (
                            <ul style={{ margin: '0', paddingLeft: '20px' }}>
                              {value.map((v, i) => <li key={i}>{v}</li>)}
                            </ul>
                          ) : (
                            <p style={{ margin: '0', paddingLeft: '8px' }}>{value}</p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
                
                {typeof showPrescription.medicines_recommended !== 'string' && showPrescription.medicines_recommended?.caution && (
                  <div style={{ marginTop: '20px', padding: '12px 16px', background: '#fffbeb', borderLeft: '4px solid #f59e0b', borderRadius: '4px', fontSize: '13px', color: '#78350f' }}>
                    <strong>Caution:</strong> {showPrescription.medicines_recommended.caution}
                  </div>
                )}
              </div>
            </div>

            <div style={{ padding: '24px 30px', background: '#f8fafc', borderTop: '1px solid var(--border)', borderRadius: '0 0 16px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                 <p style={{ margin: 0 }}>Digitally signed valid prescription.</p>
                 <p style={{ margin: '4px 0 0' }}>Consulting Doctor ID: {showPrescription.doctor_id?.substring(0,8).toUpperCase()}</p>
               </div>
               <button onClick={() => window.print()} style={{ background: 'white', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                 Print PDF
               </button>
            </div>
          </div>
        </div>
      )}

      <div className="toast-container">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div key={t.id} className={`toast ${t.type}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.2 } }}>
              {t.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Home;
