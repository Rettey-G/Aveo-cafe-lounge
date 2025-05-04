import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to Aveo Cafe</h1>
          <p>Experience the perfect blend of taste and comfort</p>
          <Link to="/menu" className="cta-button">View Menu</Link>
        </div>
      </section>
      <section className="features">
        <div className="features-grid">
          <div className="feature-card">
            <h3>Fresh Coffee</h3>
            <p>Brewed to perfection</p>
          </div>
          <div className="feature-card">
            <h3>Delicious Food</h3>
            <p>Made with love</p>
          </div>
          <div className="feature-card">
            <h3>Cozy Atmosphere</h3>
            <p>Perfect for work or relaxation</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home; 