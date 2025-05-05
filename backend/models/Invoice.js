const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  customerDetails: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: false
    },
    phone: {
      type: String,
      required: false
    },
    address: {
      type: String,
      required: false
    }
  },
  items: [{
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true
    },
    name: String,
    price: Number,
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  subtotal: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['paid', 'pending', 'cancelled'],
    default: 'paid'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Invoice', InvoiceSchema); 