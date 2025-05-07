const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getTables,
  getTable,
  createTable,
  updateTable,
  updateTablePosition,
  deleteTable,
  mergeTables
} = require('../controllers/tables');

// @route   GET /api/tables
// @desc    Get all tables
// @access  Private
router.get('/', protect, getTables);

// @route   GET /api/tables/:id
// @desc    Get single table
// @access  Private
router.get('/:id', protect, getTable);

// @route   POST /api/tables
// @desc    Create a table
// @access  Private (Admin/Manager)
router.post('/', protect, authorize(['admin', 'manager']), createTable);

// @route   PUT /api/tables/:id
// @desc    Update a table
// @access  Private (Admin/Manager)
router.put('/:id', protect, authorize(['admin', 'manager']), updateTable);

// @route   PUT /api/tables/:id/position
// @desc    Update table position
// @access  Private
router.put('/:id/position', protect, updateTablePosition);

// @route   DELETE /api/tables/:id
// @desc    Delete a table
// @access  Private (Admin/Manager)
router.delete('/:id', protect, authorize(['admin', 'manager']), deleteTable);

// @route   POST /api/tables/merge
// @desc    Merge two tables
// @access  Private (Admin/Manager)
router.post('/merge', protect, authorize(['admin', 'manager']), mergeTables);

module.exports = router;