import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Stethoscope } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'patient' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const res = await fetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }
      
      setSuccess(data.message);
      if (formData.role === 'patient') {
        setTimeout(() => navigate('/login'), 2000);
      }
      // Doctors need admin approval, so they wait on the page reading the success message.
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '60px' }}>
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'center', background: 'var(--teal-dim)' }}>
          <div className="card-icon"><UserPlus size={20} /></div>
          <div><h2>Create Account</h2><p>Join DermAI</p></div>
        </div>
        <div className="card-body">
          {error && <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>{error}</div>}
          {success && <div style={{ color: '#065f46', backgroundColor: '#f0fdfa', border: '1px solid #a7f3d0', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>{success}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="field" style={{ marginBottom: '16px' }}>
              <label htmlFor="name">Full Name</label>
              <div className="input-wrap">
                <User className="input-icon" size={18} />
                <input type="text" id="name" required placeholder="John Doe" value={formData.name} onChange={handleChange} />
              </div>
            </div>
            <div className="field" style={{ marginBottom: '16px' }}>
              <label htmlFor="email">Email Address</label>
              <div className="input-wrap">
                <Mail className="input-icon" size={18} />
                <input type="email" id="email" required placeholder="you@example.com" value={formData.email} onChange={handleChange} />
              </div>
            </div>
            <div className="field" style={{ marginBottom: '16px' }}>
              <label htmlFor="password">Password</label>
              <div className="input-wrap">
                <Lock className="input-icon" size={18} />
                <input type="password" id="password" required placeholder="••••••••" value={formData.password} onChange={handleChange} />
              </div>
            </div>
            <div className="field" style={{ marginBottom: '24px' }}>
               <label htmlFor="role">Role</label>
               <select 
                 id="role" 
                 value={formData.role} 
                 onChange={handleChange}
                 style={{ width: '100%', padding: '11px 13px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '15px', fontFamily: '"DM Sans", sans-serif', outline: 'none', background: 'var(--bg)' }}
               >
                 <option value="patient">Patient</option>
                 <option value="doctor">Doctor</option>
               </select>
               {formData.role === 'doctor' && (
                 <p style={{ fontSize: '11px', color: 'var(--warn)', marginTop: '4px' }}>Doctors require admin approval before logging in.</p>
               )}
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? <div className="btn-spinner"></div> : "Register"}
            </button>
          </form>
          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--muted)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--teal)', fontWeight: '600', textDecoration: 'none' }}>Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
