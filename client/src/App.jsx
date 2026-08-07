import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Auth from './components/Auth';
import './App.css';

function App() {
  return (
    <GoogleOAuthProvider clientId="844550783845-k4uog5vg7bt8oejd60ov308n0k305pnh.apps.googleusercontent.com">
      <Auth />
    </GoogleOAuthProvider>
  );
}

export default App;
