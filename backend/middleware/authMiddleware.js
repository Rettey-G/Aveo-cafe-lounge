const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes that require authentication
const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header (Bearer token)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      if (!process.env.JWT_SECRET) {
        console.error('Error: JWT_SECRET environment variable is not set.');
        return res.status(500).send('Server configuration error');
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token payload (excluding password)
      req.user = await User.findById(decoded.user.id).select('-password');

      if (!req.user) {
          return res.status(401).json({ msg: 'Not authorized, user not found' });
      }

      next(); // Proceed to the next middleware or route handler
    } catch (error) {
      console.error('Token verification failed:', error.message);
      res.status(401).json({ msg: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ msg: 'Not authorized, no token' });
  }
};

// Middleware to authorize based on roles
// Example: authorize('admin', 'supervisor')
const authorize = (...roles) => {
  return (req, res, next) => {
    // Assumes protect middleware has already run and attached req.user
    if (!req.user) {
        return res.status(401).json({ msg: 'Not authorized, user not found for role check' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ msg: `User role '${req.user.role}' is not authorized to access this route` });
    }
    next(); // User has one of the required roles
  };
};

module.exports = { protect, authorize };