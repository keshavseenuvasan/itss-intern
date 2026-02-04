const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const SECRET_KEY = 'your-secret-key-change-in-production';

// Hardcoded users (for demo purposes)
const VALID_USERS = {
  'demo': 'demo123',
  'user': 'password123'
};

// Login endpoint
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  // Check credentials
  if (VALID_USERS[username] && VALID_USERS[username] === password) {
    // Generate JWT token
    const token = jwt.sign(
      { username, id: Math.random() },
      SECRET_KEY,
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      token,
      message: 'Login successful'
    });
  } else {
    return res.status(401).json({
      success: false,
      error: 'Invalid username or password'
    });
  }
});

// Verify token endpoint
router.post('/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ valid: false, error: 'No token provided' });
  }

  try {
    jwt.verify(token, SECRET_KEY);
    return res.json({ valid: true });
  } catch (err) {
    return res.status(401).json({ valid: false, error: 'Invalid or expired token' });
  }
});

module.exports = router;
