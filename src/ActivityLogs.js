import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ActivityLogs.css';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    user_id: '',
    action: '',
    start_date: '',
    end_date: ''
  });
  const [users, setUsers] = useState([]);
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
    fetchLogs();
    fetchUsers();
  }, [navigate]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      // Add filters to query params
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });
      
      const url = `${API_BASE_URL}/activity-logs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setLogs(data.data || []);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      setError('Gagal memuat log aktivitas');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers: getHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    fetchLogs();
  };

  const clearFilters = () => {
    setFilters({
      user_id: '',
      action: '',
      start_date: '',
      end_date: ''
    });
    // Fetch logs without filters
    setTimeout(() => {
      fetchLogs();
    }, 100);
  };

  const getActionIcon = (action) => {
    switch (action?.toLowerCase()) {
      case 'create':
      case 'add':
        return '➕';
      case 'update':
      case 'edit':
        return '✏️';
      case 'delete':
      case 'remove':
        return '🗑️';
      case 'login':
        return '🔐';
      case 'logout':
        return '🚪';
      case 'view':
      case 'read':
        return '👁️';
      default:
        return '📝';
    }
  };

  const getActionColor = (action) => {
    switch (action?.toLowerCase()) {
      case 'create':
      case 'add':
        return '#28a745';
      case 'update':
      case 'edit':
        return '#ffc107';
      case 'delete':
      case 'remove':
        return '#dc3545';
      case 'login':
        return '#007bff';
      case 'logout':
        return '#6c757d';
      case 'view':
      case 'read':
        return '#17a2b8';
      default:
        return '#6f42c1';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Tidak diketahui';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id_user === userId);
    return user ? user.username : `User ID: ${userId}`;
  };

  if (loading) {
    return (
      <div className="activity-logs-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Memuat log aktivitas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="activity-logs-container">
      <div className="activity-logs-header">
        <h1>Log Aktivitas Sistem</h1>
        <div className="header-actions">
          <button className="btn-refresh" onClick={fetchLogs}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Filter Section */}
      <div className="filters-section">
        <h3>Filter Log</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Pengguna</label>
            <select
              name="user_id"
              value={filters.user_id}
              onChange={handleFilterChange}
            >
              <option value="">Semua Pengguna</option>
              {users.map(user => (
                <option key={user.id_user} value={user.id_user}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Aksi</label>
            <select
              name="action"
              value={filters.action}
              onChange={handleFilterChange}
            >
              <option value="">Semua Aksi</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="view">View</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Tanggal Mulai</label>
            <input
              type="date"
              name="start_date"
              value={filters.start_date}
              onChange={handleFilterChange}
            />
          </div>
          
          <div className="filter-group">
            <label>Tanggal Akhir</label>
            <input
              type="date"
              name="end_date"
              value={filters.end_date}
              onChange={handleFilterChange}
            />
          </div>
        </div>
        
        <div className="filter-actions">
          <button className="btn-primary" onClick={applyFilters}>
            🔍 Terapkan Filter
          </button>
          <button className="btn-secondary" onClick={clearFilters}>
            🗑️ Hapus Filter
          </button>
        </div>
      </div>

      {/* Logs List */}
      <div className="logs-section">
        <h3>Daftar Aktivitas ({logs.length} log)</h3>
        
        {logs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>Tidak ada log aktivitas</h3>
            <p>Belum ada aktivitas yang tercatat atau sesuai dengan filter yang dipilih</p>
          </div>
        ) : (
          <div className="logs-list">
            {logs.map((log) => (
              <div key={log.id_log} className="log-item">
                <div className="log-icon" style={{ backgroundColor: getActionColor(log.action) }}>
                  {getActionIcon(log.action)}
                </div>
                
                <div className="log-content">
                  <div className="log-header">
                    <div className="log-action">
                      <span className="action-badge" style={{ backgroundColor: getActionColor(log.action) }}>
                        {log.action?.toUpperCase()}
                      </span>
                      <span className="log-table">{log.table_name}</span>
                    </div>
                    <div className="log-time">
                      {formatDate(log.timestamp)}
                    </div>
                  </div>
                  
                  <div className="log-details">
                    <div className="log-user">
                      <span className="user-icon">👤</span>
                      <span>{getUserName(log.user_id)}</span>
                    </div>
                    
                    {log.description && (
                      <div className="log-description">
                        {log.description}
                      </div>
                    )}
                    
                    {log.record_id && (
                      <div className="log-record">
                        <span className="record-label">Record ID:</span>
                        <span className="record-value">{log.record_id}</span>
                      </div>
                    )}
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

export default ActivityLogs;