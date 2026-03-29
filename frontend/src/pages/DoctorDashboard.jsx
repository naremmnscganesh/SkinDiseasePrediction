import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, CheckCircle, Clock, FileText, Activity } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const DoctorDashboard = () => {
  const { user, token } = useAuth();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  
  // To hold edited medicines structure (simplified to a text area for approval here)
  const [editedMeds, setEditedMeds] = useState('');

  if (!user || user.role !== 'doctor') {
    return <Navigate to="/" />;
  }

  const fetchCases = async () => {
    try {
      const res = await fetch("/doctor/cases", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setCases(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [token]);

  const openCaseModal = async (c) => {
    setSelectedCase(c);
    
    let readableMeds = "";
    if (typeof c.medicines_recommended === 'object' && c.medicines_recommended !== null) {
       Object.entries(c.medicines_recommended).forEach(([k, v]) => {
         const label = k.replace(/_/g, " ").toUpperCase();
         readableMeds += `[${label}]\n`;
         if (Array.isArray(v)) readableMeds += v.map(item => `• ${item}`).join('\n');
         else readableMeds += v;
         readableMeds += '\n\n';
       });
       setEditedMeds(readableMeds.trim());
    } else {
       setEditedMeds(c.medicines_recommended || "");
    }

    setImageSrc(null);
    
    // Fetch AES-encrypted image which backend decrypts from MongoDB
    try {
      const res = await fetch(`/images/${c._id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        setImageSrc(URL.createObjectURL(blob));
      } else {
        setImageSrc(null);
      }
    } catch (error) {
       setImageSrc(null);
    }
  };

  const closeCaseModal = () => {
    setSelectedCase(null);
    setImageSrc(null);
  };

  const approveCase = async () => {
    try {
      const res = await fetch(`/doctor/cases/${selectedCase._id}/approve`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ medicines_recommended: editedMeds })
      });
      if (res.ok) {
        closeCaseModal();
        fetchCases();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--teal)', padding: '10px', borderRadius: '12px', color: 'white', display: 'flex' }}>
          <Stethoscope size={28} />
        </div>
        <div>
          <h1 style={{ fontFamily: '"Syne", sans-serif', fontSize: '24px', letterSpacing: '-0.5px' }}>Doctor Portal</h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Review patient cases and approve AI recommendations</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Patient Cases Queue</h2>
        </div>
        <div style={{ padding: '0 20px' }}>
          {loading ? <p style={{ padding: '20px', textAlign: 'center' }}>Loading cases...</p> : (
            cases.length === 0 ? <p style={{ padding: '20px', textAlign: 'center' }}>No cases found.</p> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', padding: '20px 0' }}>
                {cases.map(c => (
                  <div key={c._id} onClick={() => openCaseModal(c)} style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', background: 'white', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ fontWeight: '600', fontSize: '15px' }}>{c.patient_info?.name || 'Unknown Patient'}</div>
                      {c.approved_by_doctor ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f0fdfa', color: '#059669', padding: '4px 8px', borderRadius: '100px', fontSize: '11px', fontWeight: '600' }}><CheckCircle size={12}/> Approved</span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fffbeb', color: '#d97706', padding: '4px 8px', borderRadius: '100px', fontSize: '11px', fontWeight: '600' }}><Clock size={12}/> Pending</span>
                      )}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '8px' }}>
                      <strong>Symptoms:</strong> {c.patient_info?.symptoms?.substring(0, 50)}...
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--ink)' }}>
                      <Activity size={14} color="var(--teal)" />
                      <strong>AI Prediction:</strong> {c.predicted_disease}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {selectedCase && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'var(--bg)', borderRadius: '16px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', borderRadius: '16px 16px 0 0' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Review Case</h2>
              <button onClick={closeCaseModal} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--muted)' }}>&times;</button>
            </div>
            
            <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <h3 style={{ fontSize: '14px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Patient Info (AES Decrypted)</h3>
                <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '20px', fontSize: '14px' }}>
                  <p><strong>Name:</strong> {selectedCase.patient_info?.name}</p>
                  <p><strong>Age:</strong> {selectedCase.patient_info?.age}</p>
                  <p><strong>Phone:</strong> {selectedCase.patient_info?.phone || 'N/A'}</p>
                  <p><strong>Symptoms:</strong> {selectedCase.patient_info?.symptoms}</p>
                </div>

                <h3 style={{ fontSize: '14px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>AI Prediction</h3>
                <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '14px' }}>
                  <p><strong>Disease:</strong> <span style={{ color: 'var(--teal)', fontWeight: '700' }}>{selectedCase.predicted_disease}</span></p>
                  <p><strong>Confidence:</strong> {selectedCase.confidence.toFixed(1)}%</p>
                  <p><strong>Symptom Match:</strong> {selectedCase.match_score}</p>
                </div>
              </div>
              
              <div>
                <h3 style={{ fontSize: '14px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Skin Image</h3>
                <div style={{ background: '#e2e8f0', height: '200px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid var(--border)', marginBottom: '20px' }}>
                  {imageSrc ? <img src={imageSrc} style={{ width: '100%', height: '100%', objectFit: 'contain', background: 'black' }} /> : <div className="btn-spinner" style={{ borderColor: 'var(--teal)', borderTopColor: 'transparent' }}></div>}
                </div>

                <h3 style={{ fontSize: '14px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Edit / Approve Medicines (Prescription)</h3>
                <textarea 
                  value={editedMeds} 
                  onChange={(e) => setEditedMeds(e.target.value)}
                  style={{ width: '100%', height: '240px', fontFamily: 'inherit', fontSize: '14px', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', lineHeight: '1.5' }}
                />
              </div>
            </div>
            
            <div style={{ padding: '20px', borderTop: '1px solid var(--border)', background: 'white', borderRadius: '0 0 16px 16px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={closeCaseModal}
                style={{ padding: '10px 20px', background: 'white', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
              >
                Cancel
              </button>
              <button 
                onClick={approveCase}
                style={{ padding: '10px 20px', background: 'var(--teal)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <CheckCircle size={18} /> Approve Treatment Protocol
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
