const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  addSampleMenuItems
} = require('../controllers/menuItems');

// @route   GET /api/menu-items
// @desc    Get all menu items
// @access  Public
router.get('/', getMenuItems);

// @route   GET /api/menu-items/:id
// @desc    Get single menu item
// @access  Public
router.get('/:id', getMenuItem);

// @route   POST /api/menu-items
// @desc    Create a menu item
// @access  Private (Admin/Manager)
router.post('/', protect, authorize(['admin', 'manager']), createMenuItem);

// @route   PUT /api/menu-items/:id
// @desc    Update a menu item
// @access  Private (Admin/Manager)
router.put('/:id', protect, authorize(['admin', 'manager']), updateMenuItem);

// @route   DELETE /api/menu-items/:id
// @desc    Delete a menu item
// @access  Private (Admin/Manager)
router.delete('/:id', protect, authorize(['admin', 'manager']), deleteMenuItem);

// @route   POST /api/menu-items/sample
// @desc    Add sample menu items
// @access  Private (Admin only)
router.post('/sample', protect, authorize(['admin']), addSampleMenuItems);

module.exports = router;