import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [currentUser, setCurrentUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user'
  });
  const navigate = useNavigate();

  const API_BASE_URL = 'http://localhost:3001/api';

  const getToken = () => {
    return localStorage.getItem('token');
  };

  const getHeaders = () => {
    const token = getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setUsers(data.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Gagal memuat data pengguna');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingUser 
        ? `${API_BASE_URL}/users/${editingUser.id_user}`
        : `${API_BASE_URL}/users`;
      
      const method = editingUser ? 'PUT' : 'POST';
      
      // Don't send password if editing and password is empty
      const userData = { ...currentUser };
      if (editingUser && !userData.password) {
        delete userData.password;
      }
      
      const response = await fetch(url, {
        method: method,
        headers: getHeaders(),
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        setShowModal(false);
        resetForm();
        fetchUsers();
        alert(editingUser ? 'Pengguna berhasil diperbarui!' : 'Pengguna berhasil ditambahkan!');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Terjadi kesalahan');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Terjadi kesalahan saat menyimpan data');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setCurrentUser({
      username: user.username,
      email: user.email,
      password: '', // Don't populate password for security
      role: user.role
    });
    setShowModal(true);
  };

  const handleDelete = async (user) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus pengguna "${user.username}"?`)) {
      try {
        const response = await fetch(`${API_BASE_URL}/users/${user.id_user}`, {
          method: 'DELETE',
          headers: getHeaders()
        });

        if (response.ok) {
          fetchUsers();
          alert('Pengguna berhasil dihapus!');
        } else {
          const errorData = await response.json();
          alert(errorData.message || 'Terjadi kesalahan saat menghapus pengguna');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Terjadi kesalahan saat menghapus pengguna');
      }
    }
  };

  const resetForm = () => {
    setCurrentUser({
      username: '',
      email: '',
      password: '',
      role: 'user'
    });
    setEditingUser(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return '#dc3545';
      case 'manager':
        return '#fd7e14';
      case 'user':
      default:
        return '#28a745';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return '👑';
      case 'manager':
        return '👨‍💼';
      case 'user':
      default:
        return '👤';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Tidak diketahui';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="users-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Memuat data pengguna...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="users-container">
      <div className="users-header">
        <h1>Manajemen Pengguna</h1>
        <button className="btn-primary" onClick={openAddModal}>
          + Tambah Pengguna
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="users-grid">
        {users.map((user) => (
          <div key={user.id_user} className="user-card">
            <div className="user-header">
              <div className="user-avatar">
                {getRoleIcon(user.role)}
              </div>
              <div className="user-info">
                <h3>{user.username}</h3>
                <span 
                  className="user-role" 
                  style={{ backgroundColor: getRoleColor(user.role) }}
                >
                  {user.role.toUpperCase()}
                </span>
              </div>
              <div className="user-actions">
                <button 
                  className="btn-edit" 
                  onClick={() => handleEdit(user)}
                  title="Edit Pengguna"
                >
                  ✏️
                </button>
                <button 
                  className="btn-delete" 
                  onClick={() => handleDelete(user)}
                  title="Hapus Pengguna"
                >
                  🗑️
                </button>
              </div>
            </div>
            <div className="user-content">
              <div className="user-details">
                <div className="detail-item">
                  <span className="detail-label">📧 Email:</span>
                  <span className="detail-value">{user.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">📅 Dibuat:</span>
                  <span className="detail-value">{formatDate(user.created_at)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">🔄 Diperbarui:</span>
                  <span className="detail-value">{formatDate(user.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>Belum ada pengguna</h3>
          <p>Mulai dengan menambahkan pengguna pertama</p>
          <button className="btn-primary" onClick={openAddModal}>
            + Tambah Pengguna
          </button>
        </div>
      )}

      {/* Modal Tambah/Edit Pengguna */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingUser ? 'Edit Pengguna' : 'Tambah Pengguna'}</h2>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="user-form">
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={currentUser.username}
                  onChange={handleInputChange}
                  required
                  placeholder="Masukkan username"
                />
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={currentUser.email}
                  onChange={handleInputChange}
                  required
                  placeholder="alamat@email.com"
                />
              </div>
              
              <div className="form-group">
                <label>Password {editingUser && '(Kosongkan jika tidak ingin mengubah)'}</label>
                <input
                  type="password"
                  name="password"
                  value={currentUser.password}
                  onChange={handleInputChange}
                  required={!editingUser}
                  placeholder={editingUser ? "Kosongkan jika tidak ingin mengubah" : "Masukkan password"}
                />
              </div>
              
              <div className="form-group">
                <label>Role</label>
                <select
                  name="role"
                  value={currentUser.role}
                  onChange={handleInputChange}
                  required
                >
                  <option value="user">User</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  {editingUser ? 'Perbarui' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;