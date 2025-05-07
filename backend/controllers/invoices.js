const Invoice = require('../models/Invoice');
const Order = require('../models/Order');

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private (Admin/Manager/Cashier)
exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .sort({ date: -1 });
    
    res.json(invoices);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Get single invoice
// @route   GET /api/invoices/:id
// @access  Private
exports.getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ msg: 'Invoice not found' });
    }
    
    res.json(invoice);
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Invoice not found' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Create an invoice
// @route   POST /api/invoices
// @access  Private
exports.createInvoice = async (req, res) => {
  const { 
    invoiceNumber, 
    customerDetails, 
    items, 
    subtotal, 
    tax, 
    serviceCharge = 10,
    discount = 0,
    total, 
    date = Date.now(), 
    status = 'paid',
    orderId
  } = req.body;
  
  try {
    // If orderId is provided, update the order status to completed
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, { status: 'completed' });
    }
    
    const newInvoice = new Invoice({
      invoiceNumber,
      customerDetails,
      items,
      subtotal,
      tax,
      serviceCharge,
      discount,
      total,
      date,
      status,
      createdBy: req.user ? req.user.id : null
    });
    
    const invoice = await newInvoice.save();
    
    res.json(invoice);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Update an invoice
// @route   PUT /api/invoices/:id
// @access  Private (Admin/Manager)
exports.updateInvoice = async (req, res) => {
  const { 
    customerDetails, 
    items, 
    subtotal, 
    tax, 
    serviceCharge,
    discount,
    total, 
    status 
  } = req.body;
  
  try {
    let invoice = await Invoice.findById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ msg: 'Invoice not found' });
    }
    
    // Build update object
    const invoiceFields = {};
    if (customerDetails) invoiceFields.customerDetails = customerDetails;
    if (items) invoiceFields.items = items;
    if (subtotal) invoiceFields.subtotal = subtotal;
    if (tax) invoiceFields.tax = tax;
    if (serviceCharge !== undefined) invoiceFields.serviceCharge = serviceCharge;
    if (discount !== undefined) invoiceFields.discount = discount;
    if (total) invoiceFields.total = total;
    if (status) invoiceFields.status = status;
    
    invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { $set: invoiceFields },
      { new: true }
    );
    
    res.json(invoice);
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Invoice not found' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Delete an invoice
// @route   DELETE /api/invoices/:id
// @access  Private (Admin only)
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ msg: 'Invoice not found' });
    }
    
    await invoice.remove();
    
    res.json({ msg: 'Invoice removed' });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Invoice not found' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
};
