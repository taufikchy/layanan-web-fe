import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TransaksiMasuk.css';

const TransaksiMasuk = () => {
  const [transaksiList, setTransaksiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentTransaksi, setCurrentTransaksi] = useState({
    no_referensi: '',
    tanggal_transaksi: '',
    supplier: '',
    keterangan: '',
    detail_items: []
  });
  const [detailTransaksi, setDetailTransaksi] = useState(null);
  const [barangList, setBarangList] = useState([]);
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
    fetchTransaksiMasuk();
    fetchBarang();
    fetchSupplier();
  }, [navigate]);

  const fetchTransaksiMasuk = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/transaksi-masuk`, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setTransaksiList(data.data || []);
    } catch (error) {
      console.error('Error fetching transaksi masuk:', error);
      setError('Gagal memuat data transaksi masuk');
    } finally {
      setLoading(false);
    }
  };

  const fetchBarang = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/barang`, {
        method: 'GET',
        headers: getHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setBarangList(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching barang:', error);
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

  const fetchDetailTransaksi = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/transaksi-masuk/${id}`, {
        method: 'GET',
        headers: getHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setDetailTransaksi(data.data);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('Error fetching detail transaksi:', error);
      alert('Gagal memuat detail transaksi');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentTransaksi(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addDetailItem = () => {
    setCurrentTransaksi(prev => ({
      ...prev,
      detail_items: [...prev.detail_items, {
        id_barang: '',
        jumlah: '',
        harga_satuan: '',
        keterangan: ''
      }]
    }));
  };

  const removeDetailItem = (index) => {
    setCurrentTransaksi(prev => ({
      ...prev,
      detail_items: prev.detail_items.filter((_, i) => i !== index)
    }));
  };

  const updateDetailItem = (index, field, value) => {
    setCurrentTransaksi(prev => ({
      ...prev,
      detail_items: prev.detail_items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (currentTransaksi.detail_items.length === 0) {
      alert('Minimal harus ada 1 item barang');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/transaksi-masuk`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(currentTransaksi)
      });

      if (response.ok) {
        setShowModal(false);
        resetForm();
        fetchTransaksiMasuk();
        alert('Transaksi masuk berhasil dibuat!');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Terjadi kesalahan');
      }
    } catch (error) {
      console.error('Error saving transaksi:', error);
      alert('Terjadi kesalahan saat menyimpan data');
    }
  };

  const resetForm = () => {
    setCurrentTransaksi({
      no_referensi: '',
      tanggal_transaksi: '',
      supplier: '',
      keterangan: '',
      detail_items: []
    });
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setDetailTransaksi(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="transaksi-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Memuat data transaksi masuk...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="transaksi-container">
      <div className="transaksi-header">
        <h1>Transaksi Masuk</h1>
        <button className="btn-primary" onClick={openAddModal}>
          + Tambah Transaksi
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="transaksi-table-container">
        <table className="transaksi-table">
          <thead>
            <tr>
              <th>No. Referensi</th>
              <th>Tanggal</th>
              <th>Supplier</th>
              <th>Total Barang</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {transaksiList.map((transaksi) => (
              <tr key={transaksi.id_transaksi_masuk}>
                <td>{transaksi.no_referensi}</td>
                <td>{formatDate(transaksi.tanggal_transaksi)}</td>
                <td>{transaksi.supplier}</td>
                <td>{transaksi.total_barang}</td>
                <td>
                  <span className={`status ${transaksi.status}`}>
                    {transaksi.status}
                  </span>
                </td>
                <td>
                  <button 
                    className="btn-view" 
                    onClick={() => fetchDetailTransaksi(transaksi.id_transaksi_masuk)}
                  >
                    Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah Transaksi */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>Tambah Transaksi Masuk</h2>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="transaksi-form">
              <div className="form-row">
                <div className="form-group">
                  <label>No. Referensi</label>
                  <input
                    type="text"
                    name="no_referensi"
                    value={currentTransaksi.no_referensi}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Tanggal Transaksi</label>
                  <input
                    type="date"
                    name="tanggal_transaksi"
                    value={currentTransaksi.tanggal_transaksi}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Supplier</label>
                  <select
                    name="supplier"
                    value={currentTransaksi.supplier}
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
                <div className="form-group">
                  <label>Keterangan</label>
                  <input
                    type="text"
                    name="keterangan"
                    value={currentTransaksi.keterangan}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="detail-items-section">
                <div className="section-header">
                  <h3>Detail Barang</h3>
                  <button type="button" className="btn-add-item" onClick={addDetailItem}>
                    + Tambah Item
                  </button>
                </div>
                
                {currentTransaksi.detail_items.map((item, index) => (
                  <div key={index} className="detail-item">
                    <div className="item-row">
                      <div className="form-group">
                        <label>Barang</label>
                        <select
                          value={item.id_barang}
                          onChange={(e) => updateDetailItem(index, 'id_barang', e.target.value)}
                          required
                        >
                          <option value="">Pilih Barang</option>
                          {barangList.map((barang) => (
                            <option key={barang.id_barang} value={barang.id_barang}>
                              {barang.nama_barang} ({barang.kode_barang})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Jumlah</label>
                        <input
                          type="number"
                          value={item.jumlah}
                          onChange={(e) => updateDetailItem(index, 'jumlah', e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Harga Satuan</label>
                        <input
                          type="number"
                          value={item.harga_satuan}
                          onChange={(e) => updateDetailItem(index, 'harga_satuan', e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Keterangan</label>
                        <input
                          type="text"
                          value={item.keterangan}
                          onChange={(e) => updateDetailItem(index, 'keterangan', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>&nbsp;</label>
                        <button 
                          type="button" 
                          className="btn-remove-item"
                          onClick={() => removeDetailItem(index)}
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail Transaksi */}
      {showDetailModal && detailTransaksi && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Detail Transaksi Masuk</h2>
              <button className="modal-close" onClick={closeDetailModal}>&times;</button>
            </div>
            <div className="detail-content">
              <div className="detail-info">
                <div className="info-row">
                  <span className="label">No. Referensi:</span>
                  <span className="value">{detailTransaksi.transaksi.no_referensi}</span>
                </div>
                <div className="info-row">
                  <span className="label">Tanggal:</span>
                  <span className="value">{formatDate(detailTransaksi.transaksi.tanggal_transaksi)}</span>
                </div>
                <div className="info-row">
                  <span className="label">Supplier:</span>
                  <span className="value">{detailTransaksi.transaksi.supplier}</span>
                </div>
                <div className="info-row">
                  <span className="label">Status:</span>
                  <span className={`status ${detailTransaksi.transaksi.status}`}>
                    {detailTransaksi.transaksi.status}
                  </span>
                </div>
              </div>
              
              <h3>Detail Barang</h3>
              <table className="detail-table">
                <thead>
                  <tr>
                    <th>Barang</th>
                    <th>Jumlah</th>
                    <th>Harga Satuan</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {detailTransaksi.detail_items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.nama_barang}</td>
                      <td>{item.jumlah} {item.satuan}</td>
                      <td>{formatCurrency(item.harga_satuan)}</td>
                      <td>{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransaksiMasuk;