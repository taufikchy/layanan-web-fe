import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import './Navigation.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { getDashboardData } from './services/apiService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [userData, setUserData] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    tinjauan_penjualan: {
      pemesanan: 0,
      penjualan: 0,
      keuntungan: 0,
      pemasukan: 0
    },
    tinjauan_pembelian: {
      pembelian: 0,
      biaya: 0,
      barang: 0,
      pengeluaran: 0
    },
    ringkasan_inventaris: {
      kuantitas_tersedia: 0,
      lokasi_barang: 0,
      total_nilai: 0,
      stok_rendah: 0
    },
    ringkasan_produk: {
      jumlah_tersedia: 0,
      jumlah_kategori: 0,
      total_produk: 0,
      jumlah_supplier: 0
    },
    ringkasan_pesanan: {
      data: {
        labels: [],
        datasets: []
      }
    },
    penjualan_pembelian: {
      data: {
        labels: [],
        datasets: []
      }
    },
    stok_terlaris: [],
    stok_menipis: []
  });
  const [stokRendah, setStokRendah] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const storedUserData = localStorage.getItem('userData');
    
    if (!token) {
      navigate('/login');
      return;
    }

    if (storedUserData) {
      try {
        setUserData(JSON.parse(storedUserData));
      } catch (error) {
        console.error('Error parsing userData:', error);
      }
    }

    // Fetch dashboard data from API
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log('Fetching dashboard data...');
        const data = await getDashboardData();
        console.log('Dashboard data received:', data);
        
        if (!data) {
          throw new Error('Data dashboard kosong atau tidak valid');
        }
        
        setDashboardData(data);
        setLoading(false);
        setIsLoaded(true);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Terjadi kesalahan saat memuat data dashboard. Silakan coba lagi nanti.');
        setLoading(false);
      }
    };

    // Fetch stok rendah data
    const fetchStokRendah = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3001/api/barang/stok-rendah', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          setStokRendah(result.data || []);
          if (result.data && result.data.length > 0) {
            setShowNotification(true);
          }
        }
      } catch (error) {
        console.error('Error fetching stok rendah:', error);
      }
    };

    fetchDashboardData();
    fetchStokRendah();
    
    // Set interval untuk check stok rendah setiap 5 menit
    const interval = setInterval(fetchStokRendah, 300000);
    
    return () => clearInterval(interval);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    navigate('/login');
  };

  // Fungsi untuk memformat angka dengan pemisah ribuan
  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <div className={`dashboard-container ${isLoaded ? 'fade-in' : ''}`}>
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
          <Link
            to="/dashboard"
            className="nav-item active"
            onClick={() => setIsOpen(false)}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-text">Dashboard</span>
          </Link>
          <Link
            to="/barang"
            className="nav-item"
            onClick={() => setIsOpen(false)}
          >
            <span className="nav-icon">📦</span>
            <span className="nav-text">Data Barang</span>
          </Link>
          <Link
            to="/categories"
            className="nav-item"
            onClick={() => setIsOpen(false)}
          >
            <span className="nav-icon">🏷️</span>
            <span className="nav-text">Kategori</span>
          </Link>
          <Link
            to="/locations"
            className="nav-item"
            onClick={() => setIsOpen(false)}
          >
            <span className="nav-icon">📍</span>
            <span className="nav-text">Lokasi</span>
          </Link>
          <Link
            to="/suppliers"
            className="nav-item"
            onClick={() => setIsOpen(false)}
          >
            <span className="nav-icon">🏪</span>
            <span className="nav-text">Supplier</span>
          </Link>
          <Link
            to="/transaksi-masuk"
            className="nav-item"
            onClick={() => setIsOpen(false)}
          >
            <span className="nav-icon">📥</span>
            <span className="nav-text">Transaksi Masuk</span>
          </Link>
          <Link
            to="/transaksi-keluar"
            className="nav-item"
            onClick={() => setIsOpen(false)}
          >
            <span className="nav-icon">📤</span>
            <span className="nav-text">Transaksi Keluar</span>
          </Link>
          <Link
            to="/stok-opname"
            className="nav-item"
            onClick={() => setIsOpen(false)}
          >
            <span className="nav-icon">📋</span>
            <span className="nav-text">Stok Opname</span>
          </Link>
          <Link
            to="/users"
            className="nav-item"
            onClick={() => setIsOpen(false)}
          >
            <span className="nav-icon">👥</span>
            <span className="nav-text">Pengguna</span>
          </Link>
          <Link
            to="/activity-logs"
            className="nav-item"
            onClick={() => setIsOpen(false)}
          >
            <span className="nav-icon">📝</span>
            <span className="nav-text">Log Aktivitas</span>
          </Link>
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

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <div className="search-container">
            <i className="search-icon"></i>
            <input type="text" placeholder="Search product, supplier, order" className="search-input" />
          </div>
          <div className="user-profile">
            <div className="notification-icon">
              <i className="bell-icon"></i>
            </div>
            <div className="profile-image">
              <img src="/logo_small.png" alt="Profile" />
            </div>
            {userData && <div className="user-name">{userData.username}</div>}
          </div>
        </header>
        
        {/* Notifikasi Stok Rendah */}
        {showNotification && stokRendah.length > 0 && (
          <div className="notification-container">
            <div className="notification-header">
              <div className="notification-icon">⚠️</div>
              <h3>Peringatan Stok Rendah!</h3>
              <button 
                className="close-notification"
                onClick={() => setShowNotification(false)}
              >
                ×
              </button>
            </div>
            <div className="notification-content">
              <p>Terdapat {stokRendah.length} barang dengan stok hampir habis:</p>
              <div className="stok-rendah-list">
                {stokRendah.slice(0, 5).map((barang) => (
                  <div key={barang.id_barang} className="stok-rendah-item">
                    <span className="barang-nama">{barang.nama_barang}</span>
                    <span className="barang-stok">Stok: {barang.stok} / Min: {barang.stok_minimum}</span>
                  </div>
                ))}
                {stokRendah.length > 5 && (
                  <div className="more-items">dan {stokRendah.length - 5} barang lainnya...</div>
                )}
              </div>
              <Link to="/barang" className="view-all-btn">
                Lihat Semua Barang
              </Link>
            </div>
          </div>
        )}
        
        {/* Loading State */}
        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Memuat data dashboard...</p>
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <p>{error}</p>
            <button 
              className="retry-button"
              onClick={() => window.location.reload()}
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Dashboard Content */}
        {!loading && !error && (
          <div className="dashboard-content">
          {/* Tinjauan Penjualan */}
          <div className="dashboard-card">
            <h2 className="card-title">Tinjauan Penjualan</h2>
            <div className="stats-container">
              <div className="stat-item clickable" onClick={() => navigate('/transaksi-keluar')}>
                <div className="stat-icon blue">
                  <i className="order-icon"></i>
                </div>
                <div className="stat-info">
                  <h3 className="stat-value">{formatNumber(dashboardData.tinjauan_penjualan.pemesanan)}</h3>
                  <p className="stat-label">Pemesanan</p>
                </div>
              </div>
              <div className="stat-item clickable" onClick={() => navigate('/transaksi-keluar')}>
                <div className="stat-icon purple">
                  <i className="sales-icon"></i>
                </div>
                <div className="stat-info">
                  <h3 className="stat-value">{formatNumber(dashboardData.tinjauan_penjualan.penjualan)}</h3>
                  <p className="stat-label">Penjualan</p>
                </div>
              </div>
              <div className="stat-item clickable" onClick={() => navigate('/transaksi-keluar')}>
                <div className="stat-icon orange">
                  <i className="profit-icon"></i>
                </div>
                <div className="stat-info">
                  <h3 className="stat-value">{formatRupiah(dashboardData.tinjauan_penjualan.keuntungan)}</h3>
                  <p className="stat-label">Keuntungan</p>
                </div>
              </div>
              <div className="stat-item clickable" onClick={() => navigate('/transaksi-keluar')}>
                <div className="stat-icon green">
                  <i className="income-icon"></i>
                </div>
                <div className="stat-info">
                  <h3 className="stat-value">{formatRupiah(dashboardData.tinjauan_penjualan.pemasukan)}</h3>
                  <p className="stat-label">Pemasukan</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tinjauan Pembelian */}
          <div className="dashboard-card">
            <h2 className="card-title">Tinjauan Pembelian</h2>
            <div className="stats-container">
              <div className="stat-item clickable" onClick={() => navigate('/transaksi-masuk')}>
                <div className="stat-icon blue">
                  <i className="purchase-icon"></i>
                </div>
                <div className="stat-info">
                  <h3 className="stat-value">{formatNumber(dashboardData.tinjauan_pembelian.pembelian)}</h3>
                  <p className="stat-label">Pembelian</p>
                </div>
              </div>
              <div className="stat-item clickable" onClick={() => navigate('/transaksi-masuk')}>
                <div className="stat-icon green">
                  <i className="cost-icon"></i>
                </div>
                <div className="stat-info">
                  <h3 className="stat-value">{formatRupiah(dashboardData.tinjauan_pembelian.biaya)}</h3>
                  <p className="stat-label">Biaya</p>
                </div>
              </div>
              <div className="stat-item clickable" onClick={() => navigate('/transaksi-masuk')}>
                <div className="stat-icon purple">
                  <i className="items-icon"></i>
                </div>
                <div className="stat-info">
                  <h3 className="stat-value">{formatNumber(dashboardData.tinjauan_pembelian.barang)}</h3>
                  <p className="stat-label">Barang</p>
                </div>
              </div>
              <div className="stat-item clickable" onClick={() => navigate('/transaksi-masuk')}>
                <div className="stat-icon orange">
                  <i className="expense-icon"></i>
                </div>
                <div className="stat-info">
                  <h3 className="stat-value">{formatRupiah(dashboardData.tinjauan_pembelian.pengeluaran)}</h3>
                  <p className="stat-label">Pengeluaran</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ringkasan Inventaris */}
          <div className="dashboard-card">
            <h2 className="card-title">Ringkasan Inventaris</h2>
            <div className="stats-container">
              <div className="stat-item clickable" onClick={() => navigate('/barang')}>
                <div className="stat-icon orange">
                  <i className="quantity-icon">📦</i>
                </div>
                <div className="stat-info">
                  <h3 className="stat-value">{formatNumber(dashboardData.ringkasan_inventaris.kuantitas_tersedia)}</h3>
                  <p className="stat-label">Kuantitas Tersedia</p>
                </div>
              </div>
              <div className="stat-item clickable" onClick={() => navigate('/barang')}>
                <div className="stat-icon purple">
                  <i className="location-icon">📍</i>
                </div>
                <div className="stat-info">
                  <h3 className="stat-value">{formatNumber(dashboardData.ringkasan_inventaris.lokasi_barang)}</h3>
                  <p className="stat-label">Lokasi Barang</p>
                </div>
              </div>
              <div className="stat-item clickable" onClick={() => navigate('/barang')}>
                <div className="stat-icon green">
                  <i className="value-icon">💰</i>
                </div>
                <div className="stat-info">
                  <h3 className="stat-value">{formatRupiah(dashboardData.ringkasan_inventaris.total_nilai)}</h3>
                  <p className="stat-label">Total Nilai</p>
                </div>
              </div>
              <div className="stat-item clickable" onClick={() => navigate('/barang')}>
                <div className="stat-icon red">
                  <i className="warning-icon">⚠️</i>
                </div>
                <div className="stat-info">
                  <h3 className="stat-value">{formatNumber(dashboardData.ringkasan_inventaris.stok_rendah)}</h3>
                  <p className="stat-label">Stok Rendah</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ringkasan Produk */}
          <div className="dashboard-card">
            <h2 className="card-title">Ringkasan Produk</h2>
            <div className="stats-container">
              <div className="stat-item clickable" onClick={() => navigate('/barang')}>
                <div className="stat-icon blue">
                  <i className="available-icon">✅</i>
                </div>
                <div className="stat-info">
                  <h3 className="stat-value">{formatNumber(dashboardData.ringkasan_produk.jumlah_tersedia)}</h3>
                  <p className="stat-label">Jumlah Tersedia</p>
                </div>
              </div>
              <div className="stat-item clickable" onClick={() => navigate('/categories')}>
                <div className="stat-icon purple">
                  <i className="category-icon">🏷️</i>
                </div>
                <div className="stat-info">
                  <h3 className="stat-value">{formatNumber(dashboardData.ringkasan_produk.jumlah_kategori)}</h3>
                  <p className="stat-label">Jumlah Kategori</p>
                </div>
              </div>
              <div className="stat-item clickable" onClick={() => navigate('/barang')}>
                <div className="stat-icon orange">
                  <i className="total-icon">📋</i>
                </div>
                <div className="stat-info">
                  <h3 className="stat-value">{formatNumber(dashboardData.ringkasan_produk.total_produk)}</h3>
                  <p className="stat-label">Total Produk</p>
                </div>
              </div>
              <div className="stat-item clickable" onClick={() => navigate('/suppliers')}>
                <div className="stat-icon green">
                  <i className="supplier-icon">🏪</i>
                </div>
                <div className="stat-info">
                  <h3 className="stat-value">{formatNumber(dashboardData.ringkasan_produk.jumlah_supplier)}</h3>
                  <p className="stat-label">Jumlah Supplier</p>
                </div>
              </div>
            </div>
          </div>

          {/* Penjualan & Pembelian Chart */}
          <div className="dashboard-card chart-card">
            <div className="card-header">
              <h2 className="card-title">Penjualan & Pembelian</h2>
              <div className="chart-legend">
                <div className="legend-item">
                  <span className="legend-color sales"></span>
                  <span className="legend-label">Penjualan</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color purchase"></span>
                  <span className="legend-label">Pembelian</span>
                </div>
              </div>
            </div>
            <div className="chart-container">
              <Bar 
                data={dashboardData.penjualan_pembelian.data}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.05)'
                      },
                      ticks: {
                        callback: function(value) {
                          return value >= 1000 ? value / 1000 + 'k' : value;
                        }
                      }
                    },
                    x: {
                      grid: {
                        display: false
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          let label = context.dataset.label || '';
                          if (label) {
                            label += ': ';
                          }
                          if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(context.parsed.y);
                          }
                          return label;
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Ringkasan Pesanan Chart */}
          <div className="dashboard-card chart-card">
            <div className="card-header">
              <h2 className="card-title">Ringkasan Pesanan</h2>
              <div className="chart-toggle">
                <button className="toggle-btn active">Mingguan</button>
                <button className="toggle-btn">Bulanan</button>
              </div>
            </div>
            <div className="chart-container">
              <Line 
                data={dashboardData.ringkasan_pesanan.data}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.05)'
                      },
                      ticks: {
                        callback: function(value) {
                          return value >= 1000 ? value / 1000 + 'k' : value;
                        }
                      }
                    },
                    x: {
                      grid: {
                        display: false
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          let label = context.dataset.label || '';
                          if (label) {
                            label += ': ';
                          }
                          if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(context.parsed.y);
                          }
                          return label;
                        }
                      }
                    }
                  },
                  elements: {
                    line: {
                      tension: 0.4
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Stok Terlaris */}
          <div className="dashboard-card table-card clickable" onClick={() => navigate('/barang')}>
            <div className="card-header">
              <h2 className="card-title">Stok Terlaris</h2>
              <button className="see-all-btn">See All</button>
            </div>
            <div className="table-container">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Jumlah Terjual</th>
                    <th>Jumlah yang tersisa</th>
                    <th>Harga</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.stok_terlaris.map((item, index) => (
                    <tr key={index}>
                      <td>{item.nama}</td>
                      <td>{item.jumlah_terjual}</td>
                      <td>{item.jumlah_tersedia}</td>
                      <td>{formatRupiah(item.harga)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stok Menipis */}
          <div className="dashboard-card table-card clickable" onClick={() => navigate('/barang')}>
            <div className="card-header">
              <h2 className="card-title">Stok Menipis</h2>
              <button className="see-all-btn">Lihat Semua</button>
            </div>
            <div className="stock-alert-container">
              {dashboardData.stok_menipis.map((item, index) => (
                <div key={index} className="stock-alert-item">
                  <div className="stock-alert-image">
                    <img src={item.gambar} alt={item.nama} />
                  </div>
                  <div className="stock-alert-info">
                    <h3 className="stock-alert-name">{item.nama}</h3>
                    <p className="stock-alert-quantity">Jumlah Stok: {item.jumlah_stok} Paket</p>
                  </div>
                  <button 
                      className="restock-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/barang');
                      }}
                    >
                      Kelola Stok
                    </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Dashboard;