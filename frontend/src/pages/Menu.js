import React from 'react';
import './Menu.css';

function Menu() {
  const menuItems = [
    {
      category: 'Hot Coffee',
      items: [
        { name: 'Espresso', price: '$3.50', description: 'Strong and pure coffee shot' },
        { name: 'Cappuccino', price: '$4.50', description: 'Espresso with steamed milk and foam' },
        { name: 'Latte', price: '$4.75', description: 'Espresso with steamed milk' }
      ]
    },
    {
      category: 'Cold Drinks',
      items: [
        { name: 'Iced Coffee', price: '$4.00', description: 'Chilled coffee with ice' },
        { name: 'Frappuccino', price: '$5.50', description: 'Blended coffee drink' },
        { name: 'Cold Brew', price: '$4.25', description: 'Slow-steeped coffee' }
      ]
    },
    {
      category: 'Food',
      items: [
        { name: 'Croissant', price: '$3.50', description: 'Buttery, flaky pastry' },
        { name: 'Sandwich', price: '$6.50', description: 'Fresh ingredients on artisan bread' },
        { name: 'Salad', price: '$7.50', description: 'Fresh garden salad' }
      ]
    }
  ];

  return (
    <div className="menu-page">
      <h1>Our Menu</h1>
      <div className="menu-container">
        {menuItems.map((category, index) => (
          <div key={index} className="menu-category">
            <h2>{category.category}</h2>
            <div className="menu-items">
              {category.items.map((item, itemIndex) => (
                <div key={itemIndex} className="menu-item">
                  <div className="item-header">
                    <h3>{item.name}</h3>
                    <span className="price">{item.price}</span>
                  </div>
                  <p className="description">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Menu; 