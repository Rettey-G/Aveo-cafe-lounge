import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    phone: '',
    role: 'user'
  });
  const [editMode, setEditMode] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Ensure API_URL includes /api
  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/users');
      setUsers(data.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch users. ' + (err.response?.data?.error || err.message));
      console.error(err);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password; // Don't send empty password
        await api.put(`/users/${currentUserId}`, updateData);
      } else {
        await api.post(`/users`, formData);
      }

      // Reset form and fetch updated users
      resetForm();
      fetchUsers();
    } catch (err) {
      setError('Failed to save user. ' + (err.response?.data?.error || err.message));
      console.error(err);
    }
  };

  const handleEdit = (user) => {
    setFormData({
      username: user.username,
      password: '', // Don't set password for edit
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role
    });
    setEditMode(true);
    setCurrentUserId(user._id);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${userId}`);
        fetchUsers();
      } catch (err) {
        setError('Failed to delete user. ' + (err.response?.data?.error || err.message));
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      fullName: '',
      email: '',
      phone: '',
      role: 'user'
    });
    setEditMode(false);
    setCurrentUserId(null);
    setError('');
  };

  if (loading && users.length === 0) return <div className="loading">Loading users...</div>;

  return (
    <div className="user-management-container">
      <h2>{editMode ? 'Edit User' : 'Add New User'}</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="user-form">
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            disabled={editMode} // Username cannot be changed in edit mode
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password {editMode && '(Leave blank to keep current)'}</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required={!editMode} // Password is required only for new users
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="fullName">Full Name</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="role">Role</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="waiter">Waiter</option>
            <option value="cashier">Cashier</option>
            <option value="manager">Manager</option>
          </select>
        </div>
        
        <div className="form-buttons">
          <button type="submit" className="btn-save">
            {editMode ? 'Update User' : 'Add User'}
          </button>
          {editMode && (
            <button type="button" className="btn-cancel" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>
      
      <h2>User List</h2>
      
      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>{user.username}</td>
                <td>{user.fullName || '-'}</td>
                <td>{user.email || '-'}</td>
                <td>{user.phone || '-'}</td>
                <td>{user.role}</td>
                <td className="actions">
                  <button 
                    className="btn-edit" 
                    onClick={() => handleEdit(user)}
                  >
                    Edit
                  </button>
                  <button className="delete-btn" onClick={() => handleDeleteUser(user._id)}>Delete</button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="6" className="no-data">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
