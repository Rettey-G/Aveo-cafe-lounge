const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
  },
  stockQuantity: {
    type: Number,
    required: true,
    default: 0, // Default stock quantity to 0
    min: 0 // Ensure stock quantity is not negative
  }
});

module.exports = mongoose.model('MenuItem', menuItemSchema);