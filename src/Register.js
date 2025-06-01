import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    nama_user: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    // Validasi password match saat password atau confirmPassword berubah
    if (formData.confirmPassword) {
      setPasswordMatch(formData.password === formData.confirmPassword);
    }
  }, [formData.password, formData.confirmPassword]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi password match
    if (formData.password !== formData.confirmPassword) {
      setError('Kata sandi dan konfirmasi kata sandi tidak cocok');
      return;
    }
    
    setError(null);
    setIsLoading(true);
    
    // Animasi tombol saat submit
    const button = e.target.querySelector('.register-button');
    button.classList.add('button-loading');
    
    try {
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username,
          nama_user: formData.nama_user,
          password: formData.password
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Tampilkan pesan sukses
        setRegisterSuccess(true);
        
        // Simpan data user ke localStorage jika diperlukan
        localStorage.setItem('user_data', JSON.stringify(data));
        
        // Redirect ke halaman login setelah 2 detik
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        setError(data.message || 'Pendaftaran gagal. Silakan coba lagi.');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi nanti.');
      console.error('Register error:', err);
    } finally {
      setIsLoading(false);
      button.classList.remove('button-loading');
    }
  };

  return (
    <div className={`register-container ${isLoaded ? 'fade-in' : ''}`}>
      <div className="register-card">
        <div className="top-logo">
          
        </div>
        
        <div className="register-content">
          <div className="register-header">
            <div className="logo-placeholder">
              <div className="logo-tasur">
                <img src="/logo_tasur.png" alt="Tasur Inventory" className="main-logo" />
              </div>
            </div>
            <h2 className="slide-in-down">Buat Akun Baru</h2>
            <p className="subtitle slide-in-down" style={{ animationDelay: '0.1s' }}>Daftar untuk mengakses sistem inventory Tasur</p>
          </div>
          
          {error && (
            <div className="error-message slide-in-down" style={{ marginBottom: '1rem', color: '#e53e3e', textAlign: 'center' }}>
              {error}
            </div>
          )}
          
          {registerSuccess && (
            <div className="success-message slide-in-down" style={{ marginBottom: '1rem', color: '#38a169', textAlign: 'center' }}>
              Pendaftaran berhasil! Anda akan dialihkan ke halaman login...
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="register-form">
            <div className="input-group slide-in-down" style={{ animationDelay: '0.3s', textAlign:'left' }}>
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Masukkan username Anda"
                required
                className="input-animated"
              />
            </div>
            
            <div className="input-group slide-in-down" style={{ animationDelay: '0.4s', textAlign:'left' }}>
              <label htmlFor="nama_user">Nama Lengkap</label>
              <input
                type="text"
                id="nama_user"
                name="nama_user"
                value={formData.nama_user}
                onChange={handleChange}
                placeholder="Masukkan nama lengkap Anda"
                required
                className="input-animated"
              />
            </div>
            
            <div className="input-group slide-in-down" style={{ animationDelay: '0.5s', textAlign:'left' }}>
              <label htmlFor="password">Kata Sandi</label>
              <div className="password-input-container">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="input-animated"
                />
              </div>
            </div>
            
            <div className="input-group slide-in-down" style={{ animationDelay: '0.6s', textAlign:'left' }}>
              <label htmlFor="confirmPassword">Konfirmasi Kata Sandi</label>
              <div className="password-input-container">
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className={`input-animated ${!passwordMatch && formData.confirmPassword ? 'input-error' : ''}`}
                />
              </div>
              {!passwordMatch && formData.confirmPassword && (
                <p className="password-mismatch">Kata sandi tidak cocok</p>
              )}
            </div>
            
            <button type="submit" className="register-button slide-in-down" style={{ animationDelay: '0.7s' }} disabled={isLoading || !passwordMatch}>
              <span className="button-text">Daftar</span>
              <span className="button-loader"></span>
            </button>
            
            <div className="login-link slide-in-down" style={{ animationDelay: '0.8s' }}>
              <p>Sudah memiliki akun? <Link to="/">Masuk</Link></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;