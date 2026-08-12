import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, BookOpen, Users, Trophy, TargetIcon, ChartBar, Eye, EyeOff } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import './Auth.css';

const Auth = ({ initialIsLogin = false }) => {
  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLogin(initialIsLogin);
  }, [initialIsLogin]);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError('');
      setSuccess('');
      try {
        const res = await fetch('http://localhost:5000/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: tokenResponse.access_token }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Google Auth failed');
        localStorage.setItem('token', data.token);
        if (data.role) localStorage.setItem('userRole', data.role);
        setSuccess('Successfully logged in with Google!');
        setTimeout(() => navigate('/dashboard'), 1000);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError('Google Login Failed'),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    
    try {
      const bodyData = isLogin 
        ? { email, password } 
        : { email, password, firstName, lastName };

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      // Success
      localStorage.setItem('token', data.token);
      if (data.role) localStorage.setItem('userRole', data.role);
      setSuccess(isLogin ? 'Successfully logged in!' : 'Account created successfully!');
      
      // Redirect after a short delay
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setError('');
    setSuccess('');
  }, [isLogin]);

  return (
    <div className="auth-container">
      <div className="auth-card">
          <div className="auth-form-header">
            <h2>{isLogin ? 'Welcome back' : 'Create your account'}</h2>
            <p>Start learning in under a minute — it's free.</p>
          </div>

          <div className="auth-toggle">
            <button 
              className={`auth-toggle-btn ${isLogin ? 'active' : ''}`}
              onClick={() => {
                navigate('/login');
                setIsLogin(true);
              }}
            >
              Log in
            </button>
            <button 
              className={`auth-toggle-btn ${!isLogin ? 'active' : ''}`}
              onClick={() => {
                navigate('/signup');
                setIsLogin(false);
              }}
            >
              Sign up
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="auth-error">{error}</div>}
            {success && <div className="auth-success">{success}</div>}
            
            {!isLogin && (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1, minWidth: 0 }}>
                  <label>First Name</label>
                  <input 
                    type="text" 
                    placeholder="Jane" 
                    required={!isLogin}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
                <div className="form-group" style={{ flex: 1, minWidth: 0 }}>
                  <label>Last Name</label>
                  <input 
                    type="text" 
                    placeholder="Doe" 
                    required={!isLogin}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                placeholder="your@email.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <div className="label-row">
                <label>Password</label>
                {isLogin && <a href="#forgot" className="forgot-password">Forgot password?</a>}
              </div>
              <div className="password-input-wrapper">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="At least 8 characters" 
                  required 
                  minLength={8} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Please wait...' : (isLogin ? 'Log in' : 'Create account')}
            </button>
          </form>

          <div className="auth-divider">
            <span>or continue with</span>
          </div>

          <button type="button" className="google-btn" onClick={() => loginWithGoogle()} disabled={loading}>
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p className="auth-footer">
            By continuing you agree to our academic honesty policy and terms of study.
          </p>
      </div>
    </div>
  );
};

export default Auth;
