import React, { useState, useEffect } from 'react';
import './ClassicOrderPage.css';

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

const ClassicOrderPage = () => {
  const [order, setOrder] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [serviceCharge, setServiceCharge] = useState(0.41);
  const [payment, setPayment] = useState(5.14);

  useEffect(() => {
    // Example subtotal calculation
    setSubtotal(order.reduce((sum, item) => sum + item.price * item.qty, 0));
  }, [order]);

  const addItem = (name, price = 1.00) => {
    setOrder([...order, { name, price, qty: 1 }]);
  };

  return (
    <div className="classic-pos-root">
      <div className="classic-pos-left">
        <div className="classic-pos-header">Seat 1 : Ready For Your Next Entry</div>
        <div className="classic-pos-order-list">
          <div className="classic-pos-order-item-header">
            <span>#</span><span>Item</span><span>Qty</span><span>Price</span>
          </div>
          {order.map((item, idx) => (
            <div className="classic-pos-order-item" key={idx}>
              <span>{idx + 1}</span>
              <span>{item.name}</span>
              <span>{item.qty}</span>
              <span>{item.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="classic-pos-summary">
          <div>Subtotal <span>{subtotal.toFixed(2)}</span></div>
          <div>Service Chrg <span>{serviceCharge.toFixed(2)}</span></div>
          <div>Payment <span>{payment.toFixed(2)}</span></div>
          <div className="classic-pos-total">Bar Ttl! <span>{(subtotal + serviceCharge).toFixed(2)}</span></div>
        </div>
      </div>
      <div className="classic-pos-right">
        <div className="classic-pos-combos">
          {combos.map(combo => (
            <button key={combo} className="classic-pos-combo-btn">{combo}</button>
          ))}
        </div>
        <div className="classic-pos-menu-grid">
          {menuButtons.map(btn => (
            <button key={btn} className="classic-pos-menu-btn" onClick={() => addItem(btn)}>{btn}</button>
          ))}
        </div>
        <div className="classic-pos-actions">
          {actionButtons.map(btn => (
            <button key={btn.label} className={`classic-pos-action-btn ${btn.color}`}>{btn.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClassicOrderPage; 