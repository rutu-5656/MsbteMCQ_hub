const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { User } = require('../models/userModel');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const signup = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const result = await User.create(email, hashedPassword);

    if (result.insertId) {
      res.status(201).json({
        id: result.insertId,
        email,
        token: generateToken(result.insertId)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data received' });
    }
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    // Find user
    const user = await User.findByEmail(email);
    
    // Check password
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        id: user.id,
        email: user.email,
        token: generateToken(user.id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const googleAuth = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: 'Token is required' });

  try {
    // Verify access_token by fetching user profile
    client.setCredentials({ access_token: token });
    const userInfo = await client.request({
      url: 'https://www.googleapis.com/oauth2/v3/userinfo'
    });
    
    if (!userInfo.data || !userInfo.data.email) {
      throw new Error('Could not retrieve email from Google');
    }

    const email = userInfo.data.email;

    let user = await User.findByEmail(email);

    if (!user) {
      // Create user without password
      const result = await User.create(email, null);
      if (result.insertId) {
        user = { id: result.insertId, email };
      } else {
        return res.status(400).json({ message: 'Failed to create user from Google Auth' });
      }
    }

    res.json({
      id: user.id,
      email: user.email,
      token: generateToken(user.id)
    });
  } catch (error) {
    console.error('Google Auth error:', error);
    res.status(401).json({ message: 'Invalid Google token' });
  }
};

module.exports = { signup, login, googleAuth };
