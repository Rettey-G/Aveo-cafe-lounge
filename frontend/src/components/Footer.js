import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul className="footer-links">
              <li>
                <Link to="/about">About Us</Link>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Contact Info</h3>
            <p>📍 123 Cafe Street</p>
            <p>📞 (555) 123-4567</p>
            <p>✉️ info@aveocafe.com</p>
          </div>
          <div className="footer-section">
            <h3>Hours</h3>
            <p>Mon-Fri: 8:00 AM - 10:00 PM</p>
            <p>Sat-Sun: 9:00 AM - 11:00 PM</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Aveo Cafe & Lounge. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;