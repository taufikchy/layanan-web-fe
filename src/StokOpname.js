import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StokOpname.css';

const StokOpname = () => {
  const [stokOpnameList, setStokOpnameList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentStokOpname, setCurrentStokOpname] = useState({
    tanggal_opname: '',
    keterangan: '',
    detail_items: []
  });
  const [detailStokOpname, setDetailStokOpname] = useState(null);
  const [barangList, setBarangList] = useState([]);
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
    fetchStokOpname();
    fetchBarang();
  }, [navigate]);

  const fetchStokOpname = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/stok-opname`, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setStokOpnameList(data.data || []);
    } catch (error) {
      console.error('Error fetching stok opname:', error);
      setError('Gagal memuat data stok opname');
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

  const fetchDetailStokOpname = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/stok-opname/${id}`, {
        method: 'GET',
        headers: getHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setDetailStokOpname(data.data);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('Error fetching detail stok opname:', error);
      alert('Gagal memuat detail stok opname');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentStokOpname(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addDetailItem = () => {
    setCurrentStokOpname(prev => ({
      ...prev,
      detail_items: [...prev.detail_items, {
        id_barang: '',
        stok_sistem: '',
        stok_fisik: '',
        selisih: 0,
        keterangan: ''
      }]
    }));
  };

  const removeDetailItem = (index) => {
    setCurrentStokOpname(prev => ({
      ...prev,
      detail_items: prev.detail_items.filter((_, i) => i !== index)
    }));
  };

  const updateDetailItem = (index, field, value) => {
    setCurrentStokOpname(prev => {
      const updatedItems = prev.detail_items.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };
          
          // Auto calculate selisih when stok_sistem or stok_fisik changes
          if (field === 'stok_sistem' || field === 'stok_fisik') {
            const stokSistem = field === 'stok_sistem' ? parseInt(value) || 0 : parseInt(item.stok_sistem) || 0;
            const stokFisik = field === 'stok_fisik' ? parseInt(value) || 0 : parseInt(item.stok_fisik) || 0;
            updatedItem.selisih = stokFisik - stokSistem;
          }
          
          // Auto fill stok_sistem when barang is selected
          if (field === 'id_barang') {
            const selectedBarang = barangList.find(b => b.id_barang === value);
            if (selectedBarang) {
              updatedItem.stok_sistem = selectedBarang.stok;
              updatedItem.selisih = (parseInt(item.stok_fisik) || 0) - selectedBarang.stok;
            }
          }
          
          return updatedItem;
        }
        return item;
      });
      
      return {
        ...prev,
        detail_items: updatedItems
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (currentStokOpname.detail_items.length === 0) {
      alert('Minimal harus ada 1 item barang');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/stok-opname`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(currentStokOpname)
      });

      if (response.ok) {
        setShowModal(false);
        resetForm();
        fetchStokOpname();
        alert('Stok opname berhasil dibuat!');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Terjadi kesalahan');
      }
    } catch (error) {
      console.error('Error saving stok opname:', error);
      alert('Terjadi kesalahan saat menyimpan data');
    }
  };

  const resetForm = () => {
    setCurrentStokOpname({
      tanggal_opname: '',
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
    setDetailStokOpname(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  const getSelisihClass = (selisih) => {
    if (selisih > 0) return 'positive';
    if (selisih < 0) return 'negative';
    return 'zero';
  };

  if (loading) {
    return (
      <div className="stok-opname-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Memuat data stok opname...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stok-opname-container">
      <div className="stok-opname-header">
        <h1>Stok Opname</h1>
        <button className="btn-primary" onClick={openAddModal}>
          + Tambah Stok Opname
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="stok-opname-table-container">
        <table className="stok-opname-table">
          <thead>
            <tr>
              <th>Tanggal Opname</th>
              <th>Total Item</th>
              <th>Total Selisih</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {stokOpnameList.map((opname) => (
              <tr key={opname.id_stok_opname}>
                <td>{formatDate(opname.tanggal_opname)}</td>
                <td>{opname.total_item}</td>
                <td>
                  <span className={`selisih ${getSelisihClass(opname.total_selisih)}`}>
                    {opname.total_selisih > 0 ? '+' : ''}{opname.total_selisih}
                  </span>
                </td>
                <td>
                  <span className={`status ${opname.status}`}>
                    {opname.status}
                  </span>
                </td>
                <td>
                  <button 
                    className="btn-view" 
                    onClick={() => fetchDetailStokOpname(opname.id_stok_opname)}
                  >
                    Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah Stok Opname */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>Tambah Stok Opname</h2>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="stok-opname-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Tanggal Opname</label>
                  <input
                    type="date"
                    name="tanggal_opname"
                    value={currentStokOpname.tanggal_opname}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Keterangan</label>
                  <input
                    type="text"
                    name="keterangan"
                    value={currentStokOpname.keterangan}
                    onChange={handleInputChange}
                    placeholder="Keterangan stok opname"
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
                
                {currentStokOpname.detail_items.map((item, index) => (
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
                        <label>Stok Sistem</label>
                        <input
                          type="number"
                          value={item.stok_sistem}
                          onChange={(e) => updateDetailItem(index, 'stok_sistem', e.target.value)}
                          required
                          readOnly
                        />
                      </div>
                      <div className="form-group">
                        <label>Stok Fisik</label>
                        <input
                          type="number"
                          value={item.stok_fisik}
                          onChange={(e) => updateDetailItem(index, 'stok_fisik', e.target.value)}
                          required
                          min="0"
                        />
                      </div>
                      <div className="form-group">
                        <label>Selisih</label>
                        <input
                          type="number"
                          value={item.selisih}
                          readOnly
                          className={`selisih-input ${getSelisihClass(item.selisih)}`}
                        />
                      </div>
                      <div className="form-group">
                        <label>Keterangan</label>
                        <input
                          type="text"
                          value={item.keterangan}
                          onChange={(e) => updateDetailItem(index, 'keterangan', e.target.value)}
                          placeholder="Keterangan item"
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
                  Simpan Stok Opname
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail Stok Opname */}
      {showDetailModal && detailStokOpname && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>Detail Stok Opname</h2>
              <button className="modal-close" onClick={closeDetailModal}>&times;</button>
            </div>
            <div className="detail-content">
              <div className="detail-info">
                <div className="info-row">
                  <span className="label">Tanggal Opname:</span>
                  <span className="value">{formatDate(detailStokOpname.stok_opname.tanggal_opname)}</span>
                </div>
                <div className="info-row">
                  <span className="label">Status:</span>
                  <span className={`status ${detailStokOpname.stok_opname.status}`}>
                    {detailStokOpname.stok_opname.status}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Total Selisih:</span>
                  <span className={`selisih ${getSelisihClass(detailStokOpname.stok_opname.total_selisih)}`}>
                    {detailStokOpname.stok_opname.total_selisih > 0 ? '+' : ''}{detailStokOpname.stok_opname.total_selisih}
                  </span>
                </div>
                {detailStokOpname.stok_opname.keterangan && (
                  <div className="info-row">
                    <span className="label">Keterangan:</span>
                    <span className="value">{detailStokOpname.stok_opname.keterangan}</span>
                  </div>
                )}
              </div>
              
              <h3>Detail Barang</h3>
              <table className="detail-table">
                <thead>
                  <tr>
                    <th>Barang</th>
                    <th>Stok Sistem</th>
                    <th>Stok Fisik</th>
                    <th>Selisih</th>
                    <th>Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {detailStokOpname.detail_items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.nama_barang}</td>
                      <td>{item.stok_sistem}</td>
                      <td>{item.stok_fisik}</td>
                      <td>
                        <span className={`selisih ${getSelisihClass(item.selisih)}`}>
                          {item.selisih > 0 ? '+' : ''}{item.selisih}
                        </span>
                      </td>
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

export default StokOpname;