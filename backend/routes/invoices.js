const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice
} = require('../controllers/invoices');

// @route   GET /api/invoices
// @desc    Get all invoices
// @access  Private (Admin/Manager/Cashier)
router.get('/', protect, authorize(['admin', 'manager', 'cashier']), getInvoices);

// @route   GET /api/invoices/:id
// @desc    Get single invoice
// @access  Private
router.get('/:id', protect, getInvoice);

// @route   POST /api/invoices
// @desc    Create an invoice
// @access  Private
router.post('/', protect, createInvoice);

// @route   PUT /api/invoices/:id
// @desc    Update an invoice
// @access  Private (Admin/Manager)
router.put('/:id', protect, authorize(['admin', 'manager']), updateInvoice);

// @route   DELETE /api/invoices/:id
// @desc    Delete an invoice
// @access  Private (Admin only)
router.delete('/:id', protect, authorize(['admin']), deleteInvoice);

module.exports = router;