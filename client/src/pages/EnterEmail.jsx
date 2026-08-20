import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CircuitBackground from '../components/CircuitBackground';
import './EnterEmail.css';

function EnterEmail({ onEmailSubmit }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Silakan masukkan alamat email yang valid.');
      return;
    }
    
    // Call the parent handler to store the email
    onEmailSubmit(email.trim());
    
    // Proceed to select frame
    navigate('/select-frame');
  };

  return (
    <div className="page enter-email-page">
      <CircuitBackground variant="home" />

      {/* Header */}
      <header className="app-header">
        <div>
          <div className="logo-text">COMIT BOOTH</div>
          <div className="org-text">Community of Information Technology</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>
          ← Home
        </button>
      </header>

      <main className="page-content">
        <div className="email-card anim-float-up card">
          <div className="email-header">
            <h2 className="text-glow">MASUKKAN EMAIL</h2>
            <p className="text-dim">Hasil foto akan otomatis dikirim ke alamat email Anda.</p>
          </div>

          <form onSubmit={handleSubmit} className="email-form">
            <div className="input-group">
              <input 
                type="email" 
                className={`email-input ${error ? 'input-error' : ''}`}
                placeholder="emailanda@gmail.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                autoFocus
              />
              {error && <span className="error-text">{error}</span>}
            </div>

            <button type="submit" className="btn btn-primary btn-lg email-btn">
              LANJUTKAN →
            </button>
          </form>
        </div>
      </main>

      <footer className="page-footer">
        <p className="page-footer__text">Powered by COMIT © 2026</p>
      </footer>
    </div>
  );
}

export default EnterEmail;
