const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: false,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['Hot Coffee', 'Cold Coffee', 'Tea', 'Snacks', 'Desserts', 'Main Course']
  },
  image: {
    type: String,
    required: false
  },
  stockQuantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  minimumStock: {
    type: Number,
    required: true,
    min: 0,
    default: 10
  },
  expiryDate: {
    type: Date,
    required: false
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
MenuItemSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create indexes
MenuItemSchema.index({ category: 1 });
MenuItemSchema.index({ name: 1 });

module.exports = mongoose.model('MenuItem', MenuItemSchema);