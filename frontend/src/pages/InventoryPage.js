import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './InventoryPage.css'; // We'll create this file next

const InventoryPage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Fetch menu items on component mount
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        };
        const { data } = await axios.get(`${API_URL}/menu-items`, config);
        setMenuItems(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch inventory items.');
        console.error(err);
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, [API_URL]);

  // Function to handle stock update
  const handleStockUpdate = async (id, newStock) => {
    // Prevent negative stock
    if (newStock < 0) {
        alert('Stock quantity cannot be negative.');
        return;
    }
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };
      // Send PUT request to update stock quantity
      await axios.put(`${API_URL}/menu-items/${id}`, { stockQuantity: newStock }, config);

      // Update the state locally
      setMenuItems(prevItems =>
        prevItems.map(item =>
          item._id === id ? { ...item, stockQuantity: newStock } : item
        )
      );
    } catch (err) {
      setError('Failed to update stock quantity.');
      console.error(err);
      // Optionally: revert local state change or show specific error
    }
  };

  if (loading) return <div>Loading inventory...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="inventory-container">
      <h2>Inventory Management</h2>
      <table className="inventory-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Current Stock</th>
            <th>Update Stock</th>
          </tr>
        </thead>
        <tbody>
          {menuItems.map(item => (
            <tr key={item._id}>
              <td>{item.name}</td>
              <td>{item.category}</td>
              <td>${item.price.toFixed(2)}</td>
              <td>{item.stockQuantity}</td>
              <td>
                <input
                  type="number"
                  min="0"
                  defaultValue={item.stockQuantity}
                  onBlur={(e) => handleStockUpdate(item._id, parseInt(e.target.value, 10))}
                  className="stock-input"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryPage;