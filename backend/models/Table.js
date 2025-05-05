const mongoose = require('mongoose');

const TableSchema = new mongoose.Schema({
  tableNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  seats: {
    type: Number,
    required: true,
    min: 1
  },
  location: {
    type: String,
    required: true,
    enum: ['Ground Floor', '1st Floor Indoor', '1st Floor Outdoor'],
    trim: true
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'reserved'],
    default: 'available'
  },
  assignedWaiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Optional: Reference to the User model (waiter)
  }, // Add location field
}, { timestamps: true }); // Adds createdAt and updatedAt fields automatically

module.exports = mongoose.model('Table', TableSchema);