import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './InvoicePage.css';

const InvoicePage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    fetchMenuItems();
    generateInvoiceNumber();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await api.get('/menu-items');
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    setInvoiceNumber(`INV-${year}${month}${day}-${random}`);
  };

  const addItemToInvoice = (item) => {
    const existingItem = selectedItems.find((selected) => selected._id === item._id);
    if (existingItem) {
      setSelectedItems(
        selectedItems.map((selected) =>
          selected._id === item._id
            ? { ...selected, quantity: selected.quantity + 1 }
            : selected
        )
      );
    } else {
      setSelectedItems([...selectedItems, { ...item, quantity: 1 }]);
    }
  };

  const removeItemFromInvoice = (itemId) => {
    setSelectedItems(selectedItems.filter((item) => item._id !== itemId));
  };

  const updateItemQuantity = (itemId, quantity) => {
    if (quantity < 1) return;
    setSelectedItems(
      selectedItems.map((item) =>
        item._id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const calculateSubtotal = () => {
    return selectedItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const calculateServiceCharge = () => {
    return calculateSubtotal() * 0.1; // 10% service charge
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.16; // 16% GST
  };

  const calculateDiscount = () => {
    return 0; // No discount by default, can be implemented later
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateServiceCharge() + calculateTax() - calculateDiscount();
  };

  const handleCustomerDetailsChange = (e) => {
    setCustomerDetails({
      ...customerDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleGenerateInvoice = async () => {
    if (selectedItems.length === 0) {
      alert('Please add items to the invoice before generating.');
      return;
    }

    // Check for any missing or invalid data
    for (const item of selectedItems) {
      if (!item._id || !item.name || isNaN(parseFloat(item.price))) {
        console.error('Invalid item data:', item);
        alert('Some items have invalid data. Please refresh the page and try again.');
        return;
      }
    }
    
    // Make sure we have valid data that won't cause server errors
    const invoiceData = {
      invoiceNumber,
      customerDetails: {
        name: customerDetails.name || 'Guest',
        email: customerDetails.email || '',
        phone: customerDetails.phone || '',
        address: customerDetails.address || ''
      },
      items: selectedItems.map(item => ({
        _id: item._id,
        name: item.name,
        price: parseFloat(item.price) || 0,
        quantity: parseInt(item.quantity) || 1
      })),
      subtotal: calculateSubtotal(),
      serviceCharge: calculateServiceCharge(),
      tax: calculateTax(),
      discount: calculateDiscount(),
      total: calculateTotal(),
      date: new Date().toISOString(),
      status: 'paid'
    };

    try {
      // Show loading indicator or disable button here if needed
      
      // Log the data being sent for debugging
      console.log('Sending invoice data:', JSON.stringify(invoiceData));
      
      // Send the invoice data to the server
      const response = await api.post('/invoices', invoiceData);
      console.log('Invoice response:', response.data);
      
      // If we get here, the invoice was created successfully
      // Now update inventory quantities
      try {
        for (const item of selectedItems) {
          if (item._id) {
            // Get current stock first to be safe
            const menuItemResponse = await api.get(`/menu-items/${item._id}`);
            const currentStock = menuItemResponse.data.stockQuantity || 0;
            
            // Calculate new stock and update
            const newStock = Math.max(0, currentStock - item.quantity);
            await api.put(`/menu-items/${item._id}`, {
              stockQuantity: newStock
            });
          }
        }
      } catch (inventoryError) {
        console.error('Error updating inventory:', inventoryError);
        // Continue with invoice success even if inventory update fails
      }
      
      alert('Invoice generated successfully!');
      // Reset form
      setSelectedItems([]);
      setCustomerDetails({
        name: '',
        email: '',
        phone: '',
        address: '',
      });
      generateInvoiceNumber();
      return true; // Success
    } catch (error) {
      console.error('Error generating invoice:', error.response?.data || error.message || error);
      
      // More informative error messages based on error type
      if (error.response?.status === 400) {
        alert('Invalid invoice data. Please check all fields and try again.');
      } else if (error.response?.status === 401) {
        alert('Your session has expired. Please login again.');
        // Redirect to login page if needed
      } else if (error.response?.status === 500) {
        alert('Server error while generating invoice. Please try again later.');
      } else {
        alert('Error generating invoice. Please try again.');
      }
      return false; // Failed
    }
  };

  return (
    <div className="invoice-container">
      <div className="invoice-header">
        <h1>Aveo Cafe & Lounge Invoice</h1>
        <div className="invoice-details">
          <p>Invoice #: {invoiceNumber}</p>
          <p>Date: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="invoice-content">
        <div className="customer-details">
          <h2>Customer Details</h2>
          <input
            type="text"
            name="name"
            placeholder="Customer Name"
            value={customerDetails.name}
            onChange={handleCustomerDetailsChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={customerDetails.email}
            onChange={handleCustomerDetailsChange}
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone"
            value={customerDetails.phone}
            onChange={handleCustomerDetailsChange}
          />
          <textarea
            name="address"
            placeholder="Address"
            value={customerDetails.address}
            onChange={handleCustomerDetailsChange}
          />
        </div>

        <div className="menu-items">
          <h2>Menu Items</h2>
          <div className="menu-grid">
            {menuItems.map((item) => (
              <div key={item._id} className="menu-item" onClick={() => addItemToInvoice(item)}>
                <h3>{item.name}</h3>
                <p>${item.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="selected-items">
          <h2>Selected Items</h2>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {selectedItems.map((item) => (
                <tr key={item._id}>
                  <td>{item.name}</td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItemQuantity(item._id, parseInt(e.target.value))
                      }
                    />
                  </td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>${(item.price * item.quantity).toFixed(2)}</td>
                  <td>
                    <button onClick={() => removeItemFromInvoice(item._id)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="invoice-summary">
          <div className="summary-item">
            <span>Subtotal:</span>
            <span>${calculateSubtotal().toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <span>Service Charge (10%):</span>
            <span>${calculateServiceCharge().toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <span>GST (16%):</span>
            <span>${calculateTax().toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <span>Discount:</span>
            <span>${calculateDiscount().toFixed(2)}</span>
          </div>
          <div className="summary-item total">
            <span>Total:</span>
            <span>${calculateTotal().toFixed(2)}</span>
          </div>
        </div>

        <button
          className="generate-invoice-btn"
          onClick={handleGenerateInvoice}
          disabled={selectedItems.length === 0 || !customerDetails.name}
        >
          Generate Invoice
        </button>
      </div>
    </div>
  );
};

export default InvoicePage; 