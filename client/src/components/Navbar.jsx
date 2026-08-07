import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const isLogin = location.pathname === '/login';

  const scrollToForm = () => {
    if (window.innerWidth <= 900) {
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <GraduationCap size={28} />
          <span>MsbteMCQ</span>
        </Link>
        <div className="navbar-links">
          <Link 
            to="/login" 
            className={`nav-link nav-btn nav-btn-outline ${isLogin ? 'active' : ''}`}
            onClick={scrollToForm}
          >
            Log in
          </Link>
          <Link 
            to="/signup" 
            className={`nav-link nav-btn ${!isLogin && location.pathname !== '/' ? 'active' : ''}`}
            onClick={scrollToForm}
          >
            Sign up
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
