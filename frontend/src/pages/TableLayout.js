import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../utils/api';
import './TableLayout.css';

const TableLayout = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentTable, setCurrentTable] = useState(null);
  const [newTableData, setNewTableData] = useState({
    tableNumber: '',
    seats: '',
    location: 'Ground Floor',
    status: 'available'
  });
  const [selectedTable, setSelectedTable] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activeFloor, setActiveFloor] = useState('All Floors');
  const layoutRef = useRef(null);

  // Fetch tables on component mount and set up polling
  useEffect(() => {
    fetchTables();
    const interval = setInterval(fetchTables, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchTables = useCallback(async () => {
    try {
      const res = await api.get('/tables');
      setTables(res.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching tables:", err);
      setError('Failed to fetch tables. Please try again.');
      setTables([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (showAddModal) {
      setNewTableData({ ...newTableData, [name]: value });
    } else if (showEditModal && currentTable) {
      setCurrentTable({ ...currentTable, [name]: value });
    }
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/tables', newTableData);
      setTables([...tables, res.data]);
      setShowAddModal(false);
      setNewTableData({ tableNumber: '', seats: '', location: 'Ground Floor' });
      setError(null);
      alert('Table added successfully!');
    } catch (err) {
      console.error("Error adding table:", err);
      setError(err.response?.data?.msg || 'Failed to add table.');
    }
  };

  const handleEditTable = async (e) => {
    e.preventDefault();
    if (!currentTable) return;
    try {
      const res = await api.put(`/tables/${currentTable._id}`, currentTable);
      setTables(tables.map(t => t._id === currentTable._id ? res.data : t));
      setShowEditModal(false);
      setCurrentTable(null);
      setError(null);
      alert('Table updated successfully!');
    } catch (err) {
      console.error("Error updating table:", err);
      setError(err.response?.data?.msg || 'Failed to update table.');
    }
  };

  const handleDeleteTable = async (id) => {
    if (window.confirm('Are you sure you want to delete this table?')) {
      try {
        await api.delete(`/tables/${id}`);
        setTables(tables.filter(t => t._id !== id));
        setError(null);
        alert('Table deleted successfully!');
      } catch (err) {
        console.error("Error deleting table:", err);
        setError(err.response?.data?.msg || 'Failed to delete table.');
      }
    }
  };

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
    
    setDragStart({
      x: e.clientX - (table.position?.x || 0),
      y: e.clientY - (table.position?.y || 0)
    });
    
    document.body.classList.add('dragging-table');
    
    e.currentTarget.style.zIndex = 1000;
    e.currentTarget.style.opacity = 0.8;
    e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.3)';
  };

  const handleDrag = useCallback((e) => {
    if (!isDragging || !selectedTable) return;

    const container = layoutRef.current;
    const containerRect = container ? container.getBoundingClientRect() : null;

    let newX = e.clientX - dragStart.x;
    let newY = e.clientY - dragStart.y;

    if (containerRect) {
      const tableElement = document.querySelector(`.table-item.selected`);
      const tableRect = tableElement ? tableElement.getBoundingClientRect() : null;
      
      if (tableRect) {
        const tableWidth = tableRect.width;
        const tableHeight = tableRect.height;
        
        const minX = 0;
        const maxX = containerRect.width - tableWidth;
        const minY = 0;
        const maxY = containerRect.height - tableHeight;
        
        newX = Math.max(minX, Math.min(maxX, newX));
        newY = Math.max(minY, Math.min(maxY, newY));
      }
    }

    const newPosition = {
      x: newX,
      y: newY
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

    document.body.classList.remove('dragging-table');

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
        alert('Table position updated successfully!');
      }
    } catch (err) {
      console.error('Error updating table position:', err);
      setError('Failed to update table position.');
    }
  }, [isDragging, selectedTable, tables]);

  const handleMergeTables = async (table1, table2) => {
    try {
      await api.post(
        `/tables/merge`,
        { table1Id: table1._id, table2Id: table2._id }
      );
      fetchTables();
      alert('Tables merged successfully!');
    } catch (err) {
      setError('Failed to merge tables');
    }
  };

  const groupedTables = tables.reduce((acc, table) => {
    const location = table.location || 'Unspecified';
    if (!acc[location]) {
      acc[location] = [];
    }
    acc[location].push(table);
    return acc;
  }, {});
  
  const floorSections = {
    'Ground Floor': groupedTables['Ground Floor'] || [],
    '1st Floor Indoor': groupedTables['1st Floor Indoor'] || [],
    '1st Floor Outdoor': groupedTables['1st Floor Outdoor'] || []
  };

  const displayTables = activeFloor === 'All Floors' 
    ? tables 
    : floorSections[activeFloor] || [];

  return (
    <div 
      className="table-layout-page"
      onMouseMove={handleDrag}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
    >
      <h1>Table Layout & Management</h1>
      
      <div className="table-controls">
        <div className="floor-selector">
          <button 
            className={activeFloor === 'All Floors' ? 'active' : ''} 
            onClick={() => setActiveFloor('All Floors')}
          >
            All Floors
          </button>
          <button 
            className={activeFloor === 'Ground Floor' ? 'active' : ''} 
            onClick={() => setActiveFloor('Ground Floor')}
          >
            Ground Floor
          </button>
          <button 
            className={activeFloor === '1st Floor Indoor' ? 'active' : ''} 
            onClick={() => setActiveFloor('1st Floor Indoor')}
          >
            1st Floor Indoor
          </button>
          <button 
            className={activeFloor === '1st Floor Outdoor' ? 'active' : ''} 
            onClick={() => setActiveFloor('1st Floor Outdoor')}
          >
            1st Floor Outdoor
          </button>
        </div>
        
        <button 
          className="add-table-btn"
          onClick={() => setShowAddModal(true)}
        >
          Add New Table
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading">Loading tables...</div>
      ) : (
        <div className="table-layout" ref={layoutRef}>
          {displayTables.map(table => (
            <div
              key={table._id}
              className={`table-item ${table.status} ${selectedTable?._id === table._id ? 'selected' : ''}`}
              style={{
                left: table.position?.x || 0,
                top: table.position?.y || 0
              }}
              onClick={() => handleTableClick(table)}
              onMouseDown={(e) => handleDragStart(e, table)}
            >
              <div className="table-number">Table {table.tableNumber}</div>
              <div className="table-seats">{table.seats} seats</div>
              <div className="table-actions">
                <button onClick={(e) => {
                  e.stopPropagation();
                  openEditModal(table);
                }}>
                  Edit
                </button>
                <button onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteTable(table._id);
                }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add New Table</h2>
            <form onSubmit={handleAddTable}>
              <div className="form-group">
                <label>Table Number:</label>
                <input
                  type="number"
                  name="tableNumber"
                  value={newTableData.tableNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Number of Seats:</label>
                <input
                  type="number"
                  name="seats"
                  value={newTableData.seats}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Location:</label>
                <select
                  name="location"
                  value={newTableData.location}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Ground Floor">Ground Floor</option>
                  <option value="1st Floor Indoor">1st Floor Indoor</option>
                  <option value="1st Floor Outdoor">1st Floor Outdoor</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="submit">Add Table</button>
                <button type="button" onClick={() => setShowAddModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && currentTable && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit Table</h2>
            <form onSubmit={handleEditTable}>
              <div className="form-group">
                <label>Table Number:</label>
                <input
                  type="number"
                  name="tableNumber"
                  value={currentTable.tableNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Number of Seats:</label>
                <input
                  type="number"
                  name="seats"
                  value={currentTable.seats}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Location:</label>
                <select
                  name="location"
                  value={currentTable.location}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Ground Floor">Ground Floor</option>
                  <option value="1st Floor Indoor">1st Floor Indoor</option>
                  <option value="1st Floor Outdoor">1st Floor Outdoor</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status:</label>
                <select
                  name="status"
                  value={currentTable.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="reserved">Reserved</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="submit">Update Table</button>
                <button type="button" onClick={() => setShowEditModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableLayout;