const express = require('express');
const { 
  getInventoryItems, 
  getInventoryItem, 
  createInventoryItem, 
  updateInventoryItem, 
  deleteInventoryItem,
  uploadInventoryImage,
  addSampleInventoryItems
} = require('../controllers/inventory');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Add protection middleware to all routes
router.use(protect);

// Routes
router.route('/')
  .get(getInventoryItems)
  .post(authorize('admin'), createInventoryItem);

router.route('/:id')
  .get(getInventoryItem)
  .put(authorize('admin'), updateInventoryItem)
  .delete(authorize('admin'), deleteInventoryItem);

router.route('/:id/image')
  .post(authorize('admin'), uploadInventoryImage);

router.route('/sample/add')
  .post(authorize('admin'), addSampleInventoryItems);

module.exports = router;
