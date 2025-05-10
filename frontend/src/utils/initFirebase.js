import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from './firebase';

// Initial data for tables
const initialTables = [
  { tableNumber: 1, status: 'available', seats: 4 },
  { tableNumber: 2, status: 'available', seats: 4 },
  { tableNumber: 3, status: 'available', seats: 2 },
  { tableNumber: 4, status: 'available', seats: 2 },
  { tableNumber: 5, status: 'available', seats: 6 },
  { tableNumber: 6, status: 'available', seats: 6 },
  { tableNumber: 7, status: 'available', seats: 4 },
  { tableNumber: 8, status: 'available', seats: 4 },
  { tableNumber: 9, status: 'available', seats: 8 },
  { tableNumber: 10, status: 'available', seats: 8 }
];

// Initial menu items
const initialMenuItems = [
  {
    name: 'Burger',
    price: 250,
    category: 'Main Course',
    description: 'Classic beef burger with fresh vegetables',
    stock: 100,
    imageURL: 'https://example.com/burger.jpg'
  },
  {
    name: 'Cheese Burger',
    price: 280,
    category: 'Main Course',
    description: 'Beef burger with melted cheese',
    stock: 100,
    imageURL: 'https://example.com/cheese-burger.jpg'
  },
  {
    name: 'Bacon Burger',
    price: 300,
    category: 'Main Course',
    description: 'Beef burger with crispy bacon',
    stock: 100,
    imageURL: 'https://example.com/bacon-burger.jpg'
  },
  {
    name: 'Grill Chicken',
    price: 350,
    category: 'Main Course',
    description: 'Grilled chicken breast with herbs',
    stock: 100,
    imageURL: 'https://example.com/grill-chicken.jpg'
  },
  {
    name: 'Small Fries',
    price: 100,
    category: 'Sides',
    description: 'Crispy french fries',
    stock: 200,
    imageURL: 'https://example.com/small-fries.jpg'
  },
  {
    name: 'Med Fries',
    price: 150,
    category: 'Sides',
    description: 'Medium portion of french fries',
    stock: 200,
    imageURL: 'https://example.com/med-fries.jpg'
  },
  {
    name: 'Lrg Fries',
    price: 200,
    category: 'Sides',
    description: 'Large portion of french fries',
    stock: 200,
    imageURL: 'https://example.com/lrg-fries.jpg'
  }
];

// Function to initialize the database
export const initializeDatabase = async () => {
  try {
    // Initialize tables
    const tablesCollection = collection(db, 'tables');
    const existingTables = await getDocs(tablesCollection);
    
    if (existingTables.empty) {
      console.log('Initializing tables...');
      for (const table of initialTables) {
        await addDoc(tablesCollection, table);
      }
      console.log('Tables initialized successfully');
    }

    // Initialize menu items
    const menuItemsCollection = collection(db, 'menuItems');
    const existingMenuItems = await getDocs(menuItemsCollection);
    
    if (existingMenuItems.empty) {
      console.log('Initializing menu items...');
      for (const item of initialMenuItems) {
        await addDoc(menuItemsCollection, item);
      }
      console.log('Menu items initialized successfully');
    }

    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Function to check if database is initialized
export const checkDatabaseInitialized = async () => {
  try {
    const tablesCollection = collection(db, 'tables');
    const menuItemsCollection = collection(db, 'menuItems');
    
    const tablesSnapshot = await getDocs(tablesCollection);
    const menuItemsSnapshot = await getDocs(menuItemsCollection);
    
    return {
      tablesInitialized: !tablesSnapshot.empty,
      menuItemsInitialized: !menuItemsSnapshot.empty
    };
  } catch (error) {
    console.error('Error checking database initialization:', error);
    throw error;
  }
}; 