import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <span className="logo-dot"></span>DermAI
      </Link>
      <ul className="nav-links">
        {user?.role === 'admin' ? (
          <li><Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>Admin Portal</Link></li>
        ) : user?.role === 'doctor' ? (
          <li><Link to="/doctor" className={location.pathname === '/doctor' ? 'active' : ''}>Cases Queue</Link></li>
        ) : (
          <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home/Analyze</Link></li>
        )}
        
        <li>
          <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>About Model</Link>
        </li>
        <li>
          <Link to="/diseases" className={location.pathname === '/diseases' ? 'active' : ''}>Skin Conditions</Link>
        </li>
        <li>
          <a href="https://huggingface.co/spaces/srikarp/dermiq-rag" target="_blank" rel="noopener noreferrer" className="chat-link">
            🩺 Dr. Derm Chat
          </a>
        </li>
        
        {user ? (
          <li style={{ marginLeft: '12px' }}>
            <button 
              onClick={handleLogout} 
              style={{ background: 'var(--border)', color: 'var(--ink)', padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <LogOut size={14} /> Logout
            </button>
          </li>
        ) : (
          <li style={{ marginLeft: '12px' }}>
            <Link to="/login" style={{ background: 'var(--teal)', color: 'white', padding: '6px 14px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>Login</Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
