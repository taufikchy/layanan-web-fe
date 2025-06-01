import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    // Animasi tombol saat submit
    const button = e.target.querySelector('.reset-button');
    button.classList.add('button-loading');
    
    try {
      // Ganti URL dengan endpoint API reset password yang sebenarnya
      const response = await fetch('http://localhost:3001/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(true);
        setEmail('');
      } else {
        setError(data.message || 'Permintaan reset kata sandi gagal. Silakan coba lagi.');
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
    <div className={`forgot-password-container ${isLoaded ? 'fade-in' : ''}`}>
      <div className="forgot-password-card">
        <div className="top-logo">
          
        </div>
        
        <div className="forgot-password-content">
          <div className="forgot-password-header">
            <div className="logo-placeholder">
              <div className="logo-tasur">
                <img src="/logo_tasur.png" alt="Tasur Inventory" className="main-logo" />
              </div>
            </div>
            <h2 className="slide-in-down">Lupa Kata Sandi</h2>
            <p className="subtitle slide-in-down" style={{ animationDelay: '0.1s' }}>
              Masukkan email Anda untuk mereset kata sandi
            </p>
          </div>
          
          {error && (
            <div className="error-message slide-in-down" style={{ marginBottom: '1rem', color: '#e53e3e', textAlign: 'center' }}>
              {error}
            </div>
          )}
          
          {success && (
            <div className="success-message slide-in-down" style={{ marginBottom: '1rem' }}>
              Permintaan reset kata sandi berhasil dikirim. Silakan periksa email Anda untuk tautan reset password.
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="forgot-password-form">
            <div className="input-group slide-in-down" style={{ animationDelay: '0.3s', textAlign:'left' }}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleChange}
                placeholder="Masukkan email Anda"
                required
                className="input-animated"
              />
            </div>
            
            <button type="submit" className="reset-button slide-in-down" style={{ animationDelay: '0.4s' }} disabled={isLoading}>
              <span className="button-text">Reset Kata Sandi</span>
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

export default ForgotPassword;