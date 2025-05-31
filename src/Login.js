import React, { useState, useEffect } from 'react';
import './Login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [isLoaded, setIsLoaded] = useState(false);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Implementasi logika login akan ditambahkan di sini
    console.log('Login attempt:', credentials);
    
    // Animasi tombol saat submit
    const button = e.target.querySelector('.login-button');
    button.classList.add('button-loading');
    
    setTimeout(() => {
      button.classList.remove('button-loading');
    }, 1500);
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
            
            <button type="submit" className="login-button slide-in-down" style={{ animationDelay: '0.6s' }}>
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