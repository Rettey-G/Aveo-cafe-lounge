const express = require('express');
const router = express.Router();
const Table = require('../models/Table');
const authMiddleware = require('../middleware/authMiddleware'); // Assuming auth middleware exists

// @route   GET api/tables
// @desc    Get all tables
// @access  Private (adjust access as needed, e.g., for waiters/admins)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const tables = await Table.find().sort({ location: 1, tableNumber: 1 }); // Sort by location then number
    res.json(tables);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/tables/:id
// @desc    Get table by ID
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ msg: 'Table not found' });
    }
    res.json(table);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Table not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/tables
// @desc    Create a new table
// @access  Private (Admin only?)
router.post('/', authMiddleware, async (req, res) => {
  // Add role check if needed (e.g., if (req.user.role !== 'admin'))
  const { tableNumber, seats, location, status } = req.body;

  try {
    // Check if table number already exists
    let table = await Table.findOne({ tableNumber });
    if (table) {
      return res.status(400).json({ msg: 'Table number already exists' });
    }

    table = new Table({
      tableNumber,
      seats,
      location,
      status // Optional, defaults to 'available'
    });

    await table.save();
    res.json(table);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/tables/:id
// @desc    Update a table (e.g., status, assigned waiter)
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  const { seats, location, status, assignedWaiter } = req.body;

  // Build table object
  const tableFields = {};
  if (seats) tableFields.seats = seats;
  if (location) tableFields.location = location;
  if (status) tableFields.status = status;
  if (assignedWaiter !== undefined) tableFields.assignedWaiter = assignedWaiter; // Allow null/clearing

  try {
    let table = await Table.findById(req.params.id);

    if (!table) return res.status(404).json({ msg: 'Table not found' });

    // Add authorization check if needed (e.g., only admin or assigned waiter can update)

    table = await Table.findByIdAndUpdate(
      req.params.id,
      { $set: tableFields },
      { new: true } // Return the updated document
    );

    res.json(table);
  } catch (err) {
    console.error(err.message);
     if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Table not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/tables/:id
// @desc    Delete a table
// @access  Private (Admin only?)
router.delete('/:id', authMiddleware, async (req, res) => {
  // Add role check if needed
  try {
    const table = await Table.findById(req.params.id);

    if (!table) return res.status(404).json({ msg: 'Table not found' });

    // Add authorization check if needed

    await Table.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Table removed' });
  } catch (err) {
    console.error(err.message);
     if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Table not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;