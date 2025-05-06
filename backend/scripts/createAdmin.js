const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();
const crypto = require('crypto');

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Check if admin already exists
    const adminExists = await User.findOne({ username: 'admin' });
    if (adminExists) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Generate a secure random password
    const generatedPassword = crypto.randomBytes(12).toString('base64');

    // Create admin user
    const admin = await User.create({
      username: 'admin',
      password: generatedPassword,
      role: 'admin'
    });

    console.log('Admin user created successfully');
    console.log('Username: admin');
    console.log('Password:', generatedPassword);
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err);
    process.exit(1);
  }
};

createAdmin(); 