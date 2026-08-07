import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navbar from './components/Navbar';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Home from './components/Home';
import Contact from './components/Contact';
import Subjects from './components/Subjects';
import Resources from './components/Resources';
import Profile from './components/Profile';
import AdminPanel from './components/AdminPanel';
import Quiz from './components/Quiz';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <GoogleOAuthProvider clientId="844550783845-k4uog5vg7bt8oejd60ov308n0k305pnh.apps.googleusercontent.com">
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Auth initialIsLogin={true} />} />
          <Route path="/signup" element={<Auth initialIsLogin={false} />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/subjects" element={<ProtectedRoute><Subjects /></ProtectedRoute>} />
          <Route path="/subjects/:subjectId" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
          <Route path="/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
