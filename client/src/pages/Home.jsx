import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CircuitBackground from '../components/CircuitBackground';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(t);
  }, []);

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
        </div>
      </header>

      {/* Main content */}
      <main className="page-content home-content">
        {/* Top badge */}
        <div className={`home-badge anim-float-up ${ready ? '' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
          <span className="neon-dot" />
          Universitas Insan Pembangunan Indonesia
        </div>

        {/* Title */}
        <div className={`home-title-wrap anim-float-up ${ready ? '' : 'opacity-0'}`} style={{ animationDelay: '0.25s' }}>
          <h1 className="home-title">
            <span className="home-title__main shimmer-text">COMIT</span>
            <br />
            <span className="home-title__sub">BOOTH</span>
          </h1>
          <div className="home-title__glow-line" />
        </div>

        {/* Tagline */}
        <p className={`home-tagline anim-float-up ${ready ? '' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
          "Capture Your Moment. Create Your Future."
        </p>

        {/* Description */}
        <p className={`home-desc anim-float-up ${ready ? '' : 'opacity-0'}`} style={{ animationDelay: '0.5s' }}>
          Digital photobooth resmi COMIT — pilih frame, ambil foto, dan simpan kenangan Anda.
        </p>

        {/* CTA Button */}
        <div className={`home-cta anim-float-up ${ready ? '' : 'opacity-0'}`} style={{ animationDelay: '0.65s' }}>
          <button
            id="btn-start"
            className="btn btn-primary btn-lg home-start-btn"
            onClick={() => navigate('/select-frame')}
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
