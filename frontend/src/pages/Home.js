import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Welcome to Aveo Cafe & Lounge</h1>
        <p>Experience the perfect blend of coffee, food, and ambiance</p>
        <Link to="/menu" className="cta-button">View Our Menu</Link>
      </div>

      <div className="features-section">
        <div className="feature-card">
          <h3>Fresh Coffee</h3>
          <p>Handcrafted beverages made with premium beans</p>
        </div>
        <div className="feature-card">
          <h3>Delicious Food</h3>
          <p>Freshly prepared meals and pastries</p>
        </div>
        <div className="feature-card">
          <h3>Cozy Atmosphere</h3>
          <p>Perfect for work, meetings, or relaxation</p>
        </div>
      </div>
    </div>
  );
}

export default Home; 