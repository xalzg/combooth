import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CircuitBackground from '../components/CircuitBackground';
import FrameCard from '../components/FrameCard';
import { FRAMES } from '../frames/frameConfig';
import './SelectFrame.css';

function SelectFrame({ onFrameSelect, selectedFrame }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);

  const handleSelect = (frame) => {
    onFrameSelect(frame);
  };

  const handleContinue = () => {
    if (selectedFrame) navigate('/select-photos');
  };

  return (
    <div className="page select-frame-page">
      <CircuitBackground variant="default" />

      {/* Header */}
      <header className="app-header">
        <div>
          <div className="logo-text">COMIT BOOTH</div>
          <div className="org-text">Community of Information Technology</div>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate('/')}
          id="btn-back-home"
        >
          ← Kembali
        </button>
      </header>

      {/* Main */}
      <main className="page-content select-frame-content">
        {/* Page title */}
        <div className="section-header anim-float-up">
          <div className="badge">
            <span className="neon-dot" />
            Langkah 1 dari 3
          </div>
          <h2 className="section-title">PILIH FRAME</h2>
          <p className="section-subtitle">
            "Choose your style before capturing your moment."
          </p>
        </div>

        {/* Frame grid */}
        <div className="frame-grid anim-float-up delay-2">
          {FRAMES.map((frame) => (
            <FrameCard
              key={frame.id}
              frame={frame}
              selected={selectedFrame?.id === frame.id}
              onClick={() => handleSelect(frame)}
            />
          ))}
        </div>

        {/* Selected info */}
        {selectedFrame && (
          <div className="selected-info anim-scale-in">
            <span className="neon-dot" />
            <span className="selected-info__text">
              Frame terpilih: <strong style={{ color: selectedFrame.accentColor }}>{selectedFrame.name}</strong>
            </span>
          </div>
        )}

        {/* Continue button */}
        <div className="anim-float-up delay-3">
          <button
            id="btn-continue-to-photos"
            className="btn btn-primary btn-lg"
            onClick={handleContinue}
            disabled={!selectedFrame}
          >
            LANJUTKAN
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="page-footer">
        <div className="divider" />
        <p className="page-footer__text">KABINET AVANTERA — Future in Motion</p>
      </footer>
    </div>
  );
}

export default SelectFrame;
