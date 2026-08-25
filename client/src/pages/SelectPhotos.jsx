import React from 'react';
import { useNavigate } from 'react-router-dom';
import CircuitBackground from '../components/CircuitBackground';
import './SelectPhotos.css';

const OPTIONS = [
  {
    count:    1,
    label:    '1 FOTO',
    desc:     'Satu foto penuh frame',
    icon:     '□',
    layout:   'Satu foto besar',
    recommended: false,
  },
  {
    count:    2,
    label:    '2 FOTO',
    desc:     'Dua foto berdampingan',
    icon:     '□□',
    layout:   'Horizontal split',
    recommended: false,
  },
  {
    count:    3,
    label:    '3 FOTO',
    desc:     'Satu besar + dua kecil',
    icon:     '□|□□',
    layout:   'Kolom kiri + 2 kanan',
    recommended: false,
  },
  {
    count:    4,
    label:    '4 FOTO',
    desc:     'Komposisi photobooth klasik',
    icon:     '□□|□□',
    layout:   'Grid 2×2',
    recommended: true,
  },
];

function SelectPhotos({ onPhotoCountSelect, photoCount, selectedFrame }) {
  const navigate = useNavigate();

  const handleSelect = (count) => {
    onPhotoCountSelect(count);
  };

  const handleContinue = () => {
    if (photoCount) navigate('/enter-email');
  };

  if (!selectedFrame) {
    navigate('/select-frame');
    return null;
  }

  return (
    <div className="page select-photos-page">
      <CircuitBackground variant="default" />

      {/* Header */}
      <header className="app-header">
        <div>
          <div className="logo-text">COMIT BOOTH</div>
          <div className="org-text">Community of Information Technology</div>
        </div>
        <div className="header-right">
          <span className="frame-badge" style={{ color: selectedFrame.accentColor }}>
            ◆ {selectedFrame.name}
          </span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate('/select-frame')}
            id="btn-back-frame"
          >
            ← Frame
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="page-content select-photos-content">
        {/* Title */}
        <div className="section-header anim-float-up">
          <div className="badge">
            <span className="neon-dot" />
            Langkah 2 dari 3
          </div>
          <h2 className="section-title">HOW MANY MOMENTS?</h2>
          <p className="section-subtitle">
            Pilih berapa foto yang ingin Anda ambil
          </p>
        </div>

        {/* Options */}
        <div className="photo-count-grid anim-float-up delay-2">
          {OPTIONS.map((opt) => (
            <button
              key={opt.count}
              id={`btn-count-${opt.count}`}
              className={`count-card ${photoCount === opt.count ? 'count-card--selected' : ''} ${opt.recommended ? 'count-card--recommended' : ''}`}
              onClick={() => handleSelect(opt.count)}
              aria-pressed={photoCount === opt.count}
              aria-label={`Pilih ${opt.count} foto`}
            >
              {/* Recommended badge */}
              {opt.recommended && (
                <div className="count-card__rec-badge">⭐ RECOMMENDED</div>
              )}

              {/* Layout preview */}
              <div className="count-card__preview">
                <LayoutPreview count={opt.count} selected={photoCount === opt.count} accent={selectedFrame.accentColor} />
              </div>

              {/* Info */}
              <div className="count-card__info">
                <span className="count-card__label">{opt.label}</span>
                <span className="count-card__desc">{opt.desc}</span>
                <span className="count-card__layout">{opt.layout}</span>
              </div>

              {/* Selection glow indicator */}
              {photoCount === opt.count && (
                <div className="count-card__selected-dot" />
              )}
            </button>
          ))}
        </div>

        {/* Continue */}
        <div className="anim-float-up delay-3">
          <button
            id="btn-continue-to-camera"
            className="btn btn-primary btn-lg"
            onClick={handleContinue}
            disabled={!photoCount}
          >
            SIAPKAN KAMERA
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M23 7l-7 5 7 5V7z"/>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
          </button>
        </div>
      </main>

      <footer className="page-footer">
        <div className="divider" />
        <p className="page-footer__text">KABINET AVANTERA — Future in Motion</p>
      </footer>
    </div>
  );
}

/** Mini layout preview grid */
function LayoutPreview({ count, selected, accent }) {
  const color = selected ? accent : 'rgba(0,217,255,0.25)';
  const border = selected ? accent + '90' : 'rgba(0,217,255,0.2)';

  const cellStyle = {
    background: color + '20',
    border: `1px solid ${border}`,
    borderRadius: 4,
    transition: 'all 0.3s',
  };

  if (count === 1) return (
    <div style={{ display: 'grid', width: '100%', height: '60px', padding: 4 }}>
      <div style={cellStyle} />
    </div>
  );

  if (count === 2) return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, width: '100%', height: '60px', padding: 4 }}>
      <div style={cellStyle} /><div style={cellStyle} />
    </div>
  );

  if (count === 3) return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, width: '100%', height: '60px', padding: 4 }}>
      <div style={{ ...cellStyle, gridRow: '1 / 3' }} />
      <div style={cellStyle} /><div style={cellStyle} />
    </div>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 4, width: '100%', height: '60px', padding: 4 }}>
      <div style={cellStyle} /><div style={cellStyle} />
      <div style={cellStyle} /><div style={cellStyle} />
    </div>
  );
}

export default SelectPhotos;
