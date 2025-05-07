import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import api from '../utils/api';
import './MenuManagementPage.css';

const MenuManagementPage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    stockQuantity: '',
    image: null
  });
  const [editMode, setEditMode] = useState(false);
  const [currentItemId, setCurrentItemId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch menu items on component mount
  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const response = await api.get('/menu-items');
      setMenuItems(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch menu items. ' + (err.response?.data?.error || err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file
      });
      
      // Set preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let itemId;
      
      if (editMode) {
        // Update existing menu item
        const response = await api.put(`/menu-items/${currentItemId}`, formData);
        itemId = response.data._id;
      } else {
        // Create new menu item
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
          const response = await axios.post(`${api.defaults.baseURL}/menu-items`, formDataWithImage, {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          itemId = response.data._id;
        } else {
          // If no image, use regular JSON API
          const response = await api.post('/menu-items', formData);
          itemId = response.data._id;
        }
      }

      // If there's an image to upload and we're updating (not creating new)
      if (editMode && formData.image && formData.image instanceof File) {
        const formDataWithImage = new FormData();
        formDataWithImage.append('image', formData.image);
        
        // Use axios directly to avoid interceptor issues with FormData
        await axios.post(`${api.defaults.baseURL}/menu-items/${itemId}/image`, formDataWithImage, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      }

      resetForm();
      fetchMenuItems();
      setShowForm(false);
      alert(editMode ? 'Menu item updated successfully!' : 'Menu item added successfully!');
    } catch (err) {
      setError('Failed to save menu item. ' + (err.response?.data?.error || err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      category: item.category || '',
      description: item.description || '',
      price: item.price,
      stockQuantity: item.stockQuantity,
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
    window.scrollTo(0, 0);
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;
    
    try {
      await api.delete(`/menu-items/${itemId}`);
      fetchMenuItems();
    } catch (err) {
      setError('Failed to delete menu item. ' + (err.response?.data?.error || err.message));
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      price: '',
      stockQuantity: '',
      image: null
    });
    setPreviewImage(null);
    setEditMode(false);
    setCurrentItemId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleForm = () => {
    if (showForm) {
      resetForm();
    }
    setShowForm(!showForm);
  };

  const categories = [
    'Appetizers',
    'Main Course',
    'Desserts',
    'Beverages',
    'Specials',
    'Breakfast',
    'Lunch',
    'Dinner'
  ];

  return (
    <div className="menu-management-page">
      <h1>{editMode ? 'Edit Menu Item' : 'Menu Management'}</h1>
      
      <button 
        className={`toggle-form-btn ${showForm ? 'active' : ''}`} 
        onClick={toggleForm}
      >
        {showForm ? 'Cancel' : '+ Add New Menu Item'}
      </button>
      
      {error && <div className="error-message">{error}</div>}
      
      {showForm && (
        <form onSubmit={onSubmit} className="menu-form">
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="category">Category:</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Price (Rs):</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="stockQuantity">Stock Quantity:</label>
              <input
                type="number"
                id="stockQuantity"
                name="stockQuantity"
                value={formData.stockQuantity}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="image">Image:</label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleFileChange}
              ref={fileInputRef}
              accept="image/*"
            />
            {previewImage && (
              <div className="preview-image">
                <img src={previewImage} alt="Preview" />
              </div>
            )}
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={resetForm} className="reset-btn">Reset</button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Saving...' : editMode ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      )}
      
      <div className="menu-items-container">
        <h2>Menu Items</h2>
        
        {loading && !showForm ? (
          <div className="loading">Loading menu items...</div>
        ) : menuItems.length === 0 ? (
          <div className="no-items">No menu items found.</div>
        ) : (
          <div className="menu-items-grid">
            {menuItems.map(item => (
              <div key={item._id} className="menu-item-card">
                <div className="menu-item-image">
                  {item.image ? (
                    <img 
                      src={item.image.startsWith('http') ? item.image : `${api.defaults.baseURL.replace('/api', '')}${item.image}`} 
                      alt={item.name} 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100" style="background:%23eee"%3E%3Ctext x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14px" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  ) : (
                    <div className="no-image">No Image</div>
                  )}
                </div>
                <div className="menu-item-details">
                  <h3>{item.name}</h3>
                  <p className="category">{item.category}</p>
                  <p className="description">{item.description}</p>
                  <p className="price">Rs. {parseFloat(item.price).toFixed(2)}</p>
                  <p className="stock">Stock: {item.stockQuantity}</p>
                  <div className="menu-item-actions">
                    <button 
                      className="edit-btn" 
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>
                    <button 
                      className="delete-btn" 
                      onClick={() => handleDelete(item._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuManagementPage;
