import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Aveo Cafe & Lounge
        </Link>

        <div className="mobile-menu-icon" onClick={toggleMenu}>
          {isMenuOpen ? '✕' : '☰'}
        </div>

        <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <li className="nav-item">
            <Link to="/" className="nav-links" onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/menu" className="nav-links" onClick={() => setIsMenuOpen(false)}>
              Menu
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/inventory" className="nav-links" onClick={() => setIsMenuOpen(false)}>
              Inventory
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/table-layout" className="nav-links" onClick={() => setIsMenuOpen(false)}>
              Table Layout
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/take-order" className="nav-links" onClick={() => setIsMenuOpen(false)}>
              Take Order
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/about" className="nav-links" onClick={() => setIsMenuOpen(false)}>
              About
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/contact" className="nav-links" onClick={() => setIsMenuOpen(false)}>
              Contact
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;