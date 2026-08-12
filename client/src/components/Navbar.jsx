import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap, LogOut, Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to={isLoggedIn ? "/dashboard" : "/"} className="navbar-logo" onClick={closeMobileMenu}>
          <GraduationCap size={28} />
          <span>MsbteMCQ</span>
        </Link>
        
        <div className="navbar-mobile-controls">
          {!isLoggedIn && (
            <Link 
              to="/signup" 
              className="nav-btn get-started-btn mobile-get-started"
              onClick={closeMobileMenu}
            >
              Get Started
            </Link>
          )}
          <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div className={`navbar-links ${isMobileMenuOpen ? 'active' : ''}`}>
          {isLoggedIn ? (
            <>
              <Link to="/subjects" className="nav-link" onClick={closeMobileMenu}>Subjects</Link>
              <Link to="/resources" className="nav-link" onClick={closeMobileMenu}>Resources</Link>
              <Link to="/profile" className="nav-link" onClick={closeMobileMenu}>Profile</Link>
              <Link to="/dashboard" className="nav-link" onClick={closeMobileMenu}>Dashboard</Link>
              {localStorage.getItem('userRole') === 'admin' && (
                <Link to="/admin" className="nav-link" onClick={closeMobileMenu} style={{ color: '#f43f5e', fontWeight: 700 }}>Admin</Link>
              )}
              <button className="nav-btn nav-btn-outline logout-btn" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/" className="nav-link" onClick={closeMobileMenu}>Home</Link>
              <Link to="/contact" className="nav-link" onClick={closeMobileMenu}>Contact Us</Link>
              <Link 
                to="/signup" 
                className="nav-link nav-btn get-started-btn"
                onClick={closeMobileMenu}
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
