import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './TransaksiKeluar.css';

const TransaksiKeluar = () => {
  const [transaksiList, setTransaksiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentTransaksi, setCurrentTransaksi] = useState({
    tanggal_transaksi: '',
    tujuan: '',
    keterangan: '',
    detail_items: []
  });
  const [detailTransaksi, setDetailTransaksi] = useState(null);
  const [barangList, setBarangList] = useState([]);
  const navigate = useNavigate();

  const API_BASE_URL = 'http://localhost:3001/api';

  const getToken = () => {
    return localStorage.getItem('token');
  };

  const getHeaders = useCallback(() => {
    const token = getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }, []);

  const fetchTransaksiKeluar = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/transaksi-keluar`, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setTransaksiList(data.data || []);
    } catch (error) {
      console.error('Error fetching transaksi keluar:', error);
      setError('Gagal memuat data transaksi keluar');
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  const fetchBarang = useCallback(async () => {
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
  }, [getHeaders]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchTransaksiKeluar();
    fetchBarang();
  }, [navigate, fetchTransaksiKeluar, fetchBarang]);

  const fetchDetailTransaksi = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/transaksi-keluar/${id}`, {
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

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
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
      const response = await fetch(`${API_BASE_URL}/transaksi-keluar`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(currentTransaksi)
      });

      if (response.ok) {
        setShowModal(false);
        resetForm();
        fetchTransaksiKeluar();
        alert('Transaksi keluar berhasil dibuat!');
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
      tanggal_transaksi: '',
      tujuan: '',
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

  if (loading) {
    return (
      <div className="transaksi-keluar-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Memuat data transaksi keluar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="transaksi-keluar-container">
      <div className="transaksi-keluar-header">
        <h1>Transaksi Keluar</h1>
        <button className="btn-primary" onClick={openAddModal}>
          + Tambah Transaksi
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="transaksi-keluar-table-container">
        <table className="transaksi-keluar-table">
          <thead>
            <tr>
              <th>No. Referensi</th>
              <th>Tanggal</th>
              <th>Tujuan</th>
              <th>Total Barang</th>
              <th>Status</th>
              <th>Total Harga</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {transaksiList.map((transaksi) => (
              <tr key={transaksi.id_transaksi_keluar}>
                <td>{transaksi.no_referensi}</td>
                <td>{formatDate(transaksi.tanggal_transaksi)}</td>
                <td>{transaksi.tujuan}</td>
                <td>{transaksi.total_barang}</td>
                <td>
                  <span className={`status ${transaksi.status}`}>
                    {transaksi.status}
                  </span>
                </td>
                <td>{formatRupiah(transaksi.total_harga)}</td>
                <td>
                  <button 
                    className="btn-view" 
                    onClick={() => fetchDetailTransaksi(transaksi.id_transaksi_keluar)}
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
              <h2>Tambah Transaksi Keluar</h2>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="transaksi-keluar-form">
              <div className="form-row">

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
                  <label>Tujuan</label>
                  <input
                    type="text"
                    name="tujuan"
                    value={currentTransaksi.tujuan}
                    onChange={handleInputChange}
                    required
                    placeholder="Contoh: Penjualan, Transfer Gudang, dll"
                  />
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
                              {barang.nama_barang} ({barang.kode_barang}) - Stok: {barang.stok}
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
                          min="1"
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
              <h2>Detail Transaksi Keluar</h2>
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
                  <span className="label">Tujuan:</span>
                  <span className="value">{detailTransaksi.transaksi.tujuan}</span>
                </div>
                <div className="info-row">
                  <span className="label">Status:</span>
                  <span className={`status ${detailTransaksi.transaksi.status}`}>
                    {detailTransaksi.transaksi.status}
                  </span>
                </div>
                {detailTransaksi.transaksi.keterangan && (
                  <div className="info-row">
                    <span className="label">Keterangan:</span>
                    <span className="value">{detailTransaksi.transaksi.keterangan}</span>
                  </div>
                )}
              </div>
              
              <h3>Detail Barang</h3>
              <table className="detail-table">
                <thead>
                  <tr>
                    <th>Barang</th>
                    <th>Jumlah</th>
                    <th>Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {detailTransaksi.detail_items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.nama_barang}</td>
                      <td>{item.jumlah} {item.satuan}</td>
                      <td>{formatRupiah(item.harga_satuan)}</td>
                      <td>{formatRupiah(item.sub_total)}</td>
                      <td>{item.keterangan || '-'}</td>
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

export default TransaksiKeluar;