import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import './OrdersPage.css';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  // Fetch all orders
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders');
      setOrders(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err.response?.data?.message || err.message);
      setError('Failed to fetch orders. Please try again.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      // Update the local state
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status. Please try again.');
    }
  };

  // Filter orders by status
  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  return (
    <div className="orders-page">
      <h1>Orders Management</h1>
      
      <div className="filter-controls">
        <span>Filter by status: </span>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="making">Making</option>
          <option value="served">Served</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {loading ? (
        <p>Loading orders...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : filteredOrders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="orders-list">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Table</th>
                <th>Items</th>
                <th>Total</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order._id} className={`status-${order.status || 'pending'}`}>
                  <td>{order._id ? order._id.substring(order._id.length - 6) : 'N/A'}</td>
                  <td>
                    {typeof order.table === 'object' && order.table ? 
                      `Table ${order.table.number || 'Unknown'}` : 
                      (order.tableNumber ? `Table ${order.tableNumber}` : 'Table Unknown')}
                  </td>
                  <td>
                    <ul className="order-items">
                      {order.items && order.items.length > 0 ? order.items.map((item, index) => (
                        <li key={index}>
                          {typeof item === 'object' ? 
                            `${item.name || 'Unknown Item'} x ${item.quantity || 1} - Rs. ${parseFloat(item.price || 0).toFixed(2)}` : 
                            `${item || 'Unknown Item'}`}
                        </li>
                      )) : <li>No items</li>}
                    </ul>
                  </td>
                  <td>Rs. {parseFloat(order.total || 0).toFixed(2)}</td>
                  <td>{new Date(order.createdAt).toLocaleString()}</td>
                  <td>
                    <span className={`status-badge ${order.status || 'pending'}`}>
                      {order.status || 'pending'}
                    </span>
                  </td>
                  <td>
                    <select 
                      value={order.status || 'pending'}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="making">Making</option>
                      <option value="served">Served</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="refresh-button">
        <button onClick={fetchOrders}>Refresh Orders</button>
      </div>
    </div>
  );
};

export default OrdersPage;
