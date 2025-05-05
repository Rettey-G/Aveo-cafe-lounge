const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem'); // Assuming MenuItem model exists
const { protect, authorize } = require('../middleware/authMiddleware');

// @route   POST api/menu-items
// @desc    Create a menu item
// @access  Private (Admin, Supervisor)
router.post('/', protect, authorize('admin', 'supervisor'), async (req, res) => {
  const { name, description, price, category, imageUrl, stockQuantity } = req.body; // Updated fields

  try {
    const newItem = new MenuItem({
      name,
      description,
      price,
      category,
      imageUrl, // Updated field name
      stockQuantity // Updated field name
    });

    const menuItem = await newItem.save();
    res.json(menuItem);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/menu-items
// @desc    Get all menu items
// @access  Private (All authenticated users)
router.get('/', protect, async (req, res) => {
  try {
    const menuItems = await MenuItem.find().sort({ category: 1, name: 1 }); // Sort by category, then name
    res.json(menuItems);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/menu-items/:id
// @desc    Get single menu item by ID
// @access  Private (All authenticated users)
router.get('/:id', protect, async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({ msg: 'Menu item not found' });
    }

    res.json(menuItem);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Menu item not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/menu-items/:id
// @desc    Update a menu item
// @access  Private (Admin, Supervisor)
router.put('/:id', protect, authorize('admin', 'supervisor'), async (req, res) => {
  const { name, description, price, category, imageUrl, stockQuantity } = req.body; // Updated fields

  // Build menu item object
  const menuItemFields = {};
  if (name) menuItemFields.name = name;
  if (description) menuItemFields.description = description;
  if (price) menuItemFields.price = price;
  if (category) menuItemFields.category = category;
  if (imageUrl) menuItemFields.imageUrl = imageUrl; // Updated field name
  if (stockQuantity !== undefined) menuItemFields.stockQuantity = stockQuantity; // Updated field name, allow setting to 0

  try {
    let menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) return res.status(404).json({ msg: 'Menu item not found' });

    // Update
    menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { $set: menuItemFields },
      { new: true } // Return the modified document
    );

    res.json(menuItem);
  } catch (err) {
    console.error(err.message);
     if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Menu item not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/menu-items/:id
// @desc    Delete a menu item
// @access  Private (Admin, Supervisor)
router.delete('/:id', protect, authorize('admin', 'supervisor'), async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({ msg: 'Menu item not found' });
    }

    await MenuItem.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Menu item removed' });
  } catch (err) {
    console.error(err.message);
     if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Menu item not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;