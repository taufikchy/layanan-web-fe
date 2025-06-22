import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Suppliers.css';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [currentSupplier, setCurrentSupplier] = useState({
    nama_supplier: '',
    kontak: '',
    alamat: '',
    email: ''
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
    fetchSuppliers();
  }, [navigate]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/supplier`, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setSuppliers(data.data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      setError('Gagal memuat data supplier');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentSupplier(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingSupplier 
        ? `${API_BASE_URL}/supplier/${editingSupplier.id_supplier}`
        : `${API_BASE_URL}/supplier`;
      
      const method = editingSupplier ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: getHeaders(),
        body: JSON.stringify(currentSupplier)
      });

      if (response.ok) {
        setShowModal(false);
        resetForm();
        fetchSuppliers();
        alert(editingSupplier ? 'Supplier berhasil diperbarui!' : 'Supplier berhasil ditambahkan!');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Terjadi kesalahan');
      }
    } catch (error) {
      console.error('Error saving supplier:', error);
      alert('Terjadi kesalahan saat menyimpan data');
    }
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setCurrentSupplier({
      nama_supplier: supplier.nama_supplier,
      kontak: supplier.kontak || '',
      alamat: supplier.alamat || '',
      email: supplier.email || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (supplier) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus supplier "${supplier.nama_supplier}"?`)) {
      try {
        const response = await fetch(`${API_BASE_URL}/supplier/${supplier.id_supplier}`, {
          method: 'DELETE',
          headers: getHeaders()
        });

        if (response.ok) {
          fetchSuppliers();
          alert('Supplier berhasil dihapus!');
        } else {
          const errorData = await response.json();
          alert(errorData.message || 'Terjadi kesalahan saat menghapus supplier');
        }
      } catch (error) {
        console.error('Error deleting supplier:', error);
        alert('Terjadi kesalahan saat menghapus supplier');
      }
    }
  };

  const resetForm = () => {
    setCurrentSupplier({
      nama_supplier: '',
      kontak: '',
      alamat: '',
      email: ''
    });
    setEditingSupplier(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  if (loading) {
    return (
      <div className="suppliers-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Memuat data supplier...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="suppliers-container">
      <div className="suppliers-header">
        <h1>Data Supplier</h1>
        <button className="btn-primary" onClick={openAddModal}>
          + Tambah Supplier
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="suppliers-grid">
        {suppliers.map((supplier) => (
          <div key={supplier.id_supplier} className="supplier-card">
            <div className="supplier-header">
              <h3>{supplier.nama_supplier}</h3>
              <div className="supplier-actions">
                <button 
                  className="btn-edit" 
                  onClick={() => handleEdit(supplier)}
                  title="Edit Supplier"
                >
                  ✏️
                </button>
                <button 
                  className="btn-delete" 
                  onClick={() => handleDelete(supplier)}
                  title="Hapus Supplier"
                >
                  🗑️
                </button>
              </div>
            </div>
            <div className="supplier-content">
              <div className="supplier-info">
                <div className="info-item">
                  <span className="info-label">📞 Kontak:</span>
                  <span className="info-value">{supplier.kontak || 'Tidak ada kontak'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">📧 Email:</span>
                  <span className="info-value">{supplier.email || 'Tidak ada email'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">📍 Alamat:</span>
                  <span className="info-value">{supplier.alamat || 'Tidak ada alamat'}</span>
                </div>
              </div>
              <div className="supplier-stats">
                <span className="stat-item">
                  <strong>Total Transaksi:</strong> {supplier.total_transaksi || 0}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {suppliers.length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-icon">🏪</div>
          <h3>Belum ada supplier</h3>
          <p>Mulai dengan menambahkan supplier pertama Anda</p>
          <button className="btn-primary" onClick={openAddModal}>
            + Tambah Supplier
          </button>
        </div>
      )}

      {/* Modal Tambah/Edit Supplier */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingSupplier ? 'Edit Supplier' : 'Tambah Supplier'}</h2>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="supplier-form">
              <div className="form-group">
                <label>Nama Supplier</label>
                <input
                  type="text"
                  name="nama_supplier"
                  value={currentSupplier.nama_supplier}
                  onChange={handleInputChange}
                  required
                  placeholder="Masukkan nama supplier"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Kontak</label>
                  <input
                    type="text"
                    name="kontak"
                    value={currentSupplier.kontak}
                    onChange={handleInputChange}
                    placeholder="Nomor telepon/HP"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={currentSupplier.email}
                    onChange={handleInputChange}
                    placeholder="alamat@email.com"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Alamat</label>
                <textarea
                  name="alamat"
                  value={currentSupplier.alamat}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Masukkan alamat lengkap supplier"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  {editingSupplier ? 'Perbarui' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;