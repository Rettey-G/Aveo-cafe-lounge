import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Menu from './pages/Menu';
import About from './pages/About';
import Contact from './pages/Contact';
import InventoryPage from './pages/InventoryPage';
import TableLayout from './pages/TableLayout';
import OrderTakingPage from './pages/OrderTakingPage';
import InvoicePage from './pages/InvoicePage';
import AllInvoicesPage from './pages/AllInvoicesPage';
import UserManagement from './pages/UserManagement';
import Login from './pages/Login';
import './App.css';

// Protected Route component with role check - temporarily allowing all access
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  // Temporarily commenting out token check for testing
  // const token = localStorage.getItem('token');
  // const userRole = localStorage.getItem('userRole');

  // if (!token) {
  //   return <Navigate to="/login" replace />;
  // }

  // if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
  //   return <Navigate to="/" replace />;
  // }

  // Temporarily allow access to all routes
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
            
            {/* Admin/Manager only routes */}
            <Route 
              path="/users" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <UserManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/inventory" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <InventoryPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/invoices" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager', 'cashier']}>
                  <InvoicePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/all-invoices" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager', 'cashier']}>
                  <AllInvoicesPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Staff routes */}
            <Route 
              path="/table-layout" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager', 'waiter', 'cashier']}>
                  <TableLayout />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/take-order" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager', 'waiter', 'cashier']}>
                  <OrderTakingPage />
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
