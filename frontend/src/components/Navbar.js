import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const navbarRef = useRef(null);
  const menuRef = useRef(null);

  // Check authentication and user role on mount and path change
  useEffect(() => {
    const role = localStorage.getItem('userRole');
    const token = localStorage.getItem('token');
    
    if (!token && location.pathname !== '/login') {
      navigate('/login');
      return;
    }
    
    setUserRole(role || '');
    
    // Close mobile menu on route change
    setIsMenuOpen(false);
  }, [navigate, location.pathname]);
  
  // Handle click outside to close mobile menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) &&
          !event.target.classList.contains('mobile-menu-toggle')) {
        setIsMenuOpen(false);
      }
    };
    
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMenuOpen]);
  
  // Handle scroll to show/hide navbar shadow
  useEffect(() => {
    const handleScroll = () => {
      if (navbarRef.current) {
        if (window.scrollY > 0) {
          navbarRef.current.classList.add('scrolled');
        } else {
          navbarRef.current.classList.remove('scrolled');
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Toggle mobile menu open/closed
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Handle user logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <nav className="navbar" ref={navbarRef}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Aveo Cafe & Lounge
        </Link>

        <button 
          className="mobile-menu-toggle" 
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className="menu-icon">{isMenuOpen ? '✕' : '☰'}</span>
        </button>

        <div className={`nav-menu-container ${isMenuOpen ? 'active' : ''}`} ref={menuRef}>
          <ul className="nav-menu">
            {/* Public Routes */}
            <li className="nav-item">
              <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                <span className="link-icon">🏠</span> Home
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/menu" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                <span className="link-icon">📋</span> Menu
              </Link>
            </li>

            {/* Admin/Manager Routes */}
            {(userRole === 'admin' || userRole === 'manager') && (
              <>
                <li className="nav-item">
                  <Link to="/users" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                    <span className="link-icon">👥</span> Users
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/inventory" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                    <span className="link-icon">📦</span> Inventory
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/menu-management" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                    <span className="link-icon">🍽️</span> Menu Items
                  </Link>
                </li>
              </>
            )}

            {/* Staff Routes */}
            {(userRole === 'admin' || userRole === 'manager' || userRole === 'waiter') && (
              <>
                <li className="nav-item">
                  <Link to="/table-layout" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                    <span className="link-icon">🪑</span> Tables
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/take-order" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                    <span className="link-icon">📝</span> New Order
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/orders" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                    <span className="link-icon">📋</span> Orders
                  </Link>
                </li>
              </>
            )}

            {/* Financial Routes */}
            {(userRole === 'admin' || userRole === 'manager' || userRole === 'cashier') && (
              <>
                <li className="nav-item">
                  <Link to="/invoices" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                    <span className="link-icon">🧾</span> Create Invoice
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/all-invoices" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                    <span className="link-icon">📊</span> All Invoices
                  </Link>
                </li>
              </>
            )}

            {/* Logout */}
            <li className="nav-item">
              <button className="nav-link logout-btn" onClick={handleLogout}>
                <span className="link-icon">🚪</span> Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Backdrop overlay for mobile */}
      {isMenuOpen && <div className="menu-backdrop" onClick={() => setIsMenuOpen(false)} />}
    </nav>
  );
}

export default Navbar;