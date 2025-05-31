import React, { useState, useEffect } from 'react';
import './Login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    // Animasi tombol saat submit
    const button = e.target.querySelector('.login-button');
    button.classList.add('button-loading');
    
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Simpan token dan data user ke localStorage
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        // Redirect ke halaman dashboard atau home
        window.location.href = '/dashboard';
      } else {
        setError(data.message || 'Login gagal. Silakan coba lagi.');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi nanti.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
      button.classList.remove('button-loading');
    }
  };

  return (
    <div className={`login-container ${isLoaded ? 'fade-in' : ''}`}>
      <div className="login-card">
        <div className="top-logo">
          
        </div>
        
        <div className="login-content">
          <div className="login-header">
            <div className="logo-placeholder">
              <div className="logo-tasur">
                <img src="/logo_tasur.png" alt="Tasur Inventory" className="main-logo" />
              </div>
            </div>
            <h2 className="slide-in-down">Masuk ke akun Anda</h2>
            <p className="subtitle slide-in-down" style={{ animationDelay: '0.1s' }}>Selamat datang kembali. Silakan masukkan detail Anda untuk login</p>
          </div>
          
          {error && (
            <div className="error-message slide-in-down" style={{ marginBottom: '1rem', color: '#e53e3e', textAlign: 'center' }}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group slide-in-down" style={{ animationDelay: '0.3s', textAlign:'left' }}>
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                placeholder="Masukkan username Anda"
                required
                className="input-animated"
              />
            </div>
            
            <div className="input-group slide-in-down" style={{ animationDelay: '0.4s', textAlign:'left' }}>
              <label htmlFor="password">Kata Sandi</label>
              <div className="password-input-container">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="input-animated"
                />
              </div>
            </div>
            
            <div className="remember-forgot slide-in-down" style={{ animationDelay: '0.5s' }}>
              <div className="remember-me">
                <input type="checkbox" id="remember" className="custom-checkbox" />
                <label htmlFor="remember">Ingat password ini</label>
              </div>
              <a href="#" className="forgot-password">Lupa Kata Sandi?</a>
            </div>
            
            <button type="submit" className="login-button slide-in-down" style={{ animationDelay: '0.6s' }} disabled={isLoading}>
              <span className="button-text">Masuk</span>
              <span className="button-loader"></span>
            </button>
            
            <div className="register-link slide-in-down" style={{ animationDelay: '0.7s' }}>
              <p>Belum memiliki akun? <a href="#">Daftar</a></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;