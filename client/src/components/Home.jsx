import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Target, Award, Users } from 'lucide-react';
import './Home.css';

const Home = () => {
  const token = localStorage.getItem('token');
  
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="badge">🚀 The #1 App for MSBTE Students</div>
          <h1>Master Your Diploma with <span className="highlight">MsbteMCQ</span></h1>
          <p>
            Ace your MSBTE online exams with our massive database of exam-oriented MCQs for FYCO, FYME, and all other branches. Study smarter, not harder.
          </p>
          <div className="hero-buttons">
            <Link to="/signup" className="btn btn-primary">
              Start Learning for Free <ArrowRight size={20} />
            </Link>
            <Link to="/login" className="btn btn-secondary">
              I already have an account
            </Link>
          </div>
        </div>
        
        {/* Decorative elements representing learning */}
        <div className="hero-visual">
          <div className="floating-card top-left">
            <BookOpen size={24} className="icon-blue" />
            <span>2000+ MCQs</span>
          </div>
          <div className="floating-card bottom-right">
            <Target size={24} className="icon-green" />
            <span>Real Exam Patterns</span>
          </div>
          <div className="floating-card top-right">
            <Award size={24} className="icon-purple" />
            <span>Top Scorers Choice</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header center">
          <h2>Why Choose MsbteMCQ?</h2>
          <p>Everything you need to score 90%+ in your online multiple-choice exams.</p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon bg-blue">
              <BookOpen size={32} />
            </div>
            <h3>Branch Specific</h3>
            <p>From Computer Engineering to Mechanical, we have meticulously categorized questions for every MSBTE branch and semester.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon bg-green">
              <Target size={32} />
            </div>
            <h3>Exam Oriented</h3>
            <p>Our questions are hand-picked from previous year papers and official MSBTE question banks.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon bg-purple">
              <Users size={32} />
            </div>
            <h3>Community Driven</h3>
            <p>Join thousands of diploma students studying together, competing on leaderboards, and sharing study resources.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to crack your next paper?</h2>
          <p>Create your free account today and start practicing immediately.</p>
          <Link to="/signup" className="btn btn-primary white">
            Join MsbteMCQ Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
