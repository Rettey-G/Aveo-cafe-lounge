const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const MenuItem = require('../models/MenuItem');

// Get all invoices
router.get('/', async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ date: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single invoice
router.get('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create invoice
router.post('/', async (req, res) => {
  try {
    const invoice = new Invoice(req.body);
    const savedInvoice = await invoice.save();

    // Update inventory quantities
    for (const item of req.body.items) {
      const menuItem = await MenuItem.findById(item.menuItem);
      if (menuItem) {
        const newQuantity = menuItem.stockQuantity - item.quantity;
        
        // Check if stock is getting low
        if (newQuantity <= menuItem.minimumStock) {
          // TODO: Implement notification system
          console.log(`Low stock alert for ${menuItem.name}: ${newQuantity} remaining`);
        }

        await MenuItem.findByIdAndUpdate(item.menuItem, {
          stockQuantity: newQuantity
        });
      }
    }

    res.status(201).json(savedInvoice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update invoice status
router.patch('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (req.body.status) {
      invoice.status = req.body.status;
    }

    const updatedInvoice = await invoice.save();
    res.json(updatedInvoice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete invoice
router.delete('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    await invoice.remove();
    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 