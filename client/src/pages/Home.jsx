import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CircuitBackground from '../components/CircuitBackground';
import mascotImg from '../assets/mascot.jpg';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const fullTagline = '"Capture Your Moment. Create Your Future."';
  const [typedTagline, setTypedTagline] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 100);
    
    let i = 0;
    const typing = setInterval(() => {
      setTypedTagline(fullTagline.substring(0, i));
      i++;
      if (i > fullTagline.length) clearInterval(typing);
    }, 50);

    return () => {
      clearTimeout(t);
      clearInterval(typing);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  return (
    <div className="page home-page">
      <CircuitBackground variant="default" />

      {/* Header */}
      <header className="app-header">
        <div>
          <div className="logo-text">COMIT BOOTH</div>
          <div className="org-text">Community of Information Technology</div>
        </div>
        <div className="header-right">
          <div className="badge">
            <span className="neon-dot" style={{ width: 6, height: 6 }} />
            KABINET AVANTERA
          </div>
          <button
            id="btn-admin-link"
            className="admin-link-btn"
            onClick={() => navigate('/admin')}
            title="Admin Dashboard"
            aria-label="Admin Dashboard"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
          </button>
          <button
            className="admin-link-btn"
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
            aria-label="Toggle Fullscreen"
            style={{ marginLeft: 8 }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="page-content home-content">
        {/* Mascot */}
        <div className={`anim-float-up ${ready ? '' : 'opacity-0'}`} style={{ animationDelay: '0.2s', marginBottom: '20px' }}>
          <img 
            src={mascotImg} 
            alt="COMIT Mascot" 
            style={{ 
              width: '240px', 
              height: '240px', 
              objectFit: 'cover', 
              borderRadius: '50%',
              boxShadow: 'var(--glow-card)',
              border: '4px solid var(--white)'
            }} 
          />
        </div>

        {/* Title */}
        <div className={`home-title-wrap anim-float-up ${ready ? '' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
          <h1 className="home-title">
            <span className="home-title__main shimmer-text">COMIT</span>
            <br />
            <span className="home-title__sub">BOOTH</span>
          </h1>
          <div className="home-title__glow-line" />
        </div>

        {/* Tagline */}
        <p className={`home-tagline anim-float-up ${ready ? '' : 'opacity-0'}`} style={{ animationDelay: '0.5s' }}>
          {typedTagline}
          <span className="cursor-blink">|</span>
        </p>

        {/* Description */}
        <p className={`home-desc anim-float-up ${ready ? '' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
          Photobooth interaktif untuk event COMIT dengan 
          beragam pilihan frame futuristik dan pengalaman tanpa batas.
        </p>

        {/* Action Button */}
        <div className={`anim-float-up ${ready ? '' : 'opacity-0'}`} style={{ animationDelay: '0.7s', marginTop: '20px' }}>
          <button
            id="btn-start"
            className="btn btn-primary btn-lg home-start-btn"
            onClick={() => navigate('/enter-email')}
          >
            <span>MULAI FOTO</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
          <p className="home-hint">Tidak perlu login · Foto langsung · Gratis</p>
        </div>

        {/* Features row */}
        <div className={`home-features anim-float-up ${ready ? '' : 'opacity-0'}`} style={{ animationDelay: '0.8s' }}>
          {[
            { icon: '🎨', label: '4 Frame Eksklusif' },
            { icon: '📸', label: '1–4 Foto' },
            { icon: '⚡', label: 'Instan & Cepat' },
            { icon: '💾', label: 'Download JPG' },
          ].map((f, i) => (
            <div key={i} className="home-feature-item">
              <span className="home-feature-icon">{f.icon}</span>
              <span className="home-feature-label">{f.label}</span>
            </div>
          ))}
        </div>
      </main>

      {/* Footer strip */}
      <footer className="home-footer">
        <div className="divider divider-glow" />
        <div className="home-footer__inner">
          <div className="home-footer__dots">
            <div className="neon-dot" />
            <div className="home-footer__line" />
            <div className="neon-dot" style={{ background: '#7C5CFF', boxShadow: '0 0 8px #7C5CFF' }} />
          </div>
          <p className="home-footer__text">KABINET AVANTERA</p>
          <p className="home-footer__sub">Future in Motion</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
