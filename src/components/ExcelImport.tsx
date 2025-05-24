import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './layout/RegisterForm.css';

interface User {
  _id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  role: 'user' | 'admin';
  createdAt: string;
}

const RegisterForm = () => {
  const [activeTab, setActiveTab] = useState<'register' | 'users'>('register');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: 'user' as 'user' | 'admin'
  });

  const API_BASE = 'http://localhost:4000/api/users';

  // Fetch all users when users tab is active
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
  
      const token = localStorage.getItem('token'); // Adjust this if you're using sessionStorage or a different key
  
      const response = await axios.get(`${API_BASE}/all`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      setUsers(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setMessage({ text: 'Failed to fetch users', type: 'error' });
    } finally {
      setUsersLoading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phoneNumber') {
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (message.text) setMessage({ text: '', type: '' });
  };

  const handleRoleChange = (role: 'user' | 'admin') => {
    setFormData(prev => ({
      ...prev,
      role: role,
      email: role === 'user' ? '' : prev.email,
      phoneNumber: role === 'admin' ? '' : prev.phoneNumber,
      password: role === 'user' ? '' : prev.password
    }));
    setMessage({ text: '', type: '' });
  };

  const validateForm = () => {
    const { name, email, phoneNumber, password, role } = formData;
    
    if (!name.trim()) {
      setMessage({ text: 'Name is required', type: 'error' });
      return false;
    }

    if (role === 'admin') {
      if (!email.trim()) {
        setMessage({ text: 'Email is required for admin', type: 'error' });
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setMessage({ text: 'Invalid email format', type: 'error' });
        return false;
      }
      if (!password || password.length < 6) {
        setMessage({ text: 'Password must be at least 6 characters', type: 'error' });
        return false;
      }
    }

    if (role === 'user') {
      if (!phoneNumber.trim()) {
        setMessage({ text: 'Phone number is required for user', type: 'error' });
        return false;
      }
      if (!/^[0-9]{10}$/.test(phoneNumber)) {
        setMessage({ text: 'Phone number must be 10 digits', type: 'error' });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const submitData: any = {
        name: formData.name.trim(),
        role: formData.role
      };

      if (formData.role === 'admin') {
        submitData.email = formData.email.trim();
        submitData.password = formData.password;
      } else {
        submitData.phoneNumber = formData.phoneNumber.trim();
      }

      const response = await axios.post(`${API_BASE}/register`, submitData);

      if (response.data.success) {
        setMessage({ text: 'Account created successfully!', type: 'success' });
        
        if (response.data.userData?.token || response.data.token) {
          const token = response.data.userData?.token || response.data.token;
          const userData = response.data.userData || response.data.user;
          localStorage.setItem('userToken', token);
          localStorage.setItem('userData', JSON.stringify(userData));
        }

        // Reset form
        setFormData({
          name: '',
          email: '',
          phoneNumber: '',
          password: '',
          role: 'user'
        });

        // If on users tab, refresh the list
        if (activeTab === 'users') {
          fetchUsers();
        }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      setMessage({ text: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
  
    try {
      const token = localStorage.getItem('token'); // or sessionStorage
  
      await axios.delete(`${API_BASE}/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      setMessage({ text: 'User deleted successfully', type: 'success' });
      fetchUsers(); // Refresh the list
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete user';
      setMessage({ text: errorMessage, type: 'error' });
    }
  };
  

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="register-container">
      <div className="register-card">
        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            Register User
          </button>
          <button
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            All Users
          </button>
        </div>

        {/* Register Tab */}
        {activeTab === 'register' && (
          <>
            {/* Header */}
            <div className="register-header">
              <h2>Create New Account</h2>
              <p>Register a new user or admin</p>
            </div>

            {/* Role Selection */}
            <div className="role-selector">
              <button
                type="button"
                className={`role-btn ${formData.role === 'user' ? 'active' : ''}`}
                onClick={() => handleRoleChange('user')}
              >
                User
              </button>
              <button
                type="button"
                className={`role-btn ${formData.role === 'admin' ? 'active admin' : ''}`}
                onClick={() => handleRoleChange('admin')}
              >
                Admin
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="register-form">
              {/* Name */}
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  className="form-input"
                  required
                />
              </div>

              {/* Admin Fields */}
              {formData.role === 'admin' && (
                <>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email address"
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Minimum 6 characters"
                      className="form-input"
                      required
                    />
                  </div>
                </>
              )}

              {/* User Fields */}
              {formData.role === 'user' && (
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Enter 10 digit number"
                    maxLength={10}
                    className="form-input"
                    required
                  />
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className={`submit-btn ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Creating Account...
                  </>
                ) : (
                  `Create ${formData.role === 'admin' ? 'Admin' : 'User'} Account`
                )}
              </button>
            </form>
          </>
        )}

        {/* Users Management Tab */}
        {activeTab === 'users' && (
          <div className="users-management">
            <div className="users-header">
              <h2>All Users ({users.length})</h2>
              <button 
                onClick={fetchUsers} 
                className="refresh-btn"
                disabled={usersLoading}
              >
                {usersLoading ? (
                  <>
                    <span className="spinner small"></span>
                    Loading...
                  </>
                ) : (
                  'Refresh'
                )}
              </button>
            </div>

            {usersLoading ? (
              <div className="loading-state">
                <span className="spinner"></span>
                <p>Loading users...</p>
              </div>
            ) : (
              <div className="users-table-container">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Contact</th>
                      <th>Role</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user._id}>
                        <td>
                          <div className="user-name">{user.name}</div>
                        </td>
                        <td>
                          <div className="contact-info">
                            {user.role === 'admin' ? user.email : user.phoneNumber}
                          </div>
                        </td>
                        <td>
                          <span className={`role-badge ${user.role}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <div className="date-info">
                            {formatDate(user.createdAt)}
                          </div>
                        </td>
                        <td>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="delete-btn"
                            title="Delete user"
                          >
                            <span className="delete-icon">🗑️</span>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {users.length === 0 && (
                  <div className="no-users">
                    <div className="no-users-icon">👥</div>
                    <h3>No users found</h3>
                    <p>Start by creating your first user account</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Message */}
        {message.text && (
          <div className={`message ${message.type}`}>
            <span>{message.text}</span>
            <button 
              className="close-btn"
              onClick={() => setMessage({ text: '', type: '' })}
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterForm;
