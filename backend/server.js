require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./db'); // Correct path to db connection logic

// Debug logging
console.log('Environment variables loaded:');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Present' : 'Missing');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);

// Connect Database
connectDB();

const app = express();

// Security Middleware
app.use(helmet()); // Adds various HTTP headers for security
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Init Middleware
app.use(express.json({ extended: false })); // To parse JSON request bodies

const PORT = process.env.PORT || 5000;

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Server Error' : err.message
  });
});

// Base API status route
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'success',
    message: 'Aveo Backend Running',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/menu-items', require('./routes/menuItems'));
app.use('/api/orders', require('./routes/orders')); // Add the new orders route

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});