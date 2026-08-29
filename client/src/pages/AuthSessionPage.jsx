import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import CircuitBackground from '../components/CircuitBackground';
import { validateSession } from '../services/session';
import './EnterEmail.css';

function AuthSessionPage({ onAuthSuccess }) {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const qrCanvasRef = useRef(null);

  useEffect(() => {
    fetch('/api/network-info')
      .then(res => res.json())
      .then(data => {
        let baseUrl = window.location.origin;
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
           baseUrl = `http://${data.ip}:${window.location.port || 5173}`;
        }
        const registerUrl = baseUrl + '/register';
        
        if (qrCanvasRef.current) {
          QRCode.toCanvas(qrCanvasRef.current, registerUrl, {
            width: 180,
            margin: 2,
            color: { dark: '#00D9FF', light: '#071426' }
          }).catch(console.error);
        }
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token.trim()) {
      setError('Silakan masukkan kode.');
      return;
    }
    
    setIsLoading(true);
    try {
      setError('');
      const data = await validateSession(token.trim());
      onAuthSuccess(data.email, data.token);
      navigate('/select-frame');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
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
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>
          ← Home
        </button>
      </header>

      <main className="page-content" style={{ flexDirection: 'row', gap: '40px', maxWidth: '1000px', flexWrap: 'wrap', justifyContent: 'center' }}>
        
        {/* QR Code Section for Registration Shortcut */}
        <div className="email-card anim-float-up card" style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div className="email-header" style={{ marginBottom: '15px' }}>
            <h2 className="text-glow">SIAP FOTO?</h2>
            <p className="text-dim" style={{ fontSize: '0.9rem', marginBottom: '10px' }}>
              Scan QR menggunakan kamera HP kamu<br/>untuk mengisi Gmail sebelum foto.
            </p>
          </div>
          
          <div style={{ padding: '10px', background: 'rgba(0, 217, 255, 0.1)', borderRadius: '12px', border: '2px dashed #00D9FF', marginBottom: '15px' }}>
            <canvas ref={qrCanvasRef} style={{ borderRadius: '8px' }}></canvas>
          </div>
          
          <div style={{ textAlign: 'left', fontSize: '0.85rem', color: '#8b9bb4', width: '100%' }}>
            <ol style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>Scan QR dengan HP kamu</li>
              <li>Masukkan Gmail</li>
              <li>Dapatkan Kode unik</li>
              <li>Masukkan Kode di sebelah kanan</li>
            </ol>
          </div>
        </div>

        {/* Input Code Section */}
        <div className="email-card anim-float-up card" style={{ flex: '1', minWidth: '300px' }}>
          <div className="email-header">
            <h2 className="text-glow">MASUKKAN KODE</h2>
            <p className="text-dim">Masukkan kode dari HP kamu untuk mulai sesi foto.</p>
          </div>

          <form onSubmit={handleSubmit} className="email-form">
            <div className="input-group">
              <input 
                type="text" 
                className={`email-input ${error ? 'input-error' : ''}`}
                placeholder="Misal: A1B2C3"
                value={token}
                onChange={(e) => {
                  setToken(e.target.value.toUpperCase());
                  setError('');
                }}
                style={{ textAlign: 'center', letterSpacing: '4px', textTransform: 'uppercase' }}
                autoFocus
              />
              {error && <span className="error-text">{error}</span>}
            </div>

            <button type="submit" className="btn btn-primary btn-lg email-btn" disabled={isLoading}>
              {isLoading ? 'MEMERIKSA...' : 'MULAI →'}
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

export default AuthSessionPage;
