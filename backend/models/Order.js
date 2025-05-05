const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  table: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: true
  },
  items: [{
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  orderType: {
    type: String,
    enum: ['KOT', 'BOT'], // Kitchen Order Ticket / Bar Order Ticket
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'served', 'paid', 'cancelled'],
    default: 'pending'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model (waiter/admin/supervisor)
    required: true
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  taxes: {
    type: Number,
    default: 0,
    min: 0
  },
  serviceCharge: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  }
}, { timestamps: true }); // Adds createdAt and updatedAt fields automatically

module.exports = mongoose.model('Order', OrderSchema);