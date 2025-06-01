import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import './ResetPassword.css';

const ResetPassword = () => {
  const [passwords, setPasswords] = useState({
    password: '',
    confirmPassword: ''
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  // Mendapatkan token dari URL path parameter menggunakan useParams
  // Format URL: /reset-password/:token
  const { token } = useParams();

  useEffect(() => {
    setIsLoaded(true);
    
    // Validasi token
    if (!token) {
      setError('Token reset password tidak valid atau telah kedaluwarsa.');
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi password
    if (passwords.password !== passwords.confirmPassword) {
      setError('Kata sandi dan konfirmasi kata sandi tidak cocok.');
      return;
    }
    
    if (passwords.password.length < 6) {
      setError('Kata sandi harus minimal 6 karakter.');
      return;
    }
    
    setError(null);
    setIsLoading(true);
    
    // Animasi tombol saat submit
    const button = e.target.querySelector('.reset-button');
    button.classList.add('button-loading');
    
    try {
      const response = await fetch('http://localhost:3001/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          password: passwords.password,
          confirmPassword: passwords.confirmPassword
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(true);
        setPasswords({ password: '', confirmPassword: '' });
        
        // Redirect ke halaman login setelah 3 detik
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        setError(data.message || 'Gagal mereset kata sandi. Silakan coba lagi.');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi nanti.');
      console.error('Reset password error:', err);
    } finally {
      setIsLoading(false);
      button.classList.remove('button-loading');
    }
  };

  return (
    <div className={`reset-password-container ${isLoaded ? 'fade-in' : ''}`}>
      <div className="reset-password-card">
        <div className="top-logo">
          
        </div>
        
        <div className="reset-password-content">
          <div className="reset-password-header">
            <div className="logo-placeholder">
              <div className="logo-tasur">
                <img src="/logo_tasur.png" alt="Tasur Inventory" className="main-logo" />
              </div>
            </div>
            <h2 className="slide-in-down">Reset Kata Sandi</h2>
            <p className="subtitle slide-in-down" style={{ animationDelay: '0.1s' }}>
              Masukkan kata sandi baru Anda
            </p>
          </div>
          
          {error && (
            <div className="error-message slide-in-down" style={{ marginBottom: '1rem', color: '#e53e3e', textAlign: 'center' }}>
              {error}
            </div>
          )}
          
          {success && (
            <div className="success-message slide-in-down" style={{ marginBottom: '1rem' }}>
              Kata sandi berhasil direset. Anda akan dialihkan ke halaman login dalam beberapa detik.
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="reset-password-form">
            <div className="input-group slide-in-down" style={{ animationDelay: '0.3s', textAlign:'left' }}>
              <label htmlFor="password">Kata Sandi Baru</label>
              <input
                type="password"
                id="password"
                name="password"
                value={passwords.password}
                onChange={handleChange}
                placeholder="Masukkan kata sandi baru"
                required
                className="input-animated"
                disabled={!token || success}
              />
            </div>
            
            <div className="input-group slide-in-down" style={{ animationDelay: '0.35s', textAlign:'left' }}>
              <label htmlFor="confirmPassword">Konfirmasi Kata Sandi</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwords.confirmPassword}
                onChange={handleChange}
                placeholder="Konfirmasi kata sandi baru"
                required
                className="input-animated"
                disabled={!token || success}
              />
            </div>
            
            <button 
              type="submit" 
              className="reset-button slide-in-down" 
              style={{ animationDelay: '0.4s' }} 
              disabled={isLoading || !token || success}
            >
              <span className="button-text">Simpan Kata Sandi Baru</span>
              <span className="button-loader"></span>
            </button>
            
            <div className="login-link slide-in-down" style={{ animationDelay: '0.5s' }}>
              <p>Ingat kata sandi Anda? <Link to="/">Masuk</Link></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;