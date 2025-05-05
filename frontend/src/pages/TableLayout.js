import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios'; // Assuming axios is used for API calls
import './TableLayout.css'; // We'll create this CSS file next

const TableLayout = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentTable, setCurrentTable] = useState(null); // For editing
  const [newTableData, setNewTableData] = useState({
    tableNumber: '',
    seats: '',
    location: 'Ground Floor' // Default location
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Fetch tables
  const fetchTables = useCallback(async () => {
    setLoading(true);
    try {
      // Replace with your actual API endpoint and auth mechanism
      const res = await axios.get(`${API_URL}/tables`, {
        // headers: { Authorization: `Bearer ${token}` } // Add auth if needed
      });
      setTables(res.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching tables:", err);
      setError('Failed to fetch tables. Please try again.');
      setTables([]); // Clear tables on error
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  // Handle Input Change for Add/Edit Modals
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (showAddModal) {
      setNewTableData({ ...newTableData, [name]: value });
    } else if (showEditModal && currentTable) {
      setCurrentTable({ ...currentTable, [name]: value });
    }
  };

  // Handle Add Table
  const handleAddTable = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/tables`, newTableData, {
        // headers: { Authorization: `Bearer ${token}` }
      });
      setTables([...tables, res.data]);
      setShowAddModal(false);
      setNewTableData({ tableNumber: '', seats: '', location: 'Ground Floor' }); // Reset form
      setError(null);
    } catch (err) {
      console.error("Error adding table:", err);
      setError(err.response?.data?.msg || 'Failed to add table.');
    }
  };

  // Handle Edit Table
  const handleEditTable = async (e) => {
    e.preventDefault();
    if (!currentTable) return;
    try {
      const res = await axios.put(`${API_URL}/tables/${currentTable._id}`, currentTable, {
        // headers: { Authorization: `Bearer ${token}` }
      });
      setTables(tables.map(t => t._id === currentTable._id ? res.data : t));
      setShowEditModal(false);
      setCurrentTable(null);
      setError(null);
    } catch (err) {
      console.error("Error updating table:", err);
      setError(err.response?.data?.msg || 'Failed to update table.');
    }
  };

  // Handle Delete Table
  const handleDeleteTable = async (id) => {
    if (window.confirm('Are you sure you want to delete this table?')) {
      try {
        await axios.delete(`${API_URL}/tables/${id}`, {
          // headers: { Authorization: `Bearer ${token}` }
        });
        setTables(tables.filter(t => t._id !== id));
        setError(null);
      } catch (err) {
        console.error("Error deleting table:", err);
        setError(err.response?.data?.msg || 'Failed to delete table.');
      }
    }
  };

  // Open Edit Modal
  const openEditModal = (table) => {
    setCurrentTable(table);
    setShowEditModal(true);
  };

  // Group tables by location
  const groupedTables = tables.reduce((acc, table) => {
    const location = table.location || 'Unspecified';
    if (!acc[location]) {
      acc[location] = [];
    }
    acc[location].push(table);
    return acc;
  }, {});

  return (
    <div className="table-layout-page">
      <h1>Table Layout & Management</h1>
      <button onClick={() => setShowAddModal(true)} className="add-table-btn">Add New Table</button>

      {loading && <p>Loading tables...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && Object.keys(groupedTables).length === 0 && (
        <p>No tables found. Add a table to get started.</p>
      )}

      {!loading && !error && Object.entries(groupedTables).map(([location, tablesInLocation]) => (
        <div key={location} className="location-section">
          <h2>{location}</h2>
          <div className="table-grid">
            {tablesInLocation.map(table => (
              <div key={table._id} className={`table-card status-${table.status?.toLowerCase() || 'unknown'}`}>
                <h3>Table {table.tableNumber}</h3>
                <p>Seats: {table.seats}</p>
                <p>Status: {table.status || 'N/A'}</p>
                {/* Add assigned waiter info if available */}
                {/* {table.assignedWaiter && <p>Waiter: {table.assignedWaiter.name}</p>} */}
                <div className="table-actions">
                  <button onClick={() => openEditModal(table)} className="edit-btn">Edit</button>
                  <button onClick={() => handleDeleteTable(table._id)} className="delete-btn">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Add Table Modal */}
      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add New Table</h2>
            <form onSubmit={handleAddTable}>
              <label>
                Table Number:
                <input type="text" name="tableNumber" value={newTableData.tableNumber} onChange={handleInputChange} required />
              </label>
              <label>
                Seats:
                <input type="number" name="seats" value={newTableData.seats} onChange={handleInputChange} required min="1" />
              </label>
              <label>
                Location:
                <select name="location" value={newTableData.location} onChange={handleInputChange} required>
                  <option value="Ground Floor">Ground Floor</option>
                  <option value="1st Floor Indoor">1st Floor Indoor</option>
                  <option value="1st Floor Outdoor">1st Floor Outdoor</option>
                </select>
              </label>
              {error && <p className="error-message">{error}</p>}
              <div className="modal-actions">
                <button type="submit">Add Table</button>
                <button type="button" onClick={() => { setShowAddModal(false); setError(null); }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Table Modal */}
      {showEditModal && currentTable && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit Table {currentTable.tableNumber}</h2>
            <form onSubmit={handleEditTable}>
              <label>
                Table Number:
                <input type="text" name="tableNumber" value={currentTable.tableNumber} onChange={handleInputChange} required disabled /* Usually table number is not editable */ />
              </label>
              <label>
                Seats:
                <input type="number" name="seats" value={currentTable.seats} onChange={handleInputChange} required min="1" />
              </label>
              <label>
                Location:
                <select name="location" value={currentTable.location} onChange={handleInputChange} required>
                  <option value="Ground Floor">Ground Floor</option>
                  <option value="1st Floor Indoor">1st Floor Indoor</option>
                  <option value="1st Floor Outdoor">1st Floor Outdoor</option>
                </select>
              </label>
              <label>
                Status:
                <select name="status" value={currentTable.status} onChange={handleInputChange}>
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="reserved">Reserved</option>
                </select>
              </label>
              {/* Add field for assignedWaiter if needed */}
              {error && <p className="error-message">{error}</p>}
              <div className="modal-actions">
                <button type="submit">Save Changes</button>
                <button type="button" onClick={() => { setShowEditModal(false); setCurrentTable(null); setError(null); }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableLayout;