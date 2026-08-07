import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Target, Clock, BookOpen, ChevronRight, PlayCircle } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Student');

  useEffect(() => {
    // Simple authentication check
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
    // In a real app, we would decode the JWT or fetch user details from backend here
  }, [navigate]);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Welcome back, {userName}! 👋</h1>
          <p>Ready to conquer your next exam? Here is your progress so far.</p>
        </div>
        <button className="start-test-btn">
          <PlayCircle size={20} />
          Start New Test
        </button>
      </header>

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper blue">
            <Trophy size={24} className="stat-icon" />
          </div>
          <div className="stat-info">
            <h3>12</h3>
            <p>Total Tests Taken</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon-wrapper green">
            <Target size={24} className="stat-icon" />
          </div>
          <div className="stat-info">
            <h3>85%</h3>
            <p>Average Accuracy</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper purple">
            <BookOpen size={24} className="stat-icon" />
          </div>
          <div className="stat-info">
            <h3>240</h3>
            <p>Questions Answered</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper orange">
            <Clock size={24} className="stat-icon" />
          </div>
          <div className="stat-info">
            <h3>4.5 hrs</h3>
            <p>Time Spent Learning</p>
          </div>
        </div>
      </section>

      <div className="dashboard-main-content">
        <section className="recent-activity">
          <div className="section-header">
            <h2>Recent Test History</h2>
            <button className="view-all-btn">View All <ChevronRight size={16}/></button>
          </div>
          
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-details">
                <h4>Data Structures</h4>
                <p>Completed 2 hours ago</p>
              </div>
              <div className="activity-score success">
                18 / 20
              </div>
            </div>

            <div className="activity-item">
              <div className="activity-details">
                <h4>Database Management Systems</h4>
                <p>Completed yesterday</p>
              </div>
              <div className="activity-score warning">
                14 / 20
              </div>
            </div>

            <div className="activity-item">
              <div className="activity-details">
                <h4>Operating Systems</h4>
                <p>Completed 3 days ago</p>
              </div>
              <div className="activity-score success">
                19 / 20
              </div>
            </div>
          </div>
        </section>

        <section className="recommended-subjects">
          <div className="section-header">
            <h2>Recommended for You</h2>
          </div>
          <div className="subject-cards">
            <div className="subject-card">
              <div className="subject-icon programming">💻</div>
              <h4>Java Programming</h4>
              <p>150+ Questions</p>
            </div>
            <div className="subject-card">
              <div className="subject-icon network">🌐</div>
              <h4>Computer Networks</h4>
              <p>200+ Questions</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
