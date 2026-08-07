const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Zod Validation Schemas
const authSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const signup = async (req, res) => {
  try {
    // 1. Validate Input
    const parsed = authSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors[0].message });
    }
    
    const { email, password } = parsed.data;

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create user in Prisma
    const user = await prisma.user.create({
      data: { email, password: hashedPassword }
    });

    res.status(201).json({
      id: user.id,
      email: user.email,
      role: user.role,
      token: generateToken(user.id)
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    // 1. Validate Input (Using same schema)
    const parsed = authSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors[0].message });
    }

    const { email, password } = parsed.data;

    // 2. Find user
    const user = await prisma.user.findUnique({ where: { email } });
    
    // 3. Check password
    if (user && user.password && (await bcrypt.compare(password, user.password))) {
      res.json({
        id: user.id,
        email: user.email,
        role: user.role,
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

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Create user without password
      user = await prisma.user.create({
        data: { email }
      });
    }

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      token: generateToken(user.id)
    });
  } catch (error) {
    console.error('Google Auth error:', error);
    res.status(401).json({ message: 'Invalid Google token' });
  }
};

module.exports = { signup, login, googleAuth };
