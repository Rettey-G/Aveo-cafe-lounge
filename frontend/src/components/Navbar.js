import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Temporarily not using userRole since we're showing all links
  // eslint-disable-next-line no-unused-vars
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check user role from localStorage
    const role = localStorage.getItem('userRole');
    const token = localStorage.getItem('token');
    
    // If no token, redirect to login
    if (!token && window.location.pathname !== '/login') {
      navigate('/login');
      return;
    }
    
    setUserRole(role || '');
  }, [navigate]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
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
          
          {/* Management Routes - Temporarily showing for all users */}
          <li className="nav-item">
            <Link to="/users" className="nav-links" onClick={() => setIsMenuOpen(false)}>
              User Management
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/inventory" className="nav-links" onClick={() => setIsMenuOpen(false)}>
              Inventory
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/invoices" className="nav-links" onClick={() => setIsMenuOpen(false)}>
              Create Invoice
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/all-invoices" className="nav-links" onClick={() => setIsMenuOpen(false)}>
              All Invoices
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/orders" className="nav-links" onClick={() => setIsMenuOpen(false)}>
              Manage Orders
            </Link>
          </li>
          
          {/* Staff Routes */}
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
          
          {/* General Routes */}
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
          
          {/* Logout Button - Always visible */}
          <li className="nav-item">
            <button
              className="nav-links logout-btn"
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
            >
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;