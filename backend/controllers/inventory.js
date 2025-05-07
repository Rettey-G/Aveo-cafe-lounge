const Inventory = require('../models/Inventory');
const path = require('path');
const fs = require('fs');

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private
exports.getInventoryItems = async (req, res) => {
  try {
    const inventoryItems = await Inventory.find().sort({ dateAdded: -1 });
    res.status(200).json({
      success: true,
      count: inventoryItems.length,
      data: inventoryItems
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get single inventory item
// @route   GET /api/inventory/:id
// @access  Private
exports.getInventoryItem = async (req, res) => {
  try {
    const inventoryItem = await Inventory.findById(req.params.id);

    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: inventoryItem
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Create new inventory item
// @route   POST /api/inventory
// @access  Private
exports.createInventoryItem = async (req, res) => {
  try {
    const inventoryItem = await Inventory.create(req.body);
    
    res.status(201).json({
      success: true,
      data: inventoryItem
    });
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
};

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private
exports.updateInventoryItem = async (req, res) => {
  try {
    let inventoryItem = await Inventory.findById(req.params.id);

    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found'
      });
    }

    // Update lastUpdated timestamp
    req.body.lastUpdated = Date.now();

    inventoryItem = await Inventory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: inventoryItem
    });
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
};

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private
exports.deleteInventoryItem = async (req, res) => {
  try {
    const inventoryItem = await Inventory.findById(req.params.id);

    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found'
      });
    }

    await inventoryItem.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Upload inventory item image
// @route   POST /api/inventory/:id/image
// @access  Private
exports.uploadInventoryImage = async (req, res) => {
  try {
    const inventoryItem = await Inventory.findById(req.params.id);

    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found'
      });
    }

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const file = req.files.file;

    // Make sure the image is a photo
    if (!file.mimetype.startsWith('image')) {
      return res.status(400).json({
        success: false,
        error: 'Please upload an image file'
      });
    }

    // Check file size (limit to 1MB)
    if (file.size > 1000000) {
      return res.status(400).json({
        success: false,
        error: 'Please upload an image less than 1MB'
      });
    }

    // Create custom filename
    file.name = `inventory_${inventoryItem._id}${path.parse(file.name).ext}`;

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Move file to the upload directory
    file.mv(`${uploadDir}/${file.name}`, async err => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          success: false,
          error: 'Problem with file upload'
        });
      }

      // Update inventory item with image URL
      await Inventory.findByIdAndUpdate(req.params.id, {
        image: `/uploads/${file.name}`,
        lastUpdated: Date.now()
      });

      res.status(200).json({
        success: true,
        data: file.name
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Add sample inventory items
// @route   POST /api/inventory/sample
// @access  Private (admin only)
exports.addSampleInventoryItems = async (req, res) => {
  try {
    const sampleItems = [
      {
        name: 'Coffee Beans - Arabica',
        brand: 'Premium Coffee Co.',
        specification: 'Medium roast, 100% Arabica beans',
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days from now
        costPrice: 15.99,
        quantity: 50,
        image: '/uploads/sample_coffee_beans.jpg'
      },
      {
        name: 'Coffee Beans - Robusta',
        brand: 'Premium Coffee Co.',
        specification: 'Dark roast, 100% Robusta beans',
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        costPrice: 14.99,
        quantity: 40,
        image: '/uploads/sample_coffee_beans_robusta.jpg'
      },
      {
        name: 'Milk - Full Fat',
        brand: 'Dairy Fresh',
        specification: 'Pasteurized, 3.5% fat',
        expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        costPrice: 3.99,
        quantity: 30,
        image: '/uploads/sample_milk.jpg'
      },
      {
        name: 'Milk - Low Fat',
        brand: 'Dairy Fresh',
        specification: 'Pasteurized, 1.5% fat',
        expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        costPrice: 3.49,
        quantity: 25,
        image: '/uploads/sample_milk_low_fat.jpg'
      },
      {
        name: 'Sugar - White',
        brand: 'Sweet Life',
        specification: 'Refined white sugar',
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        costPrice: 2.99,
        quantity: 100,
        image: '/uploads/sample_sugar.jpg'
      },
      {
        name: 'Sugar - Brown',
        brand: 'Sweet Life',
        specification: 'Unrefined brown sugar',
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        costPrice: 3.49,
        quantity: 80,
        image: '/uploads/sample_sugar_brown.jpg'
      },
      {
        name: 'Chocolate Syrup',
        brand: 'Sweet Delights',
        specification: 'Premium chocolate syrup',
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        costPrice: 5.99,
        quantity: 20,
        image: '/uploads/sample_chocolate_syrup.jpg'
      },
      {
        name: 'Caramel Syrup',
        brand: 'Sweet Delights',
        specification: 'Premium caramel syrup',
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        costPrice: 5.99,
        quantity: 18,
        image: '/uploads/sample_caramel_syrup.jpg'
      },
      {
        name: 'Vanilla Syrup',
        brand: 'Sweet Delights',
        specification: 'Premium vanilla syrup',
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        costPrice: 6.49,
        quantity: 15,
        image: '/uploads/sample_vanilla_syrup.jpg'
      },
      {
        name: 'Tea - Black',
        brand: 'Tea Haven',
        specification: 'Premium black tea leaves',
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        costPrice: 8.99,
        quantity: 30,
        image: '/uploads/sample_tea_black.jpg'
      },
      {
        name: 'Tea - Green',
        brand: 'Tea Haven',
        specification: 'Premium green tea leaves',
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        costPrice: 9.99,
        quantity: 25,
        image: '/uploads/sample_tea_green.jpg'
      },
      {
        name: 'Tea - Herbal',
        brand: 'Tea Haven',
        specification: 'Premium herbal tea blend',
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        costPrice: 10.99,
        quantity: 20,
        image: '/uploads/sample_tea_herbal.jpg'
      },
      {
        name: 'Whipped Cream',
        brand: 'Dairy Fresh',
        specification: 'Ready to use whipped cream',
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        costPrice: 4.99,
        quantity: 15,
        image: '/uploads/sample_whipped_cream.jpg'
      },
      {
        name: 'Chocolate Chips',
        brand: 'Sweet Delights',
        specification: 'Semi-sweet chocolate chips',
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        costPrice: 3.99,
        quantity: 40,
        image: '/uploads/sample_chocolate_chips.jpg'
      },
      {
        name: 'Cinnamon Powder',
        brand: 'Spice World',
        specification: 'Ground cinnamon powder',
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        costPrice: 2.99,
        quantity: 35,
        image: '/uploads/sample_cinnamon.jpg'
      },
      {
        name: 'Nutmeg Powder',
        brand: 'Spice World',
        specification: 'Ground nutmeg powder',
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        costPrice: 3.49,
        quantity: 30,
        image: '/uploads/sample_nutmeg.jpg'
      },
      {
        name: 'Disposable Coffee Cups',
        brand: 'Eco Serve',
        specification: '12oz paper cups with lids',
        expiryDate: null, // No expiry date for non-food items
        costPrice: 0.15,
        quantity: 500,
        image: '/uploads/sample_coffee_cups.jpg'
      },
      {
        name: 'Disposable Tea Cups',
        brand: 'Eco Serve',
        specification: '8oz paper cups with lids',
        expiryDate: null,
        costPrice: 0.12,
        quantity: 400,
        image: '/uploads/sample_tea_cups.jpg'
      },
      {
        name: 'Napkins',
        brand: 'Eco Serve',
        specification: 'Recycled paper napkins',
        expiryDate: null,
        costPrice: 0.05,
        quantity: 1000,
        image: '/uploads/sample_napkins.jpg'
      },
      {
        name: 'Straws',
        brand: 'Eco Serve',
        specification: 'Biodegradable paper straws',
        expiryDate: null,
        costPrice: 0.03,
        quantity: 800,
        image: '/uploads/sample_straws.jpg'
      }
    ];

    // Clear existing inventory items (optional)
    // await Inventory.deleteMany({});

    // Insert sample items
    await Inventory.insertMany(sampleItems);

    res.status(201).json({
      success: true,
      count: sampleItems.length,
      message: 'Sample inventory items added successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
