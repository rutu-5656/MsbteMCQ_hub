import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navbar from './components/Navbar';
import Auth from './components/Auth';
import './App.css';

function App() {
  return (
    <GoogleOAuthProvider clientId="844550783845-k4uog5vg7bt8oejd60ov308n0k305pnh.apps.googleusercontent.com">
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/signup" />} />
          <Route path="/login" element={<Auth initialIsLogin={true} />} />
          <Route path="/signup" element={<Auth initialIsLogin={false} />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
