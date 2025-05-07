import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import './AllInvoicesPage.css';

const AllInvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // API URL is now handled by the centralized API utility

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/invoices');
      setInvoices(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching invoices:", err);
      setError('Failed to fetch invoices. Please try again.');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowModal(true);
  };

  const handleDeleteInvoice = async (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await api.delete(`/invoices/${id}`);
        setInvoices(invoices.filter(invoice => invoice._id !== id));
        setError(null);
      } catch (err) {
        console.error("Error deleting invoice:", err);
        setError('Failed to delete invoice. Please try again.');
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) return <div className="loading">Loading invoices...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="all-invoices-page">
      <h1>All Invoices</h1>
      
      {invoices.length === 0 ? (
        <p>No invoices found.</p>
      ) : (
        <div className="invoices-container">
          <table className="invoices-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(invoice => (
                <tr key={invoice._id}>
                  <td>{invoice.invoiceNumber}</td>
                  <td>{invoice.customerDetails?.name || 'N/A'}</td>
                  <td>{formatDate(invoice.date)}</td>
                  <td>${invoice.total?.toFixed(2) || '0.00'}</td>
                  <td>
                    <span className={`status-badge status-${invoice.status?.toLowerCase() || 'unpaid'}`}>
                      {invoice.status || 'Unpaid'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button 
                      className="view-btn" 
                      onClick={() => handleViewInvoice(invoice)}
                    >
                      View
                    </button>
                    <button 
                      className="delete-btn" 
                      onClick={() => handleDeleteInvoice(invoice._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invoice Detail Modal */}
      {showModal && selectedInvoice && (
        <div className="modal">
          <div className="modal-content invoice-detail">
            <span className="close" onClick={() => setShowModal(false)}>&times;</span>
            <h2>Invoice #{selectedInvoice.invoiceNumber}</h2>
            
            <div className="invoice-header">
              <div className="invoice-date">
                <strong>Date:</strong> {formatDate(selectedInvoice.date)}
              </div>
              <div className="invoice-status">
                <strong>Status:</strong> 
                <span className={`status-badge status-${selectedInvoice.status?.toLowerCase() || 'unpaid'}`}>
                  {selectedInvoice.status || 'Unpaid'}
                </span>
              </div>
            </div>
            
            <div className="customer-details">
              <h3>Customer Details</h3>
              <p><strong>Name:</strong> {selectedInvoice.customerDetails?.name || 'N/A'}</p>
              <p><strong>Email:</strong> {selectedInvoice.customerDetails?.email || 'N/A'}</p>
              <p><strong>Phone:</strong> {selectedInvoice.customerDetails?.phone || 'N/A'}</p>
              <p><strong>Address:</strong> {selectedInvoice.customerDetails?.address || 'N/A'}</p>
            </div>
            
            <div className="invoice-items">
              <h3>Items</h3>
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items?.map((item, index) => (
                    <tr key={index}>
                      <td>{item.menuItem?.name || 'Unknown Item'}</td>
                      <td>{item.quantity}</td>
                      <td>${item.menuItem?.price?.toFixed(2) || '0.00'}</td>
                      <td>${(item.quantity * (item.menuItem?.price || 0)).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="invoice-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>${selectedInvoice.subtotal?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="summary-row">
                <span>Service Charge (10%):</span>
                <span>${(selectedInvoice.subtotal * 0.1).toFixed(2) || '0.00'}</span>
              </div>
              <div className="summary-row">
                <span>Tax (16%):</span>
                <span>${selectedInvoice.tax?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>${selectedInvoice.total?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
            
            <div className="modal-actions">
              <button onClick={() => window.print()} className="print-btn">Print Invoice</button>
              <button onClick={() => setShowModal(false)} className="close-btn">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllInvoicesPage;
