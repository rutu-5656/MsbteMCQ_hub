import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import tufLogo from '../../IMGs/tuf logo.png';
import './Footer.css';

const GithubIcon = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a5.5 5.5 0 0 0-1.5-3.8 5.5 5.5 0 0 0-.1-3.8s-1.2-.4-3.9 1.4a13.4 13.4 0 0 0-7 0C6.2 3.7 5 4.1 5 4.1a5.5 5.5 0 0 0-.1 3.8 5.5 5.5 0 0 0-1.5 3.8c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4"></path><path d="M9 18c-4.5 1.5-5-2.5-7-3"></path>
  </svg>
);

const LinkedinIcon = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const InstagramIcon = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const Footer = () => {
  const location = useLocation();

  // Hide footer on the admin page
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content-left">
          <Link to="/" className="footer-logo">
            <img src={tufLogo} alt="Logo" className="footer-logo-img" style={{ height: '40px', width: 'auto' }} />
          </Link>
          
          <p className="footer-description">
            The #1 platform for MSBTE diploma students to master their exams with real exam patterns and high-quality MCQs.
          </p>
          
          <p className="copyright">
            Copyright &copy; {new Date().getFullYear()} MsbteMCQ. All Rights Reserved. <br/>
            Designed & Developed by <span className="developer-name">Ruturaj Jadhav</span>
          </p>
        </div>
        
        <div className="footer-content-right">
          <div className="social-links">
            <a href="https://github.com/rutu-5656" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <GithubIcon size={24} />
            </a>
            <a href="https://www.linkedin.com/in/ruturajjadhav38/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <LinkedinIcon size={24} />
            </a>
            <a href="https://www.instagram.com/ruturaj_2634/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <InstagramIcon size={24} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
