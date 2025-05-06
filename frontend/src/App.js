import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Menu from './pages/Menu';
import About from './pages/About';
import Contact from './pages/Contact';
import InventoryPage from './pages/InventoryPage';
import TableLayout from './pages/TableLayout';
import OrderTakingPage from './pages/OrderTakingPage';
import InvoicePage from './pages/InvoicePage';
import Login from './pages/Login';
import './App.css';

// Protected Route component with role check
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && userRole !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <div className="app">
      <Navbar />
        <main className="main-content">
        <Routes>
            {/* Redirect root to login if not authenticated */}
            <Route path="/" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
            
            {/* Admin only routes */}
            <Route 
              path="/inventory" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <InventoryPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/table-layout" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <TableLayout />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/take-order" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <OrderTakingPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/invoice" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <InvoicePage />
                </ProtectedRoute>
              } 
            />
        </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
