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
  const [success, setSuccess] = useState(null);

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
    if (table.status === 'occupied') {
      setError('This table is already occupied');
      return;
    }
    setSelectedTable(table);
    setOrder([]); // Clear order when changing tables
    setError(null);
  };

  const addItem = (item) => {
    if (!selectedTable) {
      setError('Please select a table first');
      return;
    }
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
    setError(null);
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
      setError(null);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      setOrder([]);
      setSelectedTable(null);
      setError(null);
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
      setLoading(true);
      setError(null);
      setSuccess(null);

      // First check if table is still available
      const tableResponse = await api.get(`/tables/${selectedTable._id}`);
      if (tableResponse.data.status === 'occupied') {
        setError('This table is now occupied. Please select another table.');
        return;
      }

      const orderData = {
        table: selectedTable._id,
        items: order.map(item => ({
          item: item._id,
          quantity: item.qty,
          price: item.price,
          name: item.name
        })),
        orderType: 'KOT',
        status: 'pending',
        totalAmount: subtotal + serviceCharge,
        subtotal: subtotal,
        serviceCharge: serviceCharge
      };

      console.log('Sending order data:', JSON.stringify(orderData, null, 2));

      const response = await api.post('/orders', orderData);
      
      if (response.data) {
        // Update table status to occupied
        await api.put(`/tables/${selectedTable._id}`, {
          status: 'occupied'
        });
        
        setOrder([]);
        setSelectedTable(null);
        setSuccess('Order placed successfully! Table is now occupied.');
        
        // Refresh tables to update status
        await fetchTables();
      }
    } catch (err) {
      console.error('Order Error:', err);
      if (err.response) {
        console.error('Error Response:', err.response.data);
        setError(`Failed to place order: ${err.response.data.message || err.response.data.error || 'Server error'}`);
      } else if (err.request) {
        setError('No response from server. Please check your connection.');
      } else {
        setError('Failed to place order. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Add a function to check if order can be sent
  const canSendOrder = () => {
    return selectedTable && order.length > 0 && !loading;
  };

  // Add polling for table status updates
  useEffect(() => {
    const pollTables = setInterval(() => {
      fetchTables();
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(pollTables);
  }, []);

  // Add loading state to UI
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

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
              className={`table-btn ${selectedTable?._id === table._id ? 'selected' : ''} ${table.status}`}
              onClick={() => handleTableSelect(table)}
              disabled={table.status === 'occupied'}
            >
              Table {table.tableNumber}
              {table.status === 'occupied' && ' (Occupied)'}
            </button>
          ))}
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

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
              <span>Rs. {(item.price * item.qty).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="classic-pos-summary">
          <div>Subtotal <span>Rs. {subtotal.toFixed(2)}</span></div>
          <div>Service Chrg <span>Rs. {serviceCharge.toFixed(2)}</span></div>
          <div>Payment <span>Rs. {payment.toFixed(2)}</span></div>
          <div className="classic-pos-total">
            Total <span>Rs. {(subtotal + serviceCharge).toFixed(2)}</span>
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
              <span className="price">Rs. {item.price}</span>
            </button>
          ))}
        </div>
        <div className="classic-pos-actions">
          <button className="classic-pos-action-btn red" onClick={handleVoid}>Void</button>
          <button className="classic-pos-action-btn red" onClick={handleCancel}>Cancel</button>
          <button 
            className={`classic-pos-action-btn green ${!canSendOrder() ? 'disabled' : ''}`}
            onClick={handleSend}
            disabled={!canSendOrder()}
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TakeOrderPage;
