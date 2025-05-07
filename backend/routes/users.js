const express = require('express');
const { 
  getUsers, 
  getUser, 
  createUser, 
  updateUser, 
  deleteUser 
} = require('../controllers/users');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Add protection middleware to all routes
router.use(protect);
// Add admin authorization to all routes
router.use(authorize('admin'));

// Routes
router.route('/')
  .get(getUsers)
  .post(createUser);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;
