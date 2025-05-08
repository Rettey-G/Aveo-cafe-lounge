import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './TakeOrderPage.css';

const TakeOrderPage = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState(['Coffee', 'Tea', 'Juice', 'Smoothie', 'Bakery']);
  const [selectedCategory, setSelectedCategory] = useState('Coffee');
  const [selectedTable, setSelectedTable] = useState(null);
  const [tables, setTables] = useState([]);
  const [currentOrder, setCurrentOrder] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderType, setOrderType] = useState('dine-in');
  const [selectedSize, setSelectedSize] = useState('medium');
  const [customizations, setCustomizations] = useState({
    extraShot: false,
    whipCream: false,
    caramelSyrup: false,
    chocolateSyrup: false,
    soyMilk: false,
    freshMilk: true
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const menuResponse = await api.get('/menu-items');
        setMenuItems(menuResponse.data);
        
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
  
  useEffect(() => {
    const calcSubtotal = currentOrder.reduce(
      (sum, item) => sum + calculateItemTotal(item), 0
    );
    setSubtotal(calcSubtotal);
    
    const calcTax = calcSubtotal * 0.16;
    setTax(calcTax);
    
    setTotal(calcSubtotal + calcTax);
  }, [currentOrder]);

  const calculateItemTotal = (item) => {
    let price = item.price;
    
    // Add size adjustments
    if (item.size === 'large') price += 1.00;
    if (item.size === 'small') price -= 0.50;
    
    // Add customization costs
    if (item.customizations) {
      if (item.customizations.extraShot) price += 0.75;
      if (item.customizations.whipCream) price += 0.50;
      if (item.customizations.caramelSyrup) price += 0.50;
      if (item.customizations.chocolateSyrup) price += 0.50;
      if (item.customizations.soyMilk) price += 0.75;
    }
    
    return price * item.quantity;
  };

  const addToOrder = (item) => {
    const orderItem = {
      ...item,
      size: selectedSize,
      customizations: { ...customizations },
      quantity: 1
    };

    const existingItemIndex = currentOrder.findIndex(orderItem => 
      orderItem._id === item._id && 
      orderItem.size === selectedSize &&
      JSON.stringify(orderItem.customizations) === JSON.stringify(customizations)
    );
    
    if (existingItemIndex >= 0) {
      const updatedOrder = [...currentOrder];
      updatedOrder[existingItemIndex].quantity += 1;
      setCurrentOrder(updatedOrder);
    } else {
      setCurrentOrder([...currentOrder, orderItem]);
    }
  };

  const removeFromOrder = (index) => {
    const updatedOrder = currentOrder.filter((_, i) => i !== index);
    setCurrentOrder(updatedOrder);
  };

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedOrder = [...currentOrder];
    updatedOrder[index].quantity = newQuantity;
    setCurrentOrder(updatedOrder);
  };

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
          price: calculateItemTotal(item) / item.quantity,
          quantity: item.quantity,
          size: item.size,
          customizations: item.customizations
        })),
        table: selectedTable ? selectedTable._id : null,
        customerName: customerName || 'Guest',
        subtotal,
        tax,
        total,
        type: orderType,
        status: 'pending'
      };
      
      const response = await api.post('/orders', orderData);
      
      if (response.data) {
        alert('Order placed successfully!');
        setCurrentOrder([]);
        setCustomerName('');
        setSelectedTable(null);
        setCustomizations({
          extraShot: false,
          whipCream: false,
          caramelSyrup: false,
          chocolateSyrup: false,
          soyMilk: false,
          freshMilk: true
        });
      }
    } catch (error) {
      console.error('Error processing order:', error);
      alert('Error placing order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="take-order-page">
      <h1>Take Order</h1>
      
      <div className="order-container">
        <div className="menu-section">
          <div className="categories">
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

          <div className="customization-options">
            <div className="size-options">
              <button
                className={`size-btn ${selectedSize === 'small' ? 'active' : ''}`}
                onClick={() => setSelectedSize('small')}
              >
                Small
              </button>
              <button
                className={`size-btn ${selectedSize === 'medium' ? 'active' : ''}`}
                onClick={() => setSelectedSize('medium')}
              >
                Medium
              </button>
              <button
                className={`size-btn ${selectedSize === 'large' ? 'active' : ''}`}
                onClick={() => setSelectedSize('large')}
              >
                Large
              </button>
            </div>

            <div className="add-ons">
              <label>
                <input
                  type="checkbox"
                  checked={customizations.extraShot}
                  onChange={(e) => setCustomizations({ ...customizations, extraShot: e.target.checked })}
                />
                Extra Shot (+$0.75)
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={customizations.whipCream}
                  onChange={(e) => setCustomizations({ ...customizations, whipCream: e.target.checked })}
                />
                Whip Cream (+$0.50)
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={customizations.caramelSyrup}
                  onChange={(e) => setCustomizations({ ...customizations, caramelSyrup: e.target.checked })}
                />
                Caramel Syrup (+$0.50)
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={customizations.chocolateSyrup}
                  onChange={(e) => setCustomizations({ ...customizations, chocolateSyrup: e.target.checked })}
                />
                Chocolate Syrup (+$0.50)
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={customizations.soyMilk}
                  onChange={(e) => setCustomizations({ ...customizations, soyMilk: e.target.checked })}
                />
                Soy Milk (+$0.75)
              </label>
            </div>
          </div>

          <div className="menu-grid">
            {menuItems
              .filter(item => item.category === selectedCategory)
              .map(item => (
                <div
                  key={item._id}
                  className="menu-item"
                  onClick={() => addToOrder(item)}
                >
                  {item.image && <img src={item.image} alt={item.name} />}
                  <h3>{item.name}</h3>
                  <p>${item.price.toFixed(2)}</p>
                </div>
              ))}
          </div>
        </div>

        <div className="order-summary">
          <div className="order-type-toggle">
            <button
              className={`order-type-btn ${orderType === 'dine-in' ? 'active' : ''}`}
              onClick={() => setOrderType('dine-in')}
            >
              Dine In
            </button>
            <button
              className={`order-type-btn ${orderType === 'take-away' ? 'active' : ''}`}
              onClick={() => setOrderType('take-away')}
            >
              Take Away
            </button>
          </div>

          {orderType === 'dine-in' && (
            <div className="table-grid">
              {tables.map(table => (
                <button
                  key={table._id}
                  className={`table-btn ${selectedTable?._id === table._id ? 'selected' : ''} ${table.isOccupied ? 'occupied' : ''}`}
                  onClick={() => !table.isOccupied && selectTable(table)}
                  disabled={table.isOccupied}
                >
                  {table.number}
                </button>
              ))}
            </div>
          )}

          <div className="order-items">
            {currentOrder.map((item, index) => (
              <div key={index} className="order-item">
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p>
                    Size: {item.size}
                    {Object.entries(item.customizations)
                      .filter(([key, value]) => value && key !== 'freshMilk')
                      .map(([key]) => ` + ${key}`)
                      .join('')}
                  </p>
                </div>
                <div className="quantity-controls">
                  <button
                    className="quantity-btn"
                    onClick={() => updateQuantity(index, item.quantity - 1)}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    className="quantity-btn"
                    onClick={() => updateQuantity(index, item.quantity + 1)}
                  >
                    +
                  </button>
                  <button
                    className="remove-btn"
                    onClick={() => removeFromOrder(index)}
                  >
                    ×
                  </button>
                </div>
                <div className="item-total">
                  ${calculateItemTotal(item).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="order-totals">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span>Tax (16%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="total-row grand-total">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="action-buttons">
            <button
              className="action-btn process-btn"
              onClick={processOrder}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Process Order'}
            </button>
            <button
              className="action-btn invoice-btn"
              onClick={() => navigate('/invoices')}
              disabled={loading || currentOrder.length === 0}
            >
              Generate Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeOrderPage;
