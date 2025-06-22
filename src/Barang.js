import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Barang.css';

const Barang = () => {
  const [barangList, setBarangList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentBarang, setCurrentBarang] = useState({
    kode_barang: '',
    nama_barang: '',
    kategori: '',
    satuan: '',
    harga_beli: '',
    harga_jual: '',
    stok: '',
    stok_minimum: '',
    lokasi: '',
    supplier: '',
    keterangan: ''
  });
  const [kategoriesList, setKategoriesList] = useState([]);
  const [lokasiList, setLokasiList] = useState([]);
  const [supplierList, setSupplierList] = useState([]);
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
    fetchBarang();
    fetchKategories();
    fetchLokasi();
    fetchSupplier();
  }, [navigate]);

  const fetchBarang = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/barang`, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setBarangList(data.data || []);
    } catch (error) {
      console.error('Error fetching barang:', error);
      setError('Gagal memuat data barang');
    } finally {
      setLoading(false);
    }
  };

  const fetchKategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/kategori`, {
        method: 'GET',
        headers: getHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setKategoriesList(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchLokasi = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/lokasi`, {
        method: 'GET',
        headers: getHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setLokasiList(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching lokasi:', error);
    }
  };

  const fetchSupplier = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/supplier`, {
        method: 'GET',
        headers: getHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setSupplierList(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching supplier:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentBarang(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editMode 
        ? `${API_BASE_URL}/barang/${currentBarang.id_barang}`
        : `${API_BASE_URL}/barang`;
      
      const method = editMode ? 'PUT' : 'POST';
      
      // Convert kategori and lokasi names to IDs
      const selectedKategori = kategoriesList.find(k => k.nama_kategori === currentBarang.kategori);
      const selectedLokasi = lokasiList.find(l => l.nama_lokasi === currentBarang.lokasi);
      
      const barangData = {
        ...currentBarang,
        id_kategori: selectedKategori ? selectedKategori.id_kategori : null,
        id_lokasi: selectedLokasi ? selectedLokasi.id_lokasi : null
      };
      
      // Remove the name fields that backend doesn't expect
       delete barangData.kategori;
       delete barangData.lokasi;
       delete barangData.supplier;
       // Keep stok_minimum as it's now supported by backend
      
      const response = await fetch(url, {
        method: method,
        headers: getHeaders(),
        body: JSON.stringify(barangData)
      });

      if (response.ok) {
        setShowModal(false);
        resetForm();
        fetchBarang();
        alert(editMode ? 'Barang berhasil diupdate!' : 'Barang berhasil ditambahkan!');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Terjadi kesalahan');
      }
    } catch (error) {
      console.error('Error saving barang:', error);
      alert('Terjadi kesalahan saat menyimpan data');
    }
  };

  const handleEdit = (barang) => {
    // Convert id_kategori and id_lokasi back to names for display
    const kategoriName = kategoriesList.find(k => k.id_kategori === barang.id_kategori)?.nama_kategori || '';
    const lokasiName = lokasiList.find(l => l.id_lokasi === barang.id_lokasi)?.nama_lokasi || '';
    
    setCurrentBarang({
      ...barang,
      kategori: kategoriName,
      lokasi: lokasiName,
      supplier: '', // Reset supplier for now
      stok_minimum: barang.stok_minimum || ''
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus barang ini?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/barang/${id}`, {
          method: 'DELETE',
          headers: getHeaders()
        });

        if (response.ok) {
          fetchBarang();
          alert('Barang berhasil dihapus!');
        } else {
          alert('Gagal menghapus barang');
        }
      } catch (error) {
        console.error('Error deleting barang:', error);
        alert('Terjadi kesalahan saat menghapus data');
      }
    }
  };

  const resetForm = () => {
    setCurrentBarang({
      kode_barang: '',
      nama_barang: '',
      kategori: '',
      satuan: '',
      harga_beli: '',
      harga_jual: '',
      stok: '',
      stok_minimum: '',
      lokasi: '',
      supplier: '',
      keterangan: ''
    });
    setEditMode(false);
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
      <div className="barang-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Memuat data barang...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="barang-container">
      <div className="barang-header">
        <h1>Manajemen Barang</h1>
        <button className="btn-primary" onClick={openAddModal}>
          + Tambah Barang
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="barang-table-container">
        <table className="barang-table">
          <thead>
            <tr>
              <th>Kode</th>
              <th>Nama Barang</th>
              <th>Kategori</th>
              <th>Stok</th>
              <th>Harga Beli</th>
              <th>Harga Jual</th>
              <th>Lokasi</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {barangList.map((barang) => (
              <tr key={barang.id_barang}>
                <td>{barang.kode_barang}</td>
                <td>{barang.nama_barang}</td>
                <td>{barang.kategori}</td>
                <td className={barang.stok <= barang.stok_minimum ? 'stok-rendah' : ''}>
                  {barang.stok} {barang.satuan}
                </td>
                <td>Rp {Number(barang.harga_beli).toLocaleString()}</td>
                <td>Rp {Number(barang.harga_jual).toLocaleString()}</td>
                <td>{barang.lokasi}</td>
                <td>
                  <button 
                    className="btn-edit" 
                    onClick={() => handleEdit(barang)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn-delete" 
                    onClick={() => handleDelete(barang.id_barang)}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editMode ? 'Edit Barang' : 'Tambah Barang'}</h2>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="barang-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Kode Barang</label>
                  <input
                    type="text"
                    name="kode_barang"
                    value={currentBarang.kode_barang}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Nama Barang</label>
                  <input
                    type="text"
                    name="nama_barang"
                    value={currentBarang.nama_barang}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Kategori</label>
                  <select
                    name="kategori"
                    value={currentBarang.kategori}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Pilih Kategori</option>
                    {kategoriesList.map((kategori) => (
                      <option key={kategori.id_kategori} value={kategori.nama_kategori}>
                        {kategori.nama_kategori}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Satuan</label>
                  <input
                    type="text"
                    name="satuan"
                    value={currentBarang.satuan}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Harga Beli</label>
                  <input
                    type="number"
                    name="harga_beli"
                    value={currentBarang.harga_beli}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Harga Jual</label>
                  <input
                    type="number"
                    name="harga_jual"
                    value={currentBarang.harga_jual}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Stok</label>
                  <input
                    type="number"
                    name="stok"
                    value={currentBarang.stok}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Stok Minimum</label>
                  <input
                    type="number"
                    name="stok_minimum"
                    value={currentBarang.stok_minimum}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Lokasi</label>
                  <select
                    name="lokasi"
                    value={currentBarang.lokasi}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Pilih Lokasi</option>
                    {lokasiList.map((lokasi) => (
                      <option key={lokasi.id_lokasi} value={lokasi.nama_lokasi}>
                        {lokasi.nama_lokasi}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Supplier</label>
                  <select
                    name="supplier"
                    value={currentBarang.supplier}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Pilih Supplier</option>
                    {supplierList.map((supplier) => (
                      <option key={supplier.id_supplier} value={supplier.nama_supplier}>
                        {supplier.nama_supplier}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Keterangan</label>
                <textarea
                  name="keterangan"
                  value={currentBarang.keterangan}
                  onChange={handleInputChange}
                  rows="3"
                ></textarea>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  {editMode ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Barang;