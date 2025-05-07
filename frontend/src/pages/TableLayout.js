import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../utils/api';
import './TableLayout.css';

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
    location: 'Ground Floor', // Default location
    status: 'available'
  });
  const [selectedTable, setSelectedTable] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activeFloor, setActiveFloor] = useState('All Floors');
  const layoutRef = useRef(null);

  // API URL is now handled by the centralized API utility

  // Fetch tables
  const fetchTables = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/tables');
      setTables(res.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching tables:", err);
      setError('Failed to fetch tables. Please try again.');
      setTables([]); // Clear tables on error
    } finally {
      setLoading(false);
    }
  }, []);

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
      const res = await api.post('/tables', newTableData);
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
      const res = await api.put(`/tables/${currentTable._id}`, currentTable);
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
        await api.delete(`/tables/${id}`);
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

  const handleTableClick = (table) => {
    setSelectedTable(table);
  };

  const handleDragStart = (e, table) => {
    setIsDragging(true);
    setSelectedTable(table);
    
    // Set the drag start position
    setDragStart({
      x: e.clientX - (table.position?.x || 0),
      y: e.clientY - (table.position?.y || 0)
    });
    
    // Add a class to the body to show dragging cursor everywhere
    document.body.classList.add('dragging-table');
    
    // Add visual feedback
    e.currentTarget.style.zIndex = 1000;
    e.currentTarget.style.opacity = 0.8;
    e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.3)';
  };

  const handleDrag = useCallback((e) => {
    if (!isDragging || !selectedTable) return;

    const newPosition = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    };

    setTables(tables.map(table => 
      table._id === selectedTable._id 
        ? { ...table, position: newPosition }
        : table
    ));
  }, [isDragging, selectedTable, dragStart, tables]);

  const handleDragEnd = useCallback(async () => {
    if (!isDragging || !selectedTable) return;
    setIsDragging(false);

    // Remove the dragging class from the body
    document.body.classList.remove('dragging-table');

    // Reset the styles on the dragged element
    const draggedElement = document.querySelector(`.table-item.selected`);
    if (draggedElement) {
      draggedElement.style.zIndex = '';
      draggedElement.style.opacity = '';
      draggedElement.style.boxShadow = '';
    }

    try {
      const tableToUpdate = tables.find(t => t._id === selectedTable._id);
      if (tableToUpdate && tableToUpdate.position) {
        await api.put(`/tables/${tableToUpdate._id}`, { 
          position: tableToUpdate.position 
        });
      }
    } catch (err) {
      console.error('Error updating table position:', err);
    }
  }, [isDragging, selectedTable, tables]);

  const handleMergeTables = async (table1, table2) => {
    try {
      await api.post(
        `/tables/merge`,
        { table1Id: table1._id, table2Id: table2._id }
      );
      fetchTables();
    } catch (err) {
      setError('Failed to merge tables');
    }
  };

  // Floor selection is already defined at the top of the component

  // Group tables by location
  const groupedTables = tables.reduce((acc, table) => {
    const location = table.location || 'Unspecified';
    if (!acc[location]) {
      acc[location] = [];
    }
    acc[location].push(table);
    return acc;
  }, {});
  
  // Ensure we have all floor sections even if empty
  const floorSections = {
    'Ground Floor': groupedTables['Ground Floor'] || [],
    '1st Floor Indoor': groupedTables['1st Floor Indoor'] || [],
    '1st Floor Outdoor': groupedTables['1st Floor Outdoor'] || []
  };

  // Tables to display based on active floor
  const displayTables = activeFloor === 'All Floors' 
    ? tables 
    : floorSections[activeFloor] || [];

  if (loading) return <div className="loading">Loading tables...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div 
      className="table-layout-page"
      onMouseMove={handleDrag}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
    >
      <h1>Table Layout & Management</h1>
      
      <div className="table-controls">
        <button onClick={() => setShowAddModal(true)} className="add-table-btn">
          <span className="btn-icon">+</span> Add New Table
        </button>
        <div className="legend">
          <div className="legend-item">
            <div className="legend-color available"></div>
            <span>Available</span>
          </div>
          <div className="legend-item">
            <div className="legend-color occupied"></div>
            <span>Occupied</span>
          </div>
          <div className="legend-item">
            <div className="legend-color reserved"></div>
            <span>Reserved</span>
          </div>
        </div>
      </div>

      {!loading && !error && tables.length === 0 && (
        <p className="empty-message">No tables found. Add a table to get started.</p>
      )}

      {/* Floor Plan Tabs */}
      <div className="floor-tabs">
        {['All Floors', 'Ground Floor', '1st Floor Indoor', '1st Floor Outdoor'].map(floor => (
          <button 
            key={floor}
            className={`tab-button ${activeFloor === floor ? 'active' : ''}`}
            onClick={() => setActiveFloor(floor)}
          >
            {floor}
          </button>
        ))}
      </div>

      {/* Table Display Area */}
      <div className="table-layout-container">
        {activeFloor !== 'All Floors' && (!displayTables || displayTables.length === 0) && (
          <p className="floor-empty-message">No tables on {activeFloor}. Add a table or select another floor.</p>
        )}

        <div className="layout-section">
          {displayTables.map(table => {
            const status = table.status?.toLowerCase() || 'available';
            return (
              <div
                key={table._id}
                className={`table-item ${status} ${selectedTable && selectedTable._id === table._id ? 'selected' : ''}`}
                style={{
                  width: `${Math.max(table.seats * 15, 60)}px`,
                  height: `${Math.max(table.seats * 15, 60)}px`,
                  position: 'absolute',
                  left: table.position?.x || '10px',
                  top: table.position?.y || '10px',
                  cursor: isDragging && selectedTable && selectedTable._id === table._id ? 'grabbing' : 'grab'
                }}
                onMouseDown={(e) => handleDragStart(e, table)}
                onClick={() => handleTableClick(table)}
              >
                <div className="table-content">
                  <h3>Table {table.tableNumber}</h3>
                  <p>Seats: {table.seats}</p>
                  <p>Floor: {table.location}</p>
                  <div className={`status-indicator ${status}`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </div>
                </div>
                <div className="table-actions">
                  <button onClick={(e) => { e.stopPropagation(); openEditModal(table); }} className="edit-btn" title="Edit Table">✏️</button>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteTable(table._id); }} className="delete-btn" title="Delete Table">🗑️</button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="floor-layout first-floor-indoor">
          {floorSections['1st Floor Indoor'].map(table => (
            <div
              key={table._id}
              className={`table-item status-${table.status?.toLowerCase() || 'available'} ${selectedTable?._id === table._id ? 'selected' : ''}`}
              style={{
                left: `${table.position?.x || Math.random() * 500}px`,
                top: `${table.position?.y || Math.random() * 300}px`,
                width: `${50 + (table.seats * 5)}px`,
                height: `${50 + (table.seats * 5)}px`
              }}
              onClick={() => handleTableClick(table)}
              onMouseDown={(e) => handleDragStart(e, table)}
            >
              <div className="table-number">{table.tableNumber}</div>
              <div className="table-info">
                <p>Seats: {table.seats}</p>
                <p>Status: {table.status || 'Available'}</p>
              </div>
              <div className="table-actions">
                <button onClick={(e) => { e.stopPropagation(); openEditModal(table); }} className="edit-btn">✏️</button>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteTable(table._id); }} className="delete-btn">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 1st Floor Outdoor */}
      <div className="floor-section">
        <h2>1st Floor Outdoor</h2>
        <div className="floor-layout first-floor-outdoor">
          {floorSections['1st Floor Outdoor'].map(table => (
            <div
              key={table._id}
              className={`table-item status-${table.status?.toLowerCase() || 'available'} ${selectedTable?._id === table._id ? 'selected' : ''}`}
              style={{
                left: `${table.position?.x || Math.random() * 500}px`,
                top: `${table.position?.y || Math.random() * 300}px`,
                width: `${50 + (table.seats * 5)}px`,
                height: `${50 + (table.seats * 5)}px`
              }}
              onClick={() => handleTableClick(table)}
              onMouseDown={(e) => handleDragStart(e, table)}
            >
              <div className="table-number">{table.tableNumber}</div>
              <div className="table-info">
                <p>Seats: {table.seats}</p>
                <p>Status: {table.status || 'Available'}</p>
              </div>
              <div className="table-actions">
                <button onClick={(e) => { e.stopPropagation(); openEditModal(table); }} className="edit-btn">✏️</button>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteTable(table._id); }} className="delete-btn">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </div>

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
                <input type="text" name="tableNumber" value={currentTable.tableNumber} onChange={handleInputChange} required disabled />
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
              {error && <p className="error-message">{error}</p>}
              <div className="modal-actions">
                <button type="submit">Save Changes</button>
                <button type="button" onClick={() => { setShowEditModal(false); setCurrentTable(null); setError(null); }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedTable && (
        <div className="table-actions">
          <button onClick={(e) => { e.stopPropagation(); handleMergeTables(selectedTable, tables.find(t => t._id !== selectedTable._id)); }}>
            Merge with Another Table
          </button>
        </div>
      )}
    </div>
  );
};

export default TableLayout;