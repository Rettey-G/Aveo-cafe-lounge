const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');
const Inventory = require('../models/Inventory');
const Order = require('../models/Order');
const Invoice = require('../models/Invoice');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Sample data
const sampleMenuItems = [
  {
    name: 'Espresso',
    description: 'Strong black coffee made by forcing steam through ground coffee beans',
    price: 3.50,
    category: 'Coffee',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80',
    stockQuantity: 100
  },
  {
    name: 'Cappuccino',
    description: 'Coffee made with milk that has been frothed up with pressurized steam',
    price: 4.50,
    category: 'Coffee',
    imageUrl: 'https://images.unsplash.com/photo-1534778101976-62847782c213?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80',
    stockQuantity: 100
  },
  {
    name: 'Latte',
    description: 'Coffee made with hot steamed milk',
    price: 4.00,
    category: 'Coffee',
    imageUrl: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=675&q=80',
    stockQuantity: 100
  },
  {
    name: 'Mocha',
    description: 'Chocolate-flavored variant of a latte',
    price: 4.75,
    category: 'Coffee',
    imageUrl: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc39?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80',
    stockQuantity: 100
  },
  {
    name: 'Croissant',
    description: 'Buttery, flaky viennoiserie pastry',
    price: 3.25,
    category: 'Pastries',
    imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1026&q=80',
    stockQuantity: 50
  }
];

const sampleTables = [
  {
    tableNumber: 1,
    seats: 4,
    location: 'Ground Floor',
    status: 'available',
    position: { x: 50, y: 50 }
  },
  {
    tableNumber: 2,
    seats: 2,
    location: 'Ground Floor',
    status: 'available',
    position: { x: 150, y: 50 }
  },
  {
    tableNumber: 3,
    seats: 6,
    location: 'Ground Floor',
    status: 'available',
    position: { x: 250, y: 50 }
  },
  {
    tableNumber: 4,
    seats: 4,
    location: '1st Floor Indoor',
    status: 'available',
    position: { x: 50, y: 150 }
  },
  {
    tableNumber: 5,
    seats: 2,
    location: '1st Floor Indoor',
    status: 'available',
    position: { x: 150, y: 150 }
  },
  {
    tableNumber: 6,
    seats: 8,
    location: '1st Floor Outdoor',
    status: 'available',
    position: { x: 50, y: 250 }
  }
];

const sampleInventoryItems = [
  {
    name: 'Coffee Beans - Arabica',
    brand: 'Premium Coffee Co.',
    specification: 'High-quality Arabica beans from Colombia',
    expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    costPrice: 15.99,
    quantity: 50,
    image: 'https://images.unsplash.com/photo-1559525839-8f27cb033dc7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80'
  },
  {
    name: 'Milk - Whole',
    brand: 'Dairy Fresh',
    specification: 'Whole milk, pasteurized',
    expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    costPrice: 3.99,
    quantity: 30,
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=701&q=80'
  },
  {
    name: 'Sugar - White',
    brand: 'Sweet Life',
    specification: 'Refined white sugar',
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    costPrice: 2.49,
    quantity: 40,
    image: 'https://images.unsplash.com/photo-1581000197348-5a2b867e7e84?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80'
  },
  {
    name: 'Chocolate Syrup',
    brand: 'Sweet Treats',
    specification: 'Premium chocolate syrup for mochas and desserts',
    expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days from now
    costPrice: 4.99,
    quantity: 25,
    image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1352&q=80'
  },
  {
    name: 'Flour - All Purpose',
    brand: 'Baker\'s Choice',
    specification: 'All-purpose flour for baking',
    expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days from now
    costPrice: 2.99,
    quantity: 35,
    image: 'https://images.unsplash.com/photo-1583252308108-bdafee7f9c72?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80'
  }
];

// Function to add sample data
const addSampleData = async () => {
  try {
    // Clear existing data
    await MenuItem.deleteMany({});
    await Table.deleteMany({});
    await Inventory.deleteMany({});
    await Order.deleteMany({});
    await Invoice.deleteMany({});

    console.log('Existing data cleared');

    // Add sample menu items
    await MenuItem.insertMany(sampleMenuItems);
    console.log(`${sampleMenuItems.length} menu items added`);

    // Add sample tables
    await Table.insertMany(sampleTables);
    console.log(`${sampleTables.length} tables added`);

    // Add sample inventory items
    await Inventory.insertMany(sampleInventoryItems);
    console.log(`${sampleInventoryItems.length} inventory items added`);

    console.log('Sample data added successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error adding sample data:', err);
    process.exit(1);
  }
};

// Run the function
addSampleData();
