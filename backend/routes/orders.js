const express = require('express');
const router = express.Router();
const Order = require('../models/Order'); // Assuming Order model will be created
const { protect, authorize } = require('../middleware/authMiddleware');

// @route   POST api/orders
// @desc    Create a new order
// @access  Private (Waiter, Admin, Supervisor)
router.post('/', protect, authorize('waiter', 'admin', 'supervisor'), async (req, res) => {
  const { tableNumber, items, orderType, discount, taxes, serviceCharge, totalAmount } = req.body;

  try {
    // Basic validation (more can be added)
    if (!tableNumber || !items || items.length === 0 || !orderType || totalAmount === undefined) {
      return res.status(400).json({ msg: 'Please provide all required order details' });
    }

    const newOrder = new Order({
      tableNumber,
      items,
      orderType,
      discount,
      taxes,
      serviceCharge,
      totalAmount,
      createdBy: req.user.id // Get user ID from the protect middleware
      // status defaults to 'pending'
    });

    const order = await newOrder.save();
    res.status(201).json(order);
  } catch (err) {
    console.error('Error creating order:', err.message);
    // Add more specific error handling if needed (e.g., validation errors)
    res.status(500).send('Server Error');
  }
});

// @route   GET api/orders
// @desc    Get all orders (potentially filtered)
// @access  Private (Admin, Supervisor)
router.get('/', protect, authorize('admin', 'supervisor'), async (req, res) => {
  try {
    // TODO: Add filtering capabilities (e.g., by status, date range)
    const orders = await Order.find()
      .populate('createdBy', 'username') // Populate user who created it
      .populate('items.menuItem', 'name price') // Populate menu item details
      .sort({ createdAt: -1 }); // Sort by newest first

    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/orders/:id
// @desc    Get a single order by ID
// @access  Private (Waiter, Admin, Supervisor)
router.get('/:id', protect, authorize('waiter', 'admin', 'supervisor'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('createdBy', 'username')
      .populate('items.menuItem', 'name price category');

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Optional: Add check if waiter can only see their own orders or orders for their section

    res.json(order);
  } catch (err) {
    console.error('Error fetching single order:', err.message);
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/orders/:id/status
// @desc    Update order status
// @access  Private (Waiter, Admin, Supervisor)
router.put('/:id/status', protect, authorize('waiter', 'admin', 'supervisor'), async (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ['pending', 'served', 'paid', 'cancelled']; // Define allowed statuses

  if (!status || !allowedStatuses.includes(status)) {
    return res.status(400).json({ msg: 'Invalid status provided' });
  }

  try {
    let order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Optional: Add authorization checks (e.g., waiter can only update status to 'served')

    order.status = status;
    await order.save();

    res.json(order);
  } catch (err) {
    console.error('Error updating order status:', err.message);
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/orders/:id
// @desc    Delete an order (use with caution - consider soft delete or cancellation instead)
// @access  Private (Admin, Supervisor)
router.delete('/:id', protect, authorize('admin', 'supervisor'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Instead of deleting, consider changing status to 'cancelled'
    // await Order.findByIdAndDelete(req.params.id);
    // res.json({ msg: 'Order removed' });

    // Example: Update status to cancelled instead of hard delete
    if (order.status !== 'cancelled') {
        order.status = 'cancelled';
        await order.save();
        res.json({ msg: 'Order cancelled successfully', order });
    } else {
        res.status(400).json({ msg: 'Order already cancelled' });
    }

  } catch (err) {
    console.error('Error deleting/cancelling order:', err.message);
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(500).send('Server Error');
  }
});


module.exports = router;