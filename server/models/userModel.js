const pool = require('../config/db');

// Create users table if it doesn't exist
const createUsersTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  try {
    await pool.query(query);
    
    // In case the table already existed with NOT NULL password, alter it to allow NULL for Google auth
    await pool.query('ALTER TABLE users MODIFY password VARCHAR(255) NULL');
    
    console.log('Users table ready');
  } catch (error) {
    console.error('Error creating users table:', error);
  }
};

const User = {
  create: async (email, hashedPassword) => {
    const [result] = await pool.query(
      'INSERT INTO users (email, password) VALUES (?, ?)',
      [email, hashedPassword]
    );
    return result;
  },

  findByEmail: async (email) => {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },
  
  findById: async (id) => {
    const [rows] = await pool.query('SELECT id, email, created_at FROM users WHERE id = ?', [id]);
    return rows[0];
  }
};

module.exports = { User, createUsersTable };
