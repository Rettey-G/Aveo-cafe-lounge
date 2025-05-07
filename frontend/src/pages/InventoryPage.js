import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import api from '../utils/api';
import './InventoryPage.css';

const InventoryPage = () => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    specification: '',
    expiryDate: '',
    costPrice: '',
    quantity: '',
    image: null
  });
  const [editMode, setEditMode] = useState(false);
  const [currentItemId, setCurrentItemId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch inventory items on component mount
  useEffect(() => {
    fetchInventoryItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchInventoryItems = async () => {
    try {
      setLoading(true);
      const response = await api.get('/inventory');
      setInventoryItems(response.data.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch inventory items. ' + (err.response?.data?.error || err.message));
      console.error(err);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    if (type === 'file') {
      const file = e.target.files[0];
      if (file) {
        setFormData(prev => ({ ...prev, image: file }));
        
        // Create a preview URL for the image
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let itemId;
      
      if (editMode) {
        // Update existing inventory item
        const response = await api.put(`/inventory/${currentItemId}`, formData);
        itemId = response.data.data._id;
      } else {
        // Create new inventory item
        // If there's an image, use FormData for multipart upload
        if (formData.image && formData.image instanceof File) {
          const formDataWithImage = new FormData();
          // Add all form fields to FormData
          Object.keys(formData).forEach(key => {
            if (key === 'image') {
              formDataWithImage.append('image', formData[key]);
            } else {
              formDataWithImage.append(key, formData[key]);
            }
          });
          
          // Use axios directly to avoid interceptor issues with FormData
          const response = await axios.post(`${api.defaults.baseURL}/inventory`, formDataWithImage, {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          itemId = response.data.data._id;
        } else {
          // If no image, use regular JSON API
          const response = await api.post('/inventory', formData);
          itemId = response.data.data._id;
        }
      }

      // If there's an image to upload and we're updating (not creating new)
      if (editMode && formData.image && formData.image instanceof File) {
        const formDataWithImage = new FormData();
        formDataWithImage.append('image', formData.image);
        
        // Use axios directly to avoid interceptor issues with FormData
        await axios.post(`${api.defaults.baseURL}/inventory/${itemId}/image`, formDataWithImage, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      }

      // Reset form and fetch updated inventory
      resetForm();
      fetchInventoryItems();
      setShowForm(false);
    } catch (err) {
      setError('Failed to save inventory item. ' + (err.response?.data?.error || err.message));
      console.error(err);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      brand: item.brand,
      specification: item.specification || '',
      expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : '',
      costPrice: item.costPrice,
      quantity: item.quantity,
      image: null // Don't set image for edit
    });
    
    // Set preview image if available
    if (item.image) {
      // Handle both absolute URLs and relative paths
      if (item.image.startsWith('http')) {
        setPreviewImage(item.image);
      } else {
        const baseUrl = api.defaults.baseURL.replace('/api', '');
        setPreviewImage(`${baseUrl}${item.image}`);
      }
    } else {
      setPreviewImage(null);
    }
    
    setEditMode(true);
    setCurrentItemId(item._id);
    setShowForm(true);
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this inventory item?')) return;
    
    try {
      await api.delete(`/inventory/${itemId}`);
      fetchInventoryItems();
    } catch (err) {
      setError('Failed to delete inventory item. ' + (err.response?.data?.error || err.message));
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      specification: '',
      expiryDate: '',
      costPrice: '',
      quantity: '',
      image: null
    });
    setPreviewImage(null);
    setEditMode(false);
    setCurrentItemId(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addSampleItems = async () => {
    if (!window.confirm('This will add 20 sample inventory items. Continue?')) return;
    
    try {
      setLoading(true);
      await api.post('/inventory/sample/add', {});
      fetchInventoryItems();
    } catch (err) {
      setError('Failed to add sample inventory items. ' + (err.response?.data?.error || err.message));
      console.error(err);
      setLoading(false);
    }
  };

  const toggleForm = () => {
    if (showForm) {
      resetForm();
    }
    setShowForm(!showForm);
  };

  if (loading && inventoryItems.length === 0) return <div className="loading">Loading inventory...</div>;

  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <h2>Inventory Management</h2>
        <div className="action-buttons">
          <button 
            className="btn-toggle-form" 
            onClick={toggleForm}
          >
            {showForm ? 'Hide Form' : 'Add New Item'}
          </button>
          <button 
            className="btn-sample" 
            onClick={addSampleItems}
          >
            Add Sample Items
          </button>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {showForm && (
        <form onSubmit={handleSubmit} className="inventory-form">
          <h3>{editMode ? 'Edit Inventory Item' : 'Add New Inventory Item'}</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Product Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="brand">Brand</label>
              <input
                type="text"
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="specification">Specification</label>
            <textarea
              id="specification"
              name="specification"
              value={formData.specification}
              onChange={handleChange}
              rows="3"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="expiryDate">Expiry Date</label>
              <input
                type="date"
                id="expiryDate"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="costPrice">Cost Price</label>
              <input
                type="number"
                id="costPrice"
                name="costPrice"
                value={formData.costPrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="quantity">Quantity</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="image">Product Image</label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleChange}
              ref={fileInputRef}
              accept="image/*"
            />
            {previewImage && (
              <div className="image-preview">
                <img src={previewImage} alt="Preview" />
              </div>
            )}
          </div>
          
          <div className="form-buttons">
            <button type="submit" className="btn-save">
              {editMode ? 'Update Item' : 'Add Item'}
            </button>
            <button type="button" className="btn-cancel" onClick={() => {
              resetForm();
              setShowForm(false);
            }}>
              Cancel
            </button>
          </div>
        </form>
      )}
      
      <div className="table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Brand</th>
              <th>Specification</th>
              <th>Expiry Date</th>
              <th>Cost Price</th>
              <th>Quantity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventoryItems.map(item => (
              <tr key={item._id}>
                <td className="item-image">
                  {item.image ? (
                    <img 
                      src={item.image.startsWith('http') ? item.image : `${api.defaults.baseURL.replace('/api', '')}${item.image}`} 
                      alt={item.name} 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
                      }}
                    />
                  ) : (
                    <div className="no-image">No Image</div>
                  )}
                </td>
                <td>{item.name}</td>
                <td>{item.brand}</td>
                <td>{item.specification || '-'}</td>
                <td>
                  {item.expiryDate 
                    ? new Date(item.expiryDate).toLocaleDateString() 
                    : '-'}
                </td>
                <td>${parseFloat(item.costPrice).toFixed(2)}</td>
                <td>{item.quantity}</td>
                <td className="actions">
                  <button 
                    className="btn-edit" 
                    onClick={() => handleEdit(item)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn-delete" 
                    onClick={() => handleDelete(item._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {inventoryItems.length === 0 && (
              <tr>
                <td colSpan="8" className="no-data">No inventory items found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryPage;