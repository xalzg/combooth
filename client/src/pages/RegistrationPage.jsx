import React, { useState } from 'react';
import CircuitBackground from '../components/CircuitBackground';
import { registerSession } from '../services/session';
import './EnterEmail.css'; // Reuse existing styles

function RegistrationPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.toLowerCase().endsWith('@gmail.com')) {
      setError('Hanya alamat @gmail.com yang diizinkan.');
      return;
    }
    
    try {
      setError('');
      const data = await registerSession(email.trim());
      setToken(data.token);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page enter-email-page">
      <CircuitBackground variant="home" />

      <header className="app-header">
        <div>
          <div className="logo-text">COMIT BOOTH</div>
          <div className="org-text">Community of Information Technology</div>
        </div>
      </header>

      <main className="page-content">
        <div className="email-card anim-float-up card">
          {!token ? (
            <>
              <div className="email-header">
                <h2 className="text-glow">REGISTRASI EMAIL</h2>
                <p className="text-dim">Masukkan Gmail kamu untuk menerima hasil foto.</p>
              </div>

              <form onSubmit={handleSubmit} className="email-form">
                <div className="input-group">
                  <input 
                    type="email" 
                    className={`email-input ${error ? 'input-error' : ''}`}
                    placeholder="nama@gmail.com"
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
            </>
          ) : (
            <div className="email-header" style={{ textAlign: 'center' }}>
              <h2 className="text-glow">REGISTRASI BERHASIL</h2>
              <p className="text-dim">Gunakan kode berikut saat berada di COMIT Booth.</p>
              
              <div style={{ margin: '30px 0', padding: '20px', background: 'rgba(0,217,255,0.1)', border: '2px dashed #00D9FF', borderRadius: '12px', fontSize: '3rem', fontWeight: 'bold', letterSpacing: '8px', color: '#00D9FF' }}>
                {token}
              </div>
              
              <p className="text-dim" style={{ fontSize: '0.9rem' }}>Kode ini hanya dapat digunakan satu kali.</p>
            </div>
          )}
        </div>
      </main>

      <footer className="page-footer">
        <p className="page-footer__text">Powered by COMIT © 2026</p>
      </footer>
    </div>
  );
}

export default RegistrationPage;
