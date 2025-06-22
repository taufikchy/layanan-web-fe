import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Categories.css';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [currentCategory, setCurrentCategory] = useState({
    nama_kategori: '',
    deskripsi: ''
  });
  const [showBarangModal, setShowBarangModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [barangList, setBarangList] = useState([]);
  const [loadingBarang, setLoadingBarang] = useState(false);
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
    fetchCategories();
  }, [navigate]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/kategori`, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setCategories(data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Gagal memuat data kategori');
    } finally {
      setLoading(false);
    }
  };

  const fetchBarangByCategory = async (categoryName) => {
    try {
      setLoadingBarang(true);
      const response = await fetch(`${API_BASE_URL}/barang`, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      const filteredBarang = (data.data || []).filter(barang => 
        barang.nama_kategori === categoryName || barang.kategori === categoryName
      );
      setBarangList(filteredBarang);
    } catch (error) {
      console.error('Error fetching barang:', error);
      alert('Gagal memuat data barang');
    } finally {
      setLoadingBarang(false);
    }
  };

  const handleCategoryClick = async (category) => {
    setSelectedCategory(category);
    setShowBarangModal(true);
    await fetchBarangByCategory(category.nama_kategori);
  };

  const closeBarangModal = () => {
    setShowBarangModal(false);
    setSelectedCategory(null);
    setBarangList([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentCategory(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingCategory 
        ? `${API_BASE_URL}/kategori/${editingCategory.id_kategori}`
        : `${API_BASE_URL}/kategori`;
      
      const method = editingCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: getHeaders(),
        body: JSON.stringify(currentCategory)
      });

      if (response.ok) {
        setShowModal(false);
        resetForm();
        fetchCategories();
        alert(editingCategory ? 'Kategori berhasil diperbarui!' : 'Kategori berhasil ditambahkan!');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Terjadi kesalahan');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Terjadi kesalahan saat menyimpan data');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setCurrentCategory({
      nama_kategori: category.nama_kategori,
      deskripsi: category.deskripsi || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (category) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus kategori "${category.nama_kategori}"?`)) {
      try {
        const response = await fetch(`${API_BASE_URL}/kategori/${category.id_kategori}`, {
          method: 'DELETE',
          headers: getHeaders()
        });

        if (response.ok) {
          fetchCategories();
          alert('Kategori berhasil dihapus!');
        } else {
          const errorData = await response.json();
          alert(errorData.message || 'Terjadi kesalahan saat menghapus kategori');
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Terjadi kesalahan saat menghapus kategori');
      }
    }
  };

  const resetForm = () => {
    setCurrentCategory({
      nama_kategori: '',
      deskripsi: ''
    });
    setEditingCategory(null);
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
      <div className="categories-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Memuat data kategori...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="categories-container">
      <div className="categories-header">
        <h1>Kategori Barang</h1>
        <button className="btn-primary" onClick={openAddModal}>
          + Tambah Kategori
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="categories-grid">
        {categories.map((category) => (
          <div key={category.id_kategori} className="category-card">
            <div className="category-header">
              <h3>{category.nama_kategori}</h3>
              <div className="category-actions">
                <button 
                  className="btn-edit" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(category);
                  }}
                  title="Edit Kategori"
                >
                  ✏️
                </button>
                <button 
                  className="btn-delete" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(category);
                  }}
                  title="Hapus Kategori"
                >
                  🗑️
                </button>
              </div>
            </div>
            <div 
              className="category-content" 
              onClick={() => handleCategoryClick(category)}
              style={{ cursor: 'pointer' }}
              title="Klik untuk melihat barang dalam kategori ini"
            >
              <p className="category-description">
                {category.deskripsi || 'Tidak ada deskripsi'}
              </p>
              <div className="category-stats">
                <span className="stat-item">
                  <strong>Total Barang:</strong> {category.total_barang || 0}
                </span>
                <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                  👆 Klik untuk melihat daftar barang
                </small>
              </div>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>Belum ada kategori</h3>
          <p>Mulai dengan menambahkan kategori pertama Anda</p>
          <button className="btn-primary" onClick={openAddModal}>
            + Tambah Kategori
          </button>
        </div>
      )}

      {/* Modal Tambah/Edit Kategori */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}</h2>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="category-form">
              <div className="form-group">
                <label>Nama Kategori</label>
                <input
                  type="text"
                  name="nama_kategori"
                  value={currentCategory.nama_kategori}
                  onChange={handleInputChange}
                  required
                  placeholder="Masukkan nama kategori"
                />
              </div>
              
              <div className="form-group">
                <label>Deskripsi</label>
                <textarea
                  name="deskripsi"
                  value={currentCategory.deskripsi}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Masukkan deskripsi kategori (opsional)"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  {editingCategory ? 'Perbarui' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Daftar Barang */}
      {showBarangModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px', width: '90%' }}>
            <div className="modal-header">
              <h2>Barang dalam Kategori: {selectedCategory?.nama_kategori}</h2>
              <button className="modal-close" onClick={closeBarangModal}>&times;</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {loadingBarang ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <p>Memuat data barang...</p>
                </div>
              ) : barangList.length > 0 ? (
                <div className="barang-table-container">
                  <table className="barang-table" style={{ width: '100%', fontSize: '14px' }}>
                    <thead>
                      <tr>
                        <th>Kode</th>
                        <th>Nama Barang</th>
                        <th>Stok</th>
                        <th>Harga Beli</th>
                        <th>Harga Jual</th>
                        <th>Lokasi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {barangList.map((barang) => (
                        <tr key={barang.id_barang}>
                          <td>{barang.kode_barang}</td>
                          <td>{barang.nama_barang}</td>
                          <td className={barang.stok <= barang.stok_minimum ? 'stok-rendah' : ''}>
                            {barang.stok} {barang.satuan}
                          </td>
                          <td>Rp {Number(barang.harga_beli).toLocaleString()}</td>
                          <td>Rp {Number(barang.harga_jual).toLocaleString()}</td>
                          <td>{barang.nama_lokasi || barang.lokasi || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state" style={{ textAlign: 'center', padding: '40px' }}>
                  <div className="empty-icon">📦</div>
                  <h3>Tidak ada barang</h3>
                  <p>Belum ada barang dalam kategori ini</p>
                </div>
              )}
            </div>
            <div className="modal-footer" style={{ textAlign: 'right', padding: '15px', borderTop: '1px solid #eee' }}>
              <button className="btn-secondary" onClick={closeBarangModal}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;