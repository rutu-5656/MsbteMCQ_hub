require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createUsersTable } = require('./models/userModel');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Database initialization
createUsersTable();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
