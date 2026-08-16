import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Code, ArrowRight, BookOpen, Target, Layers, Loader } from 'lucide-react';
import './Subjects.css';

const API_BASE = 'https://msbtemcq-hub.onrender.com/api';

// Color class rotation for subjects without one set
const colorClasses = ['premium-blue', 'premium-purple', 'premium-orange'];

const Subjects = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/subjects`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to fetch subjects');
        const data = await res.json();
        setSubjects(data); // subject are fethed while try conditon turns false;
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);
// to filter out subject
  const filtered = subjects.filter((subject) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      subject.title.toLowerCase().includes(query) ||
      subject.code.toLowerCase().includes(query)
    );      
  });

  return (
    <div className="subjects-container">
      <div className="subjects-header">
        <div className="badge-premium">Exclusive Access</div>
        <h1>Premium Learning Paths</h1>
        <p>Expertly curated, exam-oriented MCQs designed to help you ace your MSBTE examinations.</p>
        
        <div className="search-bar">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search for your subject (e.g. ETI, Environmental Studies)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="contributor-marquee-wrapper">
          <div className="marquee-text-container">
            <div className="marquee-content">
              <span>🚀 Want to be a contributor to MCQ Data Sources and Resources? Contact Admin!</span>
              <span>🚀 Want to be a contributor to MCQ Data Sources and Resources? Contact Admin!</span>
            </div>
          </div>
          <button className="marquee-contact-btn" onClick={() => navigate('/contact')}>Contact</button>
        </div>
      </div>

      {loading ? (
        <div className="subjects-loading">
          <Loader size={32} className="spinner-icon" />
          <p>Loading subjects...</p>
        </div>
      ) : error ? (
        <div className="subjects-empty">
          <p>{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="subjects-empty">
          {searchQuery ? (
            <>
              <Search size={40} />
              <h3>No subjects match "{searchQuery}"</h3>
              <p>Try a different search term.</p>
            </>
          ) : (
            <>
              <BookOpen size={40} />
              <h3>No subjects available yet</h3>
              <p>Subjects will appear here once an admin creates them.</p>
            </>
          )}
        </div>
      ) : (
        <div className="premium-subjects-grid">
          {filtered.map((subject, index) => (
            <div
              className={`premium-card ${subject.colorClass || colorClasses[index % colorClasses.length]}`}
              key={subject.id}
            >
              <div className="discount-ribbon"><span>{subject.totalQuestions} MCQs</span></div>
              <div className="card-glow"></div>
              
              <div className="card-header" style={{ justifyContent: 'flex-end' }}>
                <div className="badge-pro">{subject.code}</div>
              </div>
              
              <div className="card-content">
                <h3>{subject.title}</h3>
              </div>
              
              <div className="card-footer">
                <button 
                  className="premium-btn" 
                  onClick={() => navigate(`/subjects/${subject.id}`)}
                >
                  <span>Start Learning</span>
                  <ArrowRight size={18} className="btn-icon" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Subjects;
