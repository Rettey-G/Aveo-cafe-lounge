import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './OrderTakingPage.css'; // We'll create this CSS file next

const OrderTakingPage = () => {
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [currentOrder, setCurrentOrder] = useState([]); // Array of { menuItem: { _id, name, price }, quantity: number }
  const [loadingTables, setLoadingTables] = useState(true);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [error, setError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Ensure API_URL includes /api
  const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '') + '/api';

  // Fetch available tables
  const fetchTables = useCallback(async () => {
    setLoadingTables(true);
    try {
      const res = await axios.get(`${API_URL}/tables?status=available`); // Fetch only available tables
      setTables(res.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching tables:", err);
      setError('Failed to fetch tables.');
      setTables([]);
    } finally {
      setLoadingTables(false);
    }
  }, [API_URL]);

  // Fetch menu items
  const fetchMenuItems = useCallback(async () => {
    setLoadingMenu(true);
    try {
      const res = await axios.get(`${API_URL}/menu-items`);
      setMenuItems(res.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching menu items:", err);
      setError('Failed to fetch menu items.');
      setMenuItems([]);
    } finally {
      setLoadingMenu(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchTables();
    fetchMenuItems();
  }, [fetchTables, fetchMenuItems]);

  // Add item to current order
  const addItemToOrder = (item) => {
    setError(null);
    setOrderSuccess(false);
    const existingItemIndex = currentOrder.findIndex(orderItem => orderItem.menuItem._id === item._id);

    if (existingItemIndex > -1) {
      // Increase quantity
      const updatedOrder = [...currentOrder];
      updatedOrder[existingItemIndex].quantity += 1;
      setCurrentOrder(updatedOrder);
    } else {
      // Add new item
      setCurrentOrder([...currentOrder, { menuItem: { _id: item._id, name: item.name, price: item.price }, quantity: 1 }]);
    }
  };

  // Remove item from order or decrease quantity
  const removeItemFromOrder = (itemId) => {
    setError(null);
    setOrderSuccess(false);
    const existingItemIndex = currentOrder.findIndex(orderItem => orderItem.menuItem._id === itemId);

    if (existingItemIndex > -1) {
      const updatedOrder = [...currentOrder];
      if (updatedOrder[existingItemIndex].quantity > 1) {
        updatedOrder[existingItemIndex].quantity -= 1;
        setCurrentOrder(updatedOrder);
      } else {
        // Remove item if quantity is 1
        setCurrentOrder(updatedOrder.filter(orderItem => orderItem.menuItem._id !== itemId));
      }
    }
  };

  // Calculate total price
  const calculateTotal = () => {
    return currentOrder.reduce((total, item) => {
        // Ensure price is treated as a number
        const price = parseFloat(item.menuItem.price.replace(/[^\d.-]/g, '')) || 0;
        return total + (price * item.quantity);
    }, 0).toFixed(2);
  };

  // Handle Submit Order
  const handleSubmitOrder = async () => {
    if (!selectedTable) {
      setError('Please select a table.');
      return;
    }
    if (currentOrder.length === 0) {
      setError('Please add items to the order.');
      return;
    }

    setError(null);
    setOrderSuccess(false);

    const orderData = {
      table: selectedTable, // Send table ID
      items: currentOrder.map(item => ({ menuItem: item.menuItem._id, quantity: item.quantity })),
      orderType: 'KOT', // Default to KOT, could be dynamic
      // createdBy: 'waiter_id' // This should come from logged-in user context
    };

    try {
      // Replace with your actual API endpoint and auth mechanism
      await axios.post(`${API_URL}/orders`, orderData, {
        // headers: { Authorization: `Bearer ${token}` }
      });
      setOrderSuccess(true);
      setCurrentOrder([]);
      setSelectedTable('');
      // Optionally, refresh tables to update status
      fetchTables();
      setTimeout(() => setOrderSuccess(false), 5000); // Hide success message after 5s
    } catch (err) {
      console.error("Error submitting order:", err);
      setError(err.response?.data?.msg || 'Failed to submit order. Please try again.');
    }
  };

  // Group menu items by category
  const groupedMenuItems = menuItems.reduce((acc, item) => {
    const category = item.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  return (
    <div className="order-taking-page">
      <h1>Take New Order</h1>

      {error && <p className="error-message">{error}</p>}
      {orderSuccess && <p className="success-message">Order placed successfully!</p>}

      <div className="order-setup">
        {/* Table Selection */}
        <div className="table-selection">
          <h2>Select Table</h2>
          {loadingTables ? (
            <p>Loading tables...</p>
          ) : tables.length > 0 ? (
            <select value={selectedTable} onChange={(e) => { setSelectedTable(e.target.value); setError(null); }} required>
              <option value="" disabled>-- Select a Table --</option>
              {tables.map(table => (
                <option key={table._id} value={table._id}>
                  Table {table.tableNumber} ({table.location} - {table.seats} seats)
                </option>
              ))}
            </select>
          ) : (
            <p>No available tables found.</p>
          )}
        </div>

        {/* Menu Items */}
        <div className="menu-selection">
          <h2>Menu Items</h2>
          {loadingMenu ? (
            <p>Loading menu...</p>
          ) : Object.keys(groupedMenuItems).length > 0 ? (
            Object.entries(groupedMenuItems).map(([category, items]) => (
              <div key={category} className="menu-category-section">
                <h3>{category}</h3>
                <div className="menu-items-grid">
                  {items.map(item => (
                    <div key={item._id} className="menu-item-card">
                      <span>{item.name} ({item.price})</span>
                      <button onClick={() => addItemToOrder(item)}>+</button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p>No menu items found.</p>
          )}
        </div>
      </div>

      {/* Current Order Summary */}
      <div className="current-order-summary">
        <h2>Current Order {selectedTable && `for Table ${tables.find(t=>t._id === selectedTable)?.tableNumber || '...'}`}</h2>
        {currentOrder.length === 0 ? (
          <p>No items added yet.</p>
        ) : (
          <ul>
            {currentOrder.map((orderItem, index) => (
              <li key={index}>
                <span>{orderItem.menuItem.name} x {orderItem.quantity}</span>
                <span>(${(parseFloat(orderItem.menuItem.price.replace(/[^\d.-]/g, '')) * orderItem.quantity).toFixed(2)})</span>
                <button onClick={() => removeItemFromOrder(orderItem.menuItem._id)}>-</button>
              </li>
            ))}
          </ul>
        )}
        <div className="order-total">
          <strong>Total: ${calculateTotal()}</strong>
        </div>
        <button
          onClick={handleSubmitOrder}
          disabled={!selectedTable || currentOrder.length === 0}
          className="submit-order-btn"
        >
          Submit Order
        </button>
      </div>
    </div>
  );
};

export default OrderTakingPage;