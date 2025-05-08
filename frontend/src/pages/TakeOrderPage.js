import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './TakeOrderPage.css';

const TakeOrderPage = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTable, setSelectedTable] = useState(null);
  const [tables, setTables] = useState([]);
  const [currentOrder, setCurrentOrder] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [serviceCharge, setServiceCharge] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderType, setOrderType] = useState('dine-in'); // dine-in or take-away

  // Fetch menu items and tables on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch menu items
        const menuResponse = await api.get('/menu-items');
        setMenuItems(menuResponse.data);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(menuResponse.data.map(item => item.category))];
        setCategories(uniqueCategories);
        
        // Fetch available tables
        const tablesResponse = await api.get('/tables');
        setTables(tablesResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Calculate totals whenever current order changes
  useEffect(() => {
    const calcSubtotal = currentOrder.reduce(
      (sum, item) => sum + (item.price * item.quantity), 0
    );
    setSubtotal(calcSubtotal);
    
    const calcServiceCharge = calcSubtotal * 0.10; // 10% service charge
    setServiceCharge(calcServiceCharge);
    
    const calcTax = calcSubtotal * 0.16; // 16% tax
    setTax(calcTax);
    
    setTotal(calcSubtotal + calcServiceCharge + calcTax);
  }, [currentOrder]);
  
  // Filter menu items by category
  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);
    
  // Add item to current order
  const addToOrder = (item) => {
    const existingItemIndex = currentOrder.findIndex(orderItem => orderItem._id === item._id);
    
    if (existingItemIndex >= 0) {
      // Item already exists in order, increase quantity
      const updatedOrder = [...currentOrder];
      updatedOrder[existingItemIndex].quantity += 1;
      setCurrentOrder(updatedOrder);
    } else {
      // Add new item to order
      setCurrentOrder([...currentOrder, { ...item, quantity: 1 }]);
    }
  };
  
  // Remove item from order
  const removeFromOrder = (itemId) => {
    setCurrentOrder(currentOrder.filter(item => item._id !== itemId));
  };
  
  // Update item quantity
  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedOrder = currentOrder.map(item => 
      item._id === itemId ? { ...item, quantity: newQuantity } : item
    );
    
    setCurrentOrder(updatedOrder);
  };
  
  // Handle table selection
  const selectTable = (table) => {
    setSelectedTable(table);
  };
  
  // Process order
  const processOrder = async () => {
    if (currentOrder.length === 0) {
      alert('Please add items to the order');
      return;
    }
    
    if (orderType === 'dine-in' && !selectedTable) {
      alert('Please select a table for dine-in order');
      return;
    }
    
    try {
      setLoading(true);
      
      const orderData = {
        items: currentOrder.map(item => ({
          itemId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        table: selectedTable ? selectedTable._id : null,
        customerName: customerName || 'Guest',
        subtotal,
        serviceCharge,
        tax,
        total,
        type: orderType,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      const response = await api.post('/orders', orderData);
      
      if (response.data) {
        alert('Order placed successfully!');
        // Reset order
        setCurrentOrder([]);
        setCustomerName('');
        setSelectedTable(null);
      }
    } catch (error) {
      console.error('Error processing order:', error);
      alert('Error placing order. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Generate printable receipt
  const printReceipt = () => {
    if (currentOrder.length === 0) {
      alert('Please add items to the order');
      return;
    }
    
    // Open print dialog
    window.print();
  };
  
  // Convert price to string with 2 decimal places
  const formatPrice = (price) => {
    return parseFloat(price).toFixed(2);
  };
  
  // Proceed to payment/invoice
  const goToInvoice = () => {
    if (currentOrder.length === 0) {
      alert('Please add items to the order');
      return;
    }
    
    // Save current order to local storage to be accessed by the invoice page
    localStorage.setItem('currentOrder', JSON.stringify({
      items: currentOrder,
      table: selectedTable,
      customerName,
      subtotal,
      serviceCharge,
      tax,
      total,
      type: orderType
    }));
    
    // Navigate to invoice page
    navigate('/invoices');
  };

  return (
    <div className="take-order-page">
      <h1>Take Order</h1>
      
      <div className="order-container">
        {/* Left side - Menu items */}
        <div className="menu-section">
          <div className="order-type-selector">
            <button 
              className={`order-type-btn ${orderType === 'dine-in' ? 'active' : ''}`}
              onClick={() => setOrderType('dine-in')}
            >
              <span role="img" aria-label="Dine In">🍽️</span> Dine In
            </button>
            <button 
              className={`order-type-btn ${orderType === 'take-away' ? 'active' : ''}`}
              onClick={() => setOrderType('take-away')}
            >
              <span role="img" aria-label="Take Away">🥡</span> Take Away
            </button>
          </div>
          
          {/* Categories */}
          <div className="category-selector">
            <button 
              className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              All
            </button>
            {categories.map(category => (
              <button 
                key={category} 
                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
          
          {/* Menu Items */}
          <div className="menu-items-grid">
            {loading ? (
              <p>Loading menu items...</p>
            ) : (
              filteredItems.map(item => (
                <div key={item._id} className="menu-item-card" onClick={() => addToOrder(item)}>
                  <div className="menu-item-image">
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <div className="placeholder-image">
                        <span role="img" aria-label="Food">🍽️</span>
                      </div>
                    )}
                  </div>
                  <div className="menu-item-details">
                    <h3>{item.name}</h3>
                    <p>Rs. {formatPrice(item.price)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Right side - Current order */}
        <div className="order-summary">
          {/* Customer & Table Info */}
          <div className="order-info">
            {orderType === 'dine-in' && (
              <div className="table-selector">
                <h3>Select Table</h3>
                <div className="tables-grid">
                  {tables.map(table => (
                    <button
                      key={table._id}
                      className={`table-btn ${selectedTable && selectedTable._id === table._id ? 'active' : ''} ${table.status === 'occupied' ? 'occupied' : ''}`}
                      onClick={() => selectTable(table)}
                      disabled={table.status === 'occupied' && (!selectedTable || selectedTable._id !== table._id)}
                    >
                      {table.number}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="customer-info">
              <label htmlFor="customerName">Customer Name:</label>
              <input
                type="text"
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Guest"
              />
            </div>
          </div>
          
          {/* Current Order Items */}
          <div className="current-order">
            <h3>Current Order</h3>
            
            {currentOrder.length === 0 ? (
              <p className="empty-order">No items added yet</p>
            ) : (
              <div className="order-items">
                {currentOrder.map(item => (
                  <div key={item._id} className="order-item">
                    <div className="order-item-details">
                      <h4>{item.name}</h4>
                      <p>Rs. {formatPrice(item.price)} x {item.quantity}</p>
                    </div>
                    <div className="order-item-actions">
                      <button className="quantity-btn" onClick={() => updateQuantity(item._id, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button className="quantity-btn" onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                      <button className="remove-btn" onClick={() => removeFromOrder(item._id)}>×</button>
                    </div>
                    <div className="order-item-total">
                      Rs. {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Order Totals */}
          <div className="order-totals">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>Rs. {formatPrice(subtotal)}</span>
            </div>
            <div className="total-row">
              <span>Service Charge (10%):</span>
              <span>Rs. {formatPrice(serviceCharge)}</span>
            </div>
            <div className="total-row">
              <span>GST (16%):</span>
              <span>Rs. {formatPrice(tax)}</span>
            </div>
            <div className="total-row grand-total">
              <span>Total:</span>
              <span>Rs. {formatPrice(total)}</span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="order-actions">
            <button 
              className="action-btn cancel-btn" 
              onClick={() => setCurrentOrder([])}
              disabled={currentOrder.length === 0}
            >
              Cancel Order
            </button>
            <button 
              className="action-btn print-btn" 
              onClick={printReceipt}
              disabled={currentOrder.length === 0}
            >
              Print Receipt
            </button>
            <button 
              className="action-btn process-btn" 
              onClick={processOrder}
              disabled={currentOrder.length === 0 || (orderType === 'dine-in' && !selectedTable)}
            >
              Process Order
            </button>
            <button 
              className="action-btn invoice-btn" 
              onClick={goToInvoice}
              disabled={currentOrder.length === 0}
            >
              Generate Invoice
            </button>
          </div>
          
          {/* Numpad for quick entry (optional) */}
          <div className="numpad">
            <div className="numpad-row">
              <button className="numpad-btn">1</button>
              <button className="numpad-btn">2</button>
              <button className="numpad-btn">3</button>
            </div>
            <div className="numpad-row">
              <button className="numpad-btn">4</button>
              <button className="numpad-btn">5</button>
              <button className="numpad-btn">6</button>
            </div>
            <div className="numpad-row">
              <button className="numpad-btn">7</button>
              <button className="numpad-btn">8</button>
              <button className="numpad-btn">9</button>
            </div>
            <div className="numpad-row">
              <button className="numpad-btn">.</button>
              <button className="numpad-btn">0</button>
              <button className="numpad-btn">C</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeOrderPage;
