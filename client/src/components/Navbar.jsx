import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap, LogOut } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;
  
  const isLoginPath = location.pathname === '/login';

  const scrollToForm = () => {
    if (window.innerWidth <= 900) {
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to={isLoggedIn ? "/dashboard" : "/"} className="navbar-logo">
          <GraduationCap size={28} />
          <span>MsbteMCQ</span>
        </Link>
        <div className="navbar-links">
          {isLoggedIn ? (
            <>
              
              <Link to="/subjects" className="nav-link">Subjects</Link>
              <Link to="/resources" className="nav-link">Resources</Link>
              <Link to="/profile" className="nav-link">Profile</Link>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              {localStorage.getItem('userRole') === 'admin' && (
                <Link to="/admin" className="nav-link" style={{ color: '#f43f5e', fontWeight: 700 }}>Admin</Link>
              )}
              <button className="nav-btn nav-btn-outline" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem' }}>
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/contact" className="nav-link">Contact Us</Link>
              <Link 
                to="/signup" 
                className="nav-link nav-btn"
                style={{ marginLeft: '1rem' }}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
