import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="navbar-logo">Avie Cafe</Link>
      </div>
      <ul className="navbar-nav">
        <li className="nav-item">
          <Link to="/" className="nav-link">Home</Link>
        </li>
        <li className="nav-item">
          <Link to="/menu" className="nav-link">Menu</Link>
        </li>
        <li className="nav-item">
          <Link to="/inventory" className="nav-link">Inventory</Link> {/* Add Inventory link */}
        </li>
        <li className="nav-item">
          <Link to="/about" className="nav-link">About</Link>
        </li>
        <li className="nav-item">
          <Link to="/contact" className="nav-link">Contact</Link>
        </li>
        {/* Add other nav items like Login/Register if needed */}
      </ul>
    </nav>
  );
};

export default Navbar;