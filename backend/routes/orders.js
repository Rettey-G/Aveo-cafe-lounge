const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  deleteOrder
} = require('../controllers/orders');

// @route   GET /api/orders
// @desc    Get all orders
// @access  Private
router.get('/', protect, getOrders);

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', protect, getOrder);

// @route   POST /api/orders
// @desc    Create an order
// @access  Private
router.post('/', protect, createOrder);

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private
router.put('/:id/status', protect, updateOrderStatus);

// @route   DELETE /api/orders/:id
// @desc    Delete an order
// @access  Private (Admin/Manager)
router.delete('/:id', protect, authorize(['admin', 'manager']), deleteOrder);

module.exports = router;