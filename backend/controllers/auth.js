const User = require('../models/User');

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate username & password
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        msg: 'Please provide username and password'
      });
    }

    // Check for user
    const user = await User.findOne({ username }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        msg: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        msg: 'Invalid credentials'
      });
    }

    // Create token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      role: user.role
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      msg: 'Server error'
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
    const admin = await User.create({
      username: 'admin',
      password: 'admin123',
      role: 'admin'
    });

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