import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FRAMES } from '../frames/frameConfig';
import './SelectFrame.css';

function SelectFrame({ onFrameSelect }) {
  const navigate = useNavigate();
  const carouselRef = useRef(null);

  const handleSelect = (frame) => {
    onFrameSelect(frame);
    setTimeout(() => {
      navigate('/enter-email');
    }, 400);
  };

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  return (
    <div className="layout-selection-page">
      {/* Top Left Label */}
      <div className="layout-label">
        Choose your<br/>layout
      </div>

      {/* Main Carousel Area */}
      <div className="carousel-container">
        <button className="carousel-nav-btn left" onClick={scrollLeft}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <div className="carousel-track" ref={carouselRef}>
          {FRAMES.map((frame, idx) => (
            <div 
              key={frame.id} 
              className="carousel-item anim-scale-in"
              style={{ animationDelay: `${idx * 0.1}s` }}
              onClick={() => handleSelect(frame)}
            >
              <div 
                className="carousel-frame-wrap" 
                style={{ aspectRatio: `${frame.canvas.width} / ${frame.canvas.height}` }}
              >
                {frame.image ? (
                  <>
                    <img 
                      src={frame.image} 
                      alt={frame.name} 
                      className="carousel-frame-img" 
                      onError={(e) => { 
                        e.target.style.display = 'none'; 
                        e.target.nextSibling.style.display = 'flex'; 
                      }} 
                    />
                    <div className="carousel-frame-placeholder" style={{ display: 'none', borderColor: frame.accentColor }}>
                      <span style={{ color: frame.accentColor }}>{frame.name}</span>
                    </div>
                  </>
                ) : (
                  <div className="carousel-frame-placeholder" style={{ borderColor: frame.accentColor }}>
                    <span style={{ color: frame.accentColor }}>{frame.name}</span>
                  </div>
                )}
                
                {/* Hover overlay with cursor icon hint */}
                <div className="carousel-hover-overlay">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="M13 13l6 6"/>
                  </svg>
                </div>
              </div>
              <div className="carousel-item-title">{frame.name}</div>
            </div>
          ))}
        </div>

        <button className="carousel-nav-btn right" onClick={scrollRight}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      {/* Footer Controls */}
      <div className="layout-footer">
        <button className="layout-back-btn" onClick={() => navigate('/')}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
        </button>
        <div className="layout-footer-text">
          CO-Photobooth
        </div>
        <div style={{ width: '48px' }} /> {/* Spacer for centering */}
      </div>
    </div>
  );
}

export default SelectFrame;
