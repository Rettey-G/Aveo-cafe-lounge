import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './TakeOrderPage.css';

const combos = [
  'Combo 1', 'Combo 2', 'Combo 3', 'Combo 4', 'Combo 5', 'Combo 6',
  'Combo 7', 'Combo 8', 'Combo 9', 'Combo 10', 'Combo 11', 'Combo 12'
];
const menuButtons = [
  'Burger', 'Cheese Burger', 'Bacon Burger', 'Bacon Chz Burger', 'Grill Chicken', 'Ranch Chicken',
  'Cajun Chicken', 'Cajun Sandwch', 'Fish Sandwch', 'Chicken Strip', 'Chicken Strip (lg)', 'Small Fries',
  'Med Fries', 'Lrg Fries', 'Reg Rings', 'Lrg Rings', 'Breakfast', 'Specialty', 'Salads', 'Kids Meals',
  'Dessert', 'Beverage', 'Prep', 'Change Condiments'
];
const actionButtons = [
  { label: 'Cancel', color: 'red' },
  { label: 'Void', color: 'red' },
  { label: 'Send', color: 'green' },
  { label: 'Pay', color: 'green' },
  { label: 'Drive Thru', color: 'blue' },
  { label: 'To Go', color: 'blue' },
  { label: 'Eat In', color: 'blue' }
];

const TakeOrderPage = () => {
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [order, setOrder] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [serviceCharge, setServiceCharge] = useState(0);
  const [payment, setPayment] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch tables and menu items on component mount
  useEffect(() => {
    fetchTables();
    fetchMenuItems();
  }, []);

  // Calculate subtotal whenever order changes
  useEffect(() => {
    const newSubtotal = order.reduce((sum, item) => sum + (item.price * item.qty), 0);
    setSubtotal(newSubtotal);
    setServiceCharge(newSubtotal * 0.1); // 10% service charge
  }, [order]);

  const fetchTables = async () => {
    try {
      const response = await api.get('/tables');
      setTables(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tables');
      console.error(err);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await api.get('/menu-items');
      setMenuItems(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch menu items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTableSelect = (table) => {
    setSelectedTable(table);
    setOrder([]); // Clear order when changing tables
  };

  const addItem = (item) => {
    const existingItem = order.find(orderItem => orderItem._id === item._id);
    if (existingItem) {
      setOrder(order.map(orderItem => 
        orderItem._id === item._id 
          ? { ...orderItem, qty: orderItem.qty + 1 }
          : orderItem
      ));
    } else {
      setOrder([...order, { ...item, qty: 1 }]);
    }
  };

  const removeItem = (itemId) => {
    setOrder(order.filter(item => item._id !== itemId));
  };

  const updateQuantity = (itemId, newQty) => {
    if (newQty < 1) {
      removeItem(itemId);
      return;
    }
    setOrder(order.map(item => 
      item._id === itemId ? { ...item, qty: newQty } : item
    ));
  };

  const handleVoid = () => {
    if (window.confirm('Are you sure you want to void this order?')) {
      setOrder([]);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      setOrder([]);
      setSelectedTable(null);
    }
  };

  const handleSend = async () => {
    if (!selectedTable) {
      setError('Please select a table first');
      return;
    }
    if (order.length === 0) {
      setError('Please add items to the order');
      return;
    }

    try {
      const orderData = {
        table: selectedTable._id,
        items: order.map(item => ({
          menuItem: item._id,
          quantity: item.qty,
          price: item.price
        })),
        subtotal,
        serviceCharge,
        total: subtotal + serviceCharge
      };

      await api.post('/orders', orderData);
      setOrder([]);
      setSelectedTable(null);
      setError(null);
      alert('Order sent successfully!');
    } catch (err) {
      setError('Failed to send order');
      console.error(err);
    }
  };

  return (
    <div className="classic-pos-root">
      <div className="classic-pos-left">
        <div className="classic-pos-header">
          {selectedTable ? `Table ${selectedTable.tableNumber}` : 'Select Table'}
        </div>
        
        {/* Table Selection */}
        <div className="table-selection">
          {tables.map(table => (
            <button
              key={table._id}
              className={`table-btn ${selectedTable?._id === table._id ? 'selected' : ''}`}
              onClick={() => handleTableSelect(table)}
            >
              Table {table.tableNumber}
            </button>
          ))}
        </div>

        <div className="classic-pos-order-list">
          <div className="classic-pos-order-item-header">
            <span>#</span><span>Item</span><span>Qty</span><span>Price</span>
          </div>
          {order.map((item, idx) => (
            <div className="classic-pos-order-item" key={item._id}>
              <span>{idx + 1}</span>
              <span>{item.name}</span>
              <span>
                <button onClick={() => updateQuantity(item._id, item.qty - 1)}>-</button>
                {item.qty}
                <button onClick={() => updateQuantity(item._id, item.qty + 1)}>+</button>
              </span>
              <span>${(item.price * item.qty).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="classic-pos-summary">
          <div>Subtotal <span>${subtotal.toFixed(2)}</span></div>
          <div>Service Chrg <span>${serviceCharge.toFixed(2)}</span></div>
          <div>Payment <span>${payment.toFixed(2)}</span></div>
          <div className="classic-pos-total">
            Total <span>${(subtotal + serviceCharge).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="classic-pos-right">
        <div className="classic-pos-combos">
          {combos.map(combo => (
            <button key={combo} className="classic-pos-combo-btn">{combo}</button>
          ))}
        </div>
        <div className="classic-pos-menu-grid">
          {menuItems.map(item => (
            <button
              key={item._id}
              className="classic-pos-menu-btn"
              onClick={() => addItem(item)}
            >
              {item.name}
            </button>
          ))}
        </div>
        <div className="classic-pos-actions">
          <button className="classic-pos-action-btn red" onClick={handleVoid}>Void</button>
          <button className="classic-pos-action-btn red" onClick={handleCancel}>Cancel</button>
          <button className="classic-pos-action-btn green" onClick={handleSend}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default TakeOrderPage;
