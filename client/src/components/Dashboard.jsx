import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Trophy, Target, Clock, BookOpen, ChevronRight, PlayCircle, Loader } from 'lucide-react';
import './Dashboard.css';

const API_DASHBOARD = 'https://msbtemcq-hub.onrender.com/api/users/dashboard';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const res = await fetch(API_DASHBOARD, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem('token');
            navigate('/login');
            return;
          }
          throw new Error('Failed to load dashboard data');
        }
        
        const data = await res.json();
        setDashboardData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds} sec`;
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins} mins`;
    const hrs = (mins / 60).toFixed(1);
    return `${hrs} hrs`;
  };

  const getRelativeTime = (dateString) => {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const diffDays = Math.round((new Date(dateString) - new Date()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      const diffHours = Math.round((new Date(dateString) - new Date()) / (1000 * 60 * 60));
      if (diffHours === 0) return 'Just now';
      return rtf.format(diffHours, 'hour');
    }
    return rtf.format(diffDays, 'day');
  };

  if (loading) {
    return (
      <div className="dashboard-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 70px)' }}>
        <Loader size={40} className="spinner-icon" />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="dashboard-container" style={{ textAlign: 'center', paddingTop: '5rem' }}>
        <h2>Error loading dashboard data</h2>
        <button className="nav-btn primary" onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  const { userName, stats, recentActivity, recommended } = dashboardData;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Welcome back, {userName}! 👋</h1>
          <p>Ready to conquer your next exam? Here is your progress so far.</p>
        </div>
        <button className="start-test-btn" onClick={() => navigate('/subjects')}>
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
            <h3>{stats.totalTests}</h3>
            <p>Total Tests Taken</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon-wrapper green">
            <Target size={24} className="stat-icon" />
          </div>
          <div className="stat-info">
            <h3>{stats.averageAccuracy}%</h3>
            <p>Average Accuracy</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper purple">
            <BookOpen size={24} className="stat-icon" />
          </div>
          <div className="stat-info">
            <h3>{stats.questionsAnswered}</h3>
            <p>Questions Answered</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper orange">
            <Clock size={24} className="stat-icon" />
          </div>
          <div className="stat-info">
            <h3>{formatTime(stats.timeSpentLearning)}</h3>
            <p>Time Spent Learning</p>
          </div>
        </div>
      </section>

      <div className="dashboard-main-content">
        <section className="recent-activity">
          <div className="section-header">
            <h2>Recent Test History</h2>

          </div>
          
          <div className="activity-list">
            {recentActivity.length === 0 ? (
              <div className="activity-item" style={{ justifyContent: 'center', padding: '2rem', color: '#64748b' }}>
                No recent tests. Time to take one!
              </div>
            ) : (
              recentActivity.map(activity => {
                const percentage = Math.round((activity.score / activity.totalQs) * 100);
                const scoreClass = percentage >= 80 ? 'success' : percentage >= 50 ? 'warning' : 'danger';
                
                return (
                  <div className="activity-item" key={activity.id}>
                    <div className="activity-details">
                      <h4>{activity.subjectTitle}</h4>
                      <p>Completed {getRelativeTime(activity.completedAt)}</p>
                    </div>
                    <div className={`activity-score ${scoreClass}`}>
                      {activity.score} / {activity.totalQs}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="recommended-subjects">
          <div className="section-header">
            <h2>Recommended for You</h2>
          </div>
          <div className="subject-cards">
            {recommended.length === 0 ? (
              <p style={{ color: '#64748b' }}>No recommendations at this time.</p>
            ) : (
              recommended.map(sub => (
                <div className="subject-card" key={sub.id} onClick={() => navigate(`/subjects/${sub.id}`)} style={{ cursor: 'pointer' }}>
                  <div className="subject-icon programming">{sub.icon}</div>
                  <h4>{sub.title}</h4>
                  <p>{sub.questionsCount}+ Questions</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
