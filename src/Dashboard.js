import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';
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
      lokasi_barang: 0
    },
    ringkasan_produk: {
      jumlah_tersedia: 0,
      jumlah_kategori: 0
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

    fetchDashboardData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    navigate('/login');
  };

  // Fungsi untuk memformat angka dengan pemisah ribuan
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <div className={`dashboard-container ${isLoaded ? 'fade-in' : ''}`}>
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <img src="/logo_tasur.png" alt="Tasur Inventory" className="sidebar-logo" />
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item active">
            <i className="nav-icon home-icon"></i>
            <span>Beranda</span>
          </Link>
          <Link to="/penjualan" className="nav-item">
            <i className="nav-icon sales-icon"></i>
            <span>Penjualan</span>
          </Link>
          <Link to="/laporan" className="nav-item">
            <i className="nav-icon report-icon"></i>
            <span>Laporan</span>
          </Link>
          <Link to="/pemasok" className="nav-item">
            <i className="nav-icon supplier-icon"></i>
            <span>Pemasok</span>
          </Link>
          <Link to="/pesanan" className="nav-item">
            <i className="nav-icon order-icon"></i>
            <span>Pesanan</span>
          </Link>
          <Link to="/kelola-toko" className="nav-item">
            <i className="nav-icon store-icon"></i>
            <span>Kelola Toko</span>
          </Link>
          <Link to="/pengaturan" className="nav-item">
            <i className="nav-icon settings-icon"></i>
            <span>Pengaturan</span>
          </Link>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="nav-item logout">
            <i className="nav-icon logout-icon"></i>
            <span>Keluar</span>
          </button>
        </div>
      </div>

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
              <div className="stat-item">
                <div className="stat-icon blue">
                  <i className="order-icon"></i>
                </div>
                <div className="stat-info">
                  <h3 className="stat-value">{formatNumber(dashboardData.tinjauan_penjualan.pemesanan)}</h3>
                  <p className="stat-label">Pemesanan</p>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon purple">
                  <i className="sales-icon"></i>
                </div>
                <div className="stat-info">
                  <h3 className="stat-value">{formatNumber(dashboardData.tinjauan_penjualan.penjualan)}</h3>
                  <p className="stat-label">Penjualan</p>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon orange">
                  <i className="profit-icon"></i>
                </div>
                <div className="stat-info">
                  <h3 className="stat-value">{formatNumber(dashboardData.tinjauan_penjualan.keuntungan)}</h3>
                  <p className="stat-label">Keuntungan</p>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon green">
                  <i className="income-icon"></i>
                </div>
                <div className="stat-info">
                  <h3 className="stat-value">{formatNumber(dashboardData.tinjauan_penjualan.pemasukan)}</h3>
                  <p className="stat-label">Pemasukan</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tinjauan Pembelian */}
          <div className="dashboard-card">
            <h2 className="card-title">Tinjauan Pembelian</h2>
            <div className="stats-container">
              <div className="stat-item">
                <div className="stat-icon blue">
                  <i className="purchase-icon"></i>
                </div>
                <div className="stat-info">
                  <h3 className="stat-value">{formatNumber(dashboardData.tinjauan_pembelian.pembelian)}</h3>
                  <p className="stat-label">Pembelian</p>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon green">
                  <i className="cost-icon"></i>
                </div>
                <div className="stat-info">
                  <h3 className="stat-value">{formatNumber(dashboardData.tinjauan_pembelian.biaya)}</h3>
                  <p className="stat-label">Biaya</p>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon purple">
                  <i className="items-icon"></i>
                </div>
                <div className="stat-info">
                  <h3 className="stat-value">{formatNumber(dashboardData.tinjauan_pembelian.barang)}</h3>
                  <p className="stat-label">Barang</p>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon orange">
                  <i className="expense-icon"></i>
                </div>
                <div className="stat-info">
                  <h3 className="stat-value">{formatNumber(dashboardData.tinjauan_pembelian.pengeluaran)}</h3>
                  <p className="stat-label">Pengeluaran</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ringkasan Inventaris */}
          <div className="dashboard-card small-card">
            <h2 className="card-title">Ringkasan Inventaris</h2>
            <div className="stats-container two-columns">
              <div className="stat-item">
                <div className="stat-icon orange">
                  <i className="quantity-icon"></i>
                </div>
                <div className="stat-info">
                  <h3 className="stat-value">{formatNumber(dashboardData.ringkasan_inventaris.kuantitas_tersedia)}</h3>
                  <p className="stat-label">Kuantitas Tersedia</p>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon purple">
                  <i className="location-icon"></i>
                </div>
                <div className="stat-info">
                  <h3 className="stat-value">{formatNumber(dashboardData.ringkasan_inventaris.lokasi_barang)}</h3>
                  <p className="stat-label">Lokasi Barang</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ringkasan Produk */}
          <div className="dashboard-card small-card">
            <h2 className="card-title">Ringkasan Produk</h2>
            <div className="stats-container two-columns">
              <div className="stat-item">
                <div className="stat-icon blue">
                  <i className="available-icon"></i>
                </div>
                <div className="stat-info">
                  <h3 className="stat-value">{formatNumber(dashboardData.ringkasan_produk.jumlah_tersedia)}</h3>
                  <p className="stat-label">Jumlah Tersedia</p>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon purple">
                  <i className="category-icon"></i>
                </div>
                <div className="stat-info">
                  <h3 className="stat-value">{formatNumber(dashboardData.ringkasan_produk.jumlah_kategori)}</h3>
                  <p className="stat-label">Jumlah Kategori</p>
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
          <div className="dashboard-card table-card">
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
                      <td>{item.harga}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stok Menipis */}
          <div className="dashboard-card table-card">
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
                  <button className="restock-btn">Restock</button>
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