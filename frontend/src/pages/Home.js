import React from 'react';
import './Home.css';

function Home() {
  return (
    <div className="home">
      <div className="hero-section">
        <h1>Welcome to Aveo Cafe</h1>
        <p>Experience the perfect blend of taste and comfort</p>
        <button className="cta-button">View Menu</button>
      </div>
      <div className="features-section">
        <div className="feature">
          <h3>Fresh Coffee</h3>
          <p>Brewed to perfection</p>
        </div>
        <div className="feature">
          <h3>Delicious Food</h3>
          <p>Made with love</p>
        </div>
        <div className="feature">
          <h3>Cozy Atmosphere</h3>
          <p>Perfect for work or relaxation</p>
        </div>
      </div>
    </div>
  );
}

export default Home; 