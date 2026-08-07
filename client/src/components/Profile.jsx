import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, Award, Shield } from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState({
    name: 'Student',
    email: 'student@example.com',
    joinDate: 'August 2026',
    rank: 'Intermediate',
    points: 1250
  });

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Your Profile</h1>
        <p>Manage your account settings and view your progress.</p>
      </div>

      <div className="profile-content">
        <div className="profile-sidebar">
          <div className="user-avatar">
            <User size={64} color="white" />
          </div>
          <h2>{user.name}</h2>
          <p className="user-email">{user.email}</p>
          <button className="edit-btn">Edit Profile</button>
        </div>

        <div className="profile-details">
          <div className="details-section">
            <h3>Account Information</h3>
            
            <div className="info-grid">
              <div className="info-box">
                <div className="info-icon"><Mail size={20} /></div>
                <div>
                  <label>Email Address</label>
                  <p>{user.email}</p>
                </div>
              </div>
              
              <div className="info-box">
                <div className="info-icon"><Calendar size={20} /></div>
                <div>
                  <label>Member Since</label>
                  <p>{user.joinDate}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="details-section">
            <h3>Gamification Stats</h3>
            
            <div className="info-grid">
              <div className="info-box highlight">
                <div className="info-icon text-yellow"><Award size={20} /></div>
                <div>
                  <label>Total Points</label>
                  <p className="big-stat">{user.points}</p>
                </div>
              </div>
              
              <div className="info-box highlight">
                <div className="info-icon text-purple"><Shield size={20} /></div>
                <div>
                  <label>Current Rank</label>
                  <p className="big-stat">{user.rank}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
