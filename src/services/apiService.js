// API Service untuk Dashboard
const API_BASE_URL = 'http://localhost:3001/api';

// Fungsi untuk mendapatkan token dari localStorage
const getToken = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('Token tidak ditemukan di localStorage');
    return null;
  }
  return token;
};

// Fungsi untuk membuat header dengan token
const getHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

// Fungsi untuk mendapatkan semua data dashboard
export const getDashboardData = async () => {
  try {
    console.log('Requesting dashboard data from:', `${API_BASE_URL}/dashboard`);
    console.log('Headers:', getHeaders());
    
    const response = await fetch(`${API_BASE_URL}/dashboard`, {
      method: 'GET',
      headers: getHeaders()
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const responseText = await response.text();
    console.log('Response text:', responseText);
    
    try {
      const data = JSON.parse(responseText);
      console.log('Parsed data:', data);
      
      if (!data || !data.data) {
        console.error('Invalid data structure received from API');
        return {
          tinjauan_penjualan: { pemesanan: 0, penjualan: 0, keuntungan: 0, pemasukan: 0 },
          tinjauan_pembelian: { pembelian: 0, biaya: 0, barang: 0, pengeluaran: 0 },
          ringkasan_inventaris: { kuantitas_tersedia: 0, lokasi_barang: 0 },
          ringkasan_produk: { jumlah_tersedia: 0, jumlah_kategori: 0 },
          ringkasan_pesanan: { data: { labels: [], datasets: [] } },
          penjualan_pembelian: { data: { labels: [], datasets: [] } },
          stok_terlaris: [],
          stok_menipis: []
        };
      }
      
      return data.data;
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      throw new Error('Invalid JSON response from server');
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

// Fungsi untuk mendapatkan data tinjauan penjualan
export const getTinjauanPenjualan = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/tinjauan-penjualan`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching tinjauan penjualan:', error);
    throw error;
  }
};

// Fungsi untuk mendapatkan data tinjauan pembelian
export const getTinjauanPembelian = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/tinjauan-pembelian`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching tinjauan pembelian:', error);
    throw error;
  }
};

// Fungsi untuk mendapatkan data ringkasan inventaris
export const getRingkasanInventaris = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/ringkasan-inventaris`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching ringkasan inventaris:', error);
    throw error;
  }
};

// Fungsi untuk mendapatkan data ringkasan produk
export const getRingkasanProduk = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/ringkasan-produk`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching ringkasan produk:', error);
    throw error;
  }
};

// Fungsi untuk mendapatkan data ringkasan pesanan
export const getRingkasanPesanan = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/ringkasan-pesanan`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching ringkasan pesanan:', error);
    throw error;
  }
};

// Fungsi untuk mendapatkan data penjualan dan pembelian
export const getPenjualanPembelian = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/penjualan-pembelian`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching penjualan pembelian:', error);
    throw error;
  }
};

// Fungsi untuk mendapatkan data stok terlaris
export const getStokTerlaris = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/stok-terlaris`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching stok terlaris:', error);
    throw error;
  }
};

// Fungsi untuk mendapatkan data stok menipis
export const getStokMenipis = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/stok-menipis`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching stok menipis:', error);
    throw error;
  }
};