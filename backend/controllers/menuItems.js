const MenuItem = require('../models/MenuItem');

// @desc    Get all menu items
// @route   GET /api/menu-items
// @access  Public
exports.getMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.find().sort({ category: 1, name: 1 });
    res.json(menuItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Get single menu item
// @route   GET /api/menu-items/:id
// @access  Public
exports.getMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({ msg: 'Menu item not found' });
    }
    
    res.json(menuItem);
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Menu item not found' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Create a menu item
// @route   POST /api/menu-items
// @access  Private (Admin/Manager)
exports.createMenuItem = async (req, res) => {
  const { name, description, price, category, imageUrl, stockQuantity } = req.body;
  
  try {
    const newMenuItem = new MenuItem({
      name,
      description,
      price,
      category,
      imageUrl,
      stockQuantity: stockQuantity || 0
    });
    
    const menuItem = await newMenuItem.save();
    res.json(menuItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Update a menu item
// @route   PUT /api/menu-items/:id
// @access  Private (Admin/Manager)
exports.updateMenuItem = async (req, res) => {
  const { name, description, price, category, imageUrl, stockQuantity } = req.body;
  
  try {
    let menuItem = await MenuItem.findById(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({ msg: 'Menu item not found' });
    }
    
    // Build update object
    const menuItemFields = {};
    if (name) menuItemFields.name = name;
    if (description) menuItemFields.description = description;
    if (price) menuItemFields.price = price;
    if (category) menuItemFields.category = category;
    if (imageUrl) menuItemFields.imageUrl = imageUrl;
    if (stockQuantity !== undefined) menuItemFields.stockQuantity = stockQuantity;
    
    menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { $set: menuItemFields },
      { new: true }
    );
    
    res.json(menuItem);
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Menu item not found' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Delete a menu item
// @route   DELETE /api/menu-items/:id
// @access  Private (Admin/Manager)
exports.deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({ msg: 'Menu item not found' });
    }
    
    await menuItem.remove();
    res.json({ msg: 'Menu item removed' });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Menu item not found' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Add sample menu items
// @route   POST /api/menu-items/sample
// @access  Private (Admin only)
exports.addSampleMenuItems = async (req, res) => {
  try {
    const sampleItems = [
      {
        name: 'Espresso',
        description: 'Strong black coffee made by forcing steam through ground coffee beans',
        price: '3.50',
        category: 'Coffee',
        imageUrl: 'https://example.com/espresso.jpg',
        stockQuantity: 100
      },
      {
        name: 'Cappuccino',
        description: 'Coffee made with milk that has been frothed up with pressurized steam',
        price: '4.50',
        category: 'Coffee',
        imageUrl: 'https://example.com/cappuccino.jpg',
        stockQuantity: 100
      },
      {
        name: 'Latte',
        description: 'Coffee made with hot steamed milk',
        price: '4.00',
        category: 'Coffee',
        imageUrl: 'https://example.com/latte.jpg',
        stockQuantity: 100
      },
      {
        name: 'Mocha',
        description: 'Chocolate-flavored variant of a latte',
        price: '4.75',
        category: 'Coffee',
        imageUrl: 'https://example.com/mocha.jpg',
        stockQuantity: 100
      },
      {
        name: 'Croissant',
        description: 'Buttery, flaky viennoiserie pastry',
        price: '3.25',
        category: 'Pastries',
        imageUrl: 'https://example.com/croissant.jpg',
        stockQuantity: 50
      },
      {
        name: 'Blueberry Muffin',
        description: 'Sweet muffin with blueberries',
        price: '3.00',
        category: 'Pastries',
        imageUrl: 'https://example.com/muffin.jpg',
        stockQuantity: 40
      },
      {
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce with Caesar dressing, croutons, and parmesan',
        price: '8.50',
        category: 'Food',
        imageUrl: 'https://example.com/caesar.jpg',
        stockQuantity: 30
      },
      {
        name: 'Club Sandwich',
        description: 'Triple-decker sandwich with chicken, bacon, lettuce, and tomato',
        price: '9.75',
        category: 'Food',
        imageUrl: 'https://example.com/club.jpg',
        stockQuantity: 25
      },
      {
        name: 'Iced Tea',
        description: 'Chilled tea served with ice and lemon',
        price: '3.00',
        category: 'Beverages',
        imageUrl: 'https://example.com/icedtea.jpg',
        stockQuantity: 80
      },
      {
        name: 'Fresh Orange Juice',
        description: 'Freshly squeezed orange juice',
        price: '4.25',
        category: 'Beverages',
        imageUrl: 'https://example.com/orangejuice.jpg',
        stockQuantity: 60
      }
    ];
    
    await MenuItem.insertMany(sampleItems);
    res.json({ msg: 'Sample menu items added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};
