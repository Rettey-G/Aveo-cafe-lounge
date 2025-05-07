const Table = require('../models/Table');

// @desc    Get all tables
// @route   GET /api/tables
// @access  Private
exports.getTables = async (req, res) => {
  try {
    let query = {};
    
    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    const tables = await Table.find(query).sort({ tableNumber: 1 });
    res.json(tables);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Get single table
// @route   GET /api/tables/:id
// @access  Private
exports.getTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    
    if (!table) {
      return res.status(404).json({ msg: 'Table not found' });
    }
    
    res.json(table);
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Table not found' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Create a table
// @route   POST /api/tables
// @access  Private (Admin/Manager)
exports.createTable = async (req, res) => {
  const { tableNumber, seats, location, status = 'available', position } = req.body;
  
  try {
    // Check if table number already exists
    const existingTable = await Table.findOne({ tableNumber });
    if (existingTable) {
      return res.status(400).json({ msg: 'Table number already exists' });
    }
    
    const newTable = new Table({
      tableNumber,
      seats,
      location,
      status,
      position: position || { x: 0, y: 0 },
      assignedWaiter: req.user && req.user.role === 'waiter' ? req.user.id : null
    });
    
    const table = await newTable.save();
    res.json(table);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Update a table
// @route   PUT /api/tables/:id
// @access  Private (Admin/Manager)
exports.updateTable = async (req, res) => {
  const { tableNumber, seats, location, status, assignedWaiter } = req.body;
  
  try {
    let table = await Table.findById(req.params.id);
    
    if (!table) {
      return res.status(404).json({ msg: 'Table not found' });
    }
    
    // Check if updating to a table number that already exists (except for this table)
    if (tableNumber && tableNumber !== table.tableNumber) {
      const existingTable = await Table.findOne({ tableNumber });
      if (existingTable && existingTable._id.toString() !== req.params.id) {
        return res.status(400).json({ msg: 'Table number already exists' });
      }
    }
    
    // Build update object
    const tableFields = {};
    if (tableNumber) tableFields.tableNumber = tableNumber;
    if (seats) tableFields.seats = seats;
    if (location) tableFields.location = location;
    if (status) tableFields.status = status;
    if (assignedWaiter) tableFields.assignedWaiter = assignedWaiter;
    
    table = await Table.findByIdAndUpdate(
      req.params.id,
      { $set: tableFields },
      { new: true }
    );
    
    res.json(table);
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Table not found' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Update table position
// @route   PUT /api/tables/:id/position
// @access  Private
exports.updateTablePosition = async (req, res) => {
  const { position } = req.body;
  
  try {
    let table = await Table.findById(req.params.id);
    
    if (!table) {
      return res.status(404).json({ msg: 'Table not found' });
    }
    
    table = await Table.findByIdAndUpdate(
      req.params.id,
      { $set: { position } },
      { new: true }
    );
    
    res.json(table);
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Table not found' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Delete a table
// @route   DELETE /api/tables/:id
// @access  Private (Admin/Manager)
exports.deleteTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    
    if (!table) {
      return res.status(404).json({ msg: 'Table not found' });
    }
    
    await table.remove();
    res.json({ msg: 'Table removed' });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Table not found' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Merge two tables
// @route   POST /api/tables/merge
// @access  Private (Admin/Manager)
exports.mergeTables = async (req, res) => {
  const { table1Id, table2Id } = req.body;
  
  if (!table1Id || !table2Id) {
    return res.status(400).json({ msg: 'Both table IDs are required' });
  }
  
  try {
    const table1 = await Table.findById(table1Id);
    const table2 = await Table.findById(table2Id);
    
    if (!table1 || !table2) {
      return res.status(404).json({ msg: 'One or both tables not found' });
    }
    
    // Create a new merged table
    const newTable = new Table({
      tableNumber: `${table1.tableNumber}-${table2.tableNumber}`,
      seats: parseInt(table1.seats) + parseInt(table2.seats),
      location: table1.location, // Assuming they're in the same location
      status: 'available',
      position: table1.position, // Use position of first table
    });
    
    await newTable.save();
    
    // Remove the original tables
    await Table.findByIdAndRemove(table1Id);
    await Table.findByIdAndRemove(table2Id);
    
    res.json({ msg: 'Tables merged successfully', newTable });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};
