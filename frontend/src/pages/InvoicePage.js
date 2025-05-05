import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/menu-items`);
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

  const calculateTax = () => {
    return calculateSubtotal() * 0.1; // 10% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleCustomerDetailsChange = (e) => {
    setCustomerDetails({
      ...customerDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleGenerateInvoice = async () => {
    const invoiceData = {
      invoiceNumber,
      customerDetails,
      items: selectedItems,
      subtotal: calculateSubtotal(),
      tax: calculateTax(),
      total: calculateTotal(),
      date: new Date().toISOString(),
    };

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/invoices`, invoiceData);
      // Update inventory quantities
      for (const item of selectedItems) {
        await axios.put(`${process.env.REACT_APP_API_URL}/menu-items/${item._id}`, {
          stockQuantity: item.stockQuantity - item.quantity,
        });
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
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Error generating invoice. Please try again.');
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
            <span>Tax (10%):</span>
            <span>${calculateTax().toFixed(2)}</span>
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