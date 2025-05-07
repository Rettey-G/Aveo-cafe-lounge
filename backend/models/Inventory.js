const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true
  },
  brand: {
    type: String,
    required: [true, 'Please provide a brand name'],
    trim: true
  },
  specification: {
    type: String,
    required: false,
    trim: true
  },
  expiryDate: {
    type: Date,
    required: false
  },
  costPrice: {
    type: Number,
    required: [true, 'Please provide a cost price'],
    min: 0
  },
  quantity: {
    type: Number,
    required: [true, 'Please provide a quantity'],
    min: 0,
    default: 0
  },
  image: {
    type: String, // URL to the image
    required: false
  },
  dateAdded: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', InventorySchema, 'inventory');
