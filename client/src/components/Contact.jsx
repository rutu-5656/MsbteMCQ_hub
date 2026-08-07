import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import './Contact.css';

const Contact = () => {
  return (
    <div className="contact-container">
      <div className="contact-header">
        <h1>Get in Touch</h1>
        <p>Have questions about MsbteMCQ? We are here to help you ace your exams!</p>
      </div>

      <div className="contact-content">
        <div className="contact-info">
          <h2>Contact Information</h2>
          <p>Fill out the form and our team will get back to you within 24 hours.</p>
          
          <div className="info-items">
            <div className="info-item">
              <Mail className="info-icon" />
              <div>
                <h3>Email Us</h3>
                <p>support@msbtemcq.edu</p>
              </div>
            </div>
            <div className="info-item">
              <Phone className="info-icon" />
              <div>
                <h3>Call Us</h3>
                <p>+91 (800) 123-4567</p>
              </div>
            </div>
            <div className="info-item">
              <MapPin className="info-icon" />
              <div>
                <h3>Headquarters</h3>
                <p>Mumbai, Maharashtra, India</p>
              </div>
            </div>
          </div>
        </div>

        <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label>Your Name</label>
            <input type="text" placeholder="e.g. Rahul Sharma" required />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" placeholder="rahul@example.com" required />
          </div>
          <div className="form-group">
            <label>Subject / Branch</label>
            <input type="text" placeholder="e.g. FYCO Semester 2" required />
          </div>
          <div className="form-group">
            <label>Message</label>
            <textarea placeholder="How can we help you?" rows="5" required></textarea>
          </div>
          <button type="submit" className="submit-btn">
            Send Message <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
