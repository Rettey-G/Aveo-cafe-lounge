require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../db');

// Connect to database
connectDB();

const createUser = async () => {
  try {
    // Check if user already exists
    const userExists = await User.findOne({ username: 'testuser' });
    
    if (userExists) {
      console.log('User "testuser" already exists');
      process.exit(0);
    }
    
    // Create new user
    const user = await User.create({
      username: 'testuser',
      password: 'testuser123',
      role: 'user'
    });
    
    console.log('User created successfully:');
    console.log('Username: testuser');
    console.log('Password: testuser123');
    console.log('Role: user');
    
    process.exit(0);
  } catch (err) {
    console.error('Error creating user:', err);
    process.exit(1);
  }
};

createUser();
