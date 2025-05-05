const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { login, createAdmin } = require('../controllers/auth');

const router = express.Router();

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user instance (password will be hashed by pre-save hook)
    user = new User({
      username,
      password,
      role // Optional, defaults to 'waiter' if not provided
    });

    // Save user to database
    await user.save();

    // Create JWT Payload
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    // Sign token
    if (!process.env.JWT_SECRET) {
      console.error('Error: JWT_SECRET environment variable is not set.');
      return res.status(500).send('Server configuration error');
    }
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 3600 }, // Expires in 1 hour
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', login);

// @route   POST api/auth/logout
// @desc    Logout user (typically handled client-side by removing token)
// @access  Private (needs token)
// Note: JWT is stateless, server-side logout often involves token blacklisting (more complex)
// For simplicity, this endpoint might just return a success message.
router.post('/logout', (req, res) => {
    // Client should discard the token upon receiving this response.
    res.json({ msg: 'Logout successful' });
});

// @route   POST api/auth/create-admin
// @desc    Create a new admin user
// @access  Private (admin only)
router.post('/create-admin', createAdmin);

module.exports = router;