const Order = require('../models/Order');
const Table = require('../models/Table');
const MenuItem = require('../models/MenuItem');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('table', 'tableNumber location')
      .populate('items.menuItem', 'name price')
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('table', 'tableNumber location')
      .populate('items.menuItem', 'name price')
      .populate('createdBy', 'username');
    
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }
    
    res.json(order);
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Create an order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  const { table, items, orderType, status = 'pending', discount = 0, taxes = 16, serviceCharge = 10 } = req.body;
  
  try {
    // Validate table exists
    const tableExists = await Table.findById(table);
    if (!tableExists) {
      return res.status(400).json({ msg: 'Table not found' });
    }
    
    // Update table status to occupied
    await Table.findByIdAndUpdate(table, { status: 'occupied' });
    
    // Calculate total amount
    let totalAmount = 0;
    
    // Validate all menu items exist and calculate total
    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItem);
      if (!menuItem) {
        return res.status(400).json({ msg: `Menu item ${item.menuItem} not found` });
      }
      
      // Update stock quantity
      await MenuItem.findByIdAndUpdate(item.menuItem, {
        $inc: { stockQuantity: -item.quantity }
      });
      
      totalAmount += menuItem.price * item.quantity;
    }
    
    // Apply service charge and taxes
    const serviceChargeAmount = (totalAmount * serviceCharge) / 100;
    const taxAmount = (totalAmount * taxes) / 100;
    
    // Apply discount
    const discountAmount = (totalAmount * discount) / 100;
    
    // Calculate final total
    const finalTotal = totalAmount + serviceChargeAmount + taxAmount - discountAmount;
    
    const newOrder = new Order({
      table,
      items,
      orderType,
      status,
      createdBy: req.user ? req.user.id : null,
      discount,
      taxes,
      serviceCharge,
      totalAmount: finalTotal
    });
    
    const order = await newOrder.save();
    
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  
  try {
    let order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }
    
    order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    )
      .populate('table', 'tableNumber location')
      .populate('items.menuItem', 'name price')
      .populate('createdBy', 'username');
    
    // If order is completed, update table status to available
    if (status === 'completed') {
      await Table.findByIdAndUpdate(order.table._id, { status: 'available' });
    }
    
    res.json(order);
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Delete an order
// @route   DELETE /api/orders/:id
// @access  Private (Admin/Manager)
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }
    
    await order.remove();
    
    // Update table status back to available
    await Table.findByIdAndUpdate(order.table, { status: 'available' });
    
    res.json({ msg: 'Order removed' });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
};
