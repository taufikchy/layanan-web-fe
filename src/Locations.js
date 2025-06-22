import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Locations.css';

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [currentLocation, setCurrentLocation] = useState({
    nama_lokasi: '',
    alamat: '',
    deskripsi: ''
  });
  const [showBarangModal, setShowBarangModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
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
    fetchLocations();
  }, [navigate]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/lokasi`, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setLocations(data.data || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setError('Gagal memuat data lokasi');
    } finally {
      setLoading(false);
    }
  };

  const fetchBarangByLocation = async (locationName) => {
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
        barang.nama_lokasi === locationName || barang.lokasi === locationName
      );
      setBarangList(filteredBarang);
    } catch (error) {
      console.error('Error fetching barang:', error);
      alert('Gagal memuat data barang');
    } finally {
      setLoadingBarang(false);
    }
  };

  const handleLocationClick = async (location) => {
    setSelectedLocation(location);
    setShowBarangModal(true);
    await fetchBarangByLocation(location.nama_lokasi);
  };

  const closeBarangModal = () => {
    setShowBarangModal(false);
    setSelectedLocation(null);
    setBarangList([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentLocation(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingLocation 
        ? `${API_BASE_URL}/lokasi/${editingLocation.id_lokasi}`
        : `${API_BASE_URL}/lokasi`;
      
      const method = editingLocation ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: getHeaders(),
        body: JSON.stringify(currentLocation)
      });

      if (response.ok) {
        setShowModal(false);
        resetForm();
        fetchLocations();
        alert(editingLocation ? 'Lokasi berhasil diperbarui!' : 'Lokasi berhasil ditambahkan!');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Terjadi kesalahan');
      }
    } catch (error) {
      console.error('Error saving location:', error);
      alert('Terjadi kesalahan saat menyimpan data');
    }
  };

  const handleEdit = (location) => {
    setEditingLocation(location);
    setCurrentLocation({
      nama_lokasi: location.nama_lokasi,
      deskripsi: location.deskripsi || '',
      alamat: location.alamat || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (location) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus lokasi "${location.nama_lokasi}"?`)) {
      try {
        const response = await fetch(`${API_BASE_URL}/lokasi/${location.id_lokasi}`, {
          method: 'DELETE',
          headers: getHeaders()
        });

        if (response.ok) {
          fetchLocations();
          alert('Lokasi berhasil dihapus!');
        } else {
          const errorData = await response.json();
          alert(errorData.message || 'Terjadi kesalahan saat menghapus lokasi');
        }
      } catch (error) {
        console.error('Error deleting location:', error);
        alert('Terjadi kesalahan saat menghapus lokasi');
      }
    }
  };

  const resetForm = () => {
    setCurrentLocation({
      nama_lokasi: '',
      deskripsi: '',
      alamat: ''
    });
    setEditingLocation(null);
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
      <div className="locations-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Memuat data lokasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="locations-container">
      <div className="locations-header">
        <h1>Lokasi Penyimpanan</h1>
        <button className="btn-primary" onClick={openAddModal}>
          + Tambah Lokasi
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="locations-grid">
        {locations.map((location) => (
          <div key={location.id_lokasi} className="location-card">
            <div className="location-header">
              <h3>{location.nama_lokasi}</h3>
              <div className="location-actions">
                <button 
                  className="btn-edit" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(location);
                  }}
                  title="Edit Lokasi"
                >
                  ✏️
                </button>
                <button 
                  className="btn-delete" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(location);
                  }}
                  title="Hapus Lokasi"
                >
                  🗑️
                </button>
              </div>
            </div>
            <div 
              className="location-content"
              onClick={() => handleLocationClick(location)}
              style={{ cursor: 'pointer' }}
              title="Klik untuk melihat barang di lokasi ini"
            >
              <div className="location-info">
                <div className="info-item">
                  <span className="info-label">📍 Alamat:</span>
                  <span className="info-value">{location.alamat || 'Tidak ada alamat'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">📝 Deskripsi:</span>
                  <span className="info-value">{location.deskripsi || 'Tidak ada deskripsi'}</span>
                </div>
              </div>
              <div className="location-stats">
                <span className="stat-item">
                  <strong>Total Barang:</strong> {location.total_barang || 0}
                </span>
                <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                  👆 Klik untuk melihat daftar barang
                </small>
              </div>
            </div>
          </div>
        ))}
      </div>

      {locations.length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-icon">🏢</div>
          <h3>Belum ada lokasi</h3>
          <p>Mulai dengan menambahkan lokasi penyimpanan pertama Anda</p>
          <button className="btn-primary" onClick={openAddModal}>
            + Tambah Lokasi
          </button>
        </div>
      )}

      {/* Modal Tambah/Edit Lokasi */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingLocation ? 'Edit Lokasi' : 'Tambah Lokasi'}</h2>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="location-form">
              <div className="form-group">
                <label>Nama Lokasi</label>
                <input
                  type="text"
                  name="nama_lokasi"
                  value={currentLocation.nama_lokasi}
                  onChange={handleInputChange}
                  required
                  placeholder="Masukkan nama lokasi"
                />
              </div>
              
              <div className="form-group">
                <label>Alamat</label>
                <textarea
                  name="alamat"
                  value={currentLocation.alamat}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Masukkan alamat lokasi (opsional)"
                />
              </div>
              
              <div className="form-group">
                <label>Deskripsi</label>
                <textarea
                  name="deskripsi"
                  value={currentLocation.deskripsi}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Masukkan deskripsi lokasi (opsional)"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  {editingLocation ? 'Perbarui' : 'Simpan'}
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
              <h2>Barang di Lokasi: {selectedLocation?.nama_lokasi}</h2>
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
                        <th>Kategori</th>
                        <th>Stok</th>
                        <th>Harga Beli</th>
                        <th>Harga Jual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {barangList.map((barang) => (
                        <tr key={barang.id_barang}>
                          <td>{barang.kode_barang}</td>
                          <td>{barang.nama_barang}</td>
                          <td>{barang.nama_kategori || barang.kategori || '-'}</td>
                          <td className={barang.stok <= barang.stok_minimum ? 'stok-rendah' : ''}>
                            {barang.stok} {barang.satuan}
                          </td>
                          <td>Rp {Number(barang.harga_beli).toLocaleString()}</td>
                          <td>Rp {Number(barang.harga_jual).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state" style={{ textAlign: 'center', padding: '40px' }}>
                  <div className="empty-icon">📦</div>
                  <h3>Tidak ada barang</h3>
                  <p>Belum ada barang di lokasi ini</p>
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

export default Locations;