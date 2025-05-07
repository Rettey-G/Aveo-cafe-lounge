require('dotenv').config();
const mongoose = require('mongoose');

console.log('Environment Variables Check:');
console.log('---------------------------');
console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set');
console.log('PORT:', process.env.PORT || 'Not set');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Set (hidden for security)' : 'Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set (hidden for security)' : 'Not set');
console.log('JWT_EXPIRE:', process.env.JWT_EXPIRE || 'Not set');

// Check MongoDB connection
const checkDbConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('\nMongoDB Connection: Success');
    
    // Close the connection after checking
    await mongoose.connection.close();
    console.log('MongoDB Connection closed');
  } catch (err) {
    console.error('\nMongoDB Connection: Failed');
    console.error('Error:', err.message);
  }
  
  process.exit(0);
};

checkDbConnection();
