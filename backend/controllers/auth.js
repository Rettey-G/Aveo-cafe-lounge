const User = require('../models/User');
const crypto = require('crypto');

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    console.log('Login attempt:', { username: req.body.username });
    
    const { username, password } = req.body;

    // Validate username & password
    if (!username || !password) {
      console.log('Login failed: Missing username or password');
      return res.status(400).json({
        success: false,
        msg: 'Please provide username and password'
      });
    }

    // Check JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set in environment variables');
      return res.status(500).json({
        success: false,
        msg: 'Server configuration error: JWT_SECRET not set'
      });
    }

    // Check JWT_EXPIRE is set
    if (!process.env.JWT_EXPIRE) {
      console.error('JWT_EXPIRE is not set in environment variables');
      return res.status(500).json({
        success: false,
        msg: 'Server configuration error: JWT_EXPIRE not set'
      });
    }

    // Check for user
    console.log('Finding user in database...');
    const user = await User.findOne({ username }).select('+password');

    if (!user) {
      console.log(`Login failed: User '${username}' not found`);
      return res.status(401).json({
        success: false,
        msg: 'Invalid credentials'
      });
    }

    console.log('User found, checking password...');
    // Check if password matches
    try {
      const isMatch = await user.matchPassword(password);

      if (!isMatch) {
        console.log(`Login failed: Invalid password for user '${username}'`);
        return res.status(401).json({
          success: false,
          msg: 'Invalid credentials'
        });
      }
    } catch (passwordError) {
      console.error('Password match error:', passwordError);
      return res.status(500).json({
        success: false,
        msg: 'Error verifying password'
      });
    }

    // Create token
    console.log('Password matched, generating token...');
    try {
      const token = user.getSignedJwtToken();
      
      console.log('Login successful for user:', username);
      res.status(200).json({
        success: true,
        token,
        role: user.role
      });
    } catch (tokenError) {
      console.error('Token generation error:', tokenError);
      return res.status(500).json({
        success: false,
        msg: 'Error generating authentication token'
      });
    }
  } catch (err) {
    console.error('Login error details:', err);
    res.status(500).json({
      success: false,
      msg: 'Server error',
      error: process.env.NODE_ENV === 'production' ? undefined : err.message
    });
  }
};

// @desc    Create initial admin user
// @route   POST /api/auth/create-admin
// @access  Private (should be called once during setup)
exports.createAdmin = async (req, res) => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      return res.status(400).json({
        success: false,
        msg: 'Admin user already exists'
      });
    }

    // Create admin user
    const generatedPassword = crypto.randomBytes(12).toString('base64');
    const admin = await User.create({
      username: 'admin',
      password: generatedPassword,
      role: 'admin'
    });

    console.log('Admin user created successfully');
    console.log('Username: admin');
    console.log('Password:', generatedPassword);

    res.status(201).json({
      success: true,
      msg: 'Admin user created successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      msg: 'Server error'
    });
  }
}; 