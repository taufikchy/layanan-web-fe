import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    {
      path: '/dashboard',
      name: 'Dashboard',
      icon: '📊'
    },
    {
      path: '/barang',
      name: 'Data Barang',
      icon: '📦'
    },
    {
      path: '/categories',
      name: 'Kategori',
      icon: '🏷️'
    },
    {
      path: '/locations',
      name: 'Lokasi',
      icon: '📍'
    },
    {
      path: '/suppliers',
      name: 'Supplier',
      icon: '🏪'
    },
    {
      path: '/transaksi-masuk',
      name: 'Transaksi Masuk',
      icon: '📥'
    },
    {
      path: '/transaksi-keluar',
      name: 'Transaksi Keluar',
      icon: '📤'
    },
    {
      path: '/stok-opname',
      name: 'Stok Opname',
      icon: '📋'
    },
    {
      path: '/users',
      name: 'Pengguna',
      icon: '👥'
    },
    {
      path: '/activity-logs',
      name: 'Log Aktivitas',
      icon: '📝'
    }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        className={`mobile-menu-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Navigation Sidebar */}
      <nav className={`navigation ${isOpen ? 'open' : ''}`}>
        <div className="nav-header">
          <h2>Inventory System</h2>
          <button 
            className="nav-close"
            onClick={() => setIsOpen(false)}
          >
            ×
          </button>
        </div>

        <div className="nav-menu">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.name}</span>
            </Link>
          ))}
        </div>

        <div className="nav-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </nav>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="nav-overlay"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Navigation;