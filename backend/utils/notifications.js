const MenuItem = require('../models/MenuItem');

// Check for low stock items
const checkLowStock = async () => {
  try {
    const lowStockItems = await MenuItem.find({
      stockQuantity: { $lte: '$minimumStock' },
      isAvailable: true
    });

    if (lowStockItems.length > 0) {
      console.log('Low stock alert:');
      lowStockItems.forEach(item => {
        console.log(`${item.name}: ${item.stockQuantity} remaining (Minimum: ${item.minimumStock})`);
        // TODO: Implement actual notification system (email, push notification, etc.)
      });
    }

    return lowStockItems;
  } catch (error) {
    console.error('Error checking low stock:', error);
    return [];
  }
};

// Check for items nearing expiry (within 7 days)
const checkExpiringItems = async () => {
  try {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const expiringItems = await MenuItem.find({
      expiryDate: {
        $exists: true,
        $ne: null,
        $lte: sevenDaysFromNow,
        $gte: new Date()
      },
      isAvailable: true
    });

    if (expiringItems.length > 0) {
      console.log('Expiring items alert:');
      expiringItems.forEach(item => {
        const daysUntilExpiry = Math.ceil((item.expiryDate - new Date()) / (1000 * 60 * 60 * 24));
        console.log(`${item.name} expires in ${daysUntilExpiry} days`);
        // TODO: Implement actual notification system (email, push notification, etc.)
      });
    }

    return expiringItems;
  } catch (error) {
    console.error('Error checking expiring items:', error);
    return [];
  }
};

// Schedule regular checks
const startInventoryChecks = () => {
  // Check every hour
  setInterval(async () => {
    await checkLowStock();
    await checkExpiringItems();
  }, 60 * 60 * 1000); // 1 hour

  // Initial check
  checkLowStock();
  checkExpiringItems();
};

module.exports = {
  checkLowStock,
  checkExpiringItems,
  startInventoryChecks
}; 