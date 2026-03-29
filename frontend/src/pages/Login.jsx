import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }
      
      login(data.access_token, data.user);
      
      if (data.user.role === 'admin') navigate('/admin');
      else if (data.user.role === 'doctor') navigate('/doctor');
      else navigate('/');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '100px' }}>
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'center', background: 'var(--teal-dim)' }}>
          <div className="card-icon"><LogIn size={20} /></div>
          <div><h2>Welcome Back</h2><p>Login to your account</p></div>
        </div>
        <div className="card-body">
          {error && <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="field" style={{ marginBottom: '16px' }}>
              <label htmlFor="email">Email Address</label>
              <div className="input-wrap">
                <Mail className="input-icon" size={18} />
                <input type="email" id="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <div className="field" style={{ marginBottom: '24px' }}>
              <label htmlFor="password">Password</label>
              <div className="input-wrap">
                <Lock className="input-icon" size={18} />
                <input type="password" id="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? <div className="btn-spinner"></div> : "Sign In"}
            </button>
          </form>
          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--muted)' }}>
            Don't have an account? <Link to="/register" style={{ color: 'var(--teal)', fontWeight: '600', textDecoration: 'none' }}>Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
