import React from 'react';
import './FrameCard.css';

/**
 * FrameCard — Selectable frame thumbnail with visual preview.
 * Each frame has a distinct CSS-based visual design in the preview area.
 */
function FrameCard({ frame, selected, onClick }) {
  return (
    <button
      className={`frame-card ${selected ? 'frame-card--selected' : ''}`}
      onClick={onClick}
      id={`frame-card-${frame.id}`}
      aria-pressed={selected}
      aria-label={`Pilih frame ${frame.name}`}
      data-frame-id={frame.id}
    >
      {/* Checkmark badge */}
      {selected && (
        <div className="frame-card__check" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8l3.5 3.5L13 5" stroke="#071426" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}

      {/* Preview area */}
      <div className="frame-card__preview" style={{ background: frame.previewBg }}>

        {/* Frame-specific decoration */}
        <div className={`frame-card__deco frame-card__deco--${frame.id}`}>
          {/* Arch portal SVG */}
          <svg
            className="frame-card__arch-svg"
            viewBox="0 0 200 130"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Outer glow arch */}
            <ellipse cx="100" cy="68" rx="66" ry="52"
              stroke={frame.overlayColor} strokeWidth="1" strokeOpacity="0.3"
              fill="none"
            />
            {/* Main arch */}
            <ellipse cx="100" cy="68" rx="60" ry="46"
              stroke={frame.accentColor} strokeWidth="1.5" strokeOpacity="0.9"
              fill={frame.accentColor + '08'}
            />
            {/* Inner arch */}
            <ellipse cx="100" cy="68" rx="54" ry="40"
              stroke={frame.accentColor} strokeWidth="0.8" strokeOpacity="0.4"
              fill="none"
            />

            {/* Top glow arc */}
            <path d={`M 40 68 A 60 46 0 0 1 160 68`}
              stroke={frame.overlayColor} strokeWidth="2" strokeOpacity="0.8"
              fill="none"
            />

            {/* Side circuit lines */}
            <line x1="8" y1="30" x2="30" y2="30" stroke={frame.accentColor} strokeWidth="0.8" strokeOpacity="0.6"/>
            <line x1="30" y1="30" x2="30" y2="55" stroke={frame.accentColor} strokeWidth="0.8" strokeOpacity="0.6"/>
            <circle cx="30" cy="30" r="2" fill={frame.accentColor} opacity="0.8"/>
            <line x1="8" y1="75" x2="25" y2="75" stroke={frame.accentColor} strokeWidth="0.8" strokeOpacity="0.6"/>
            <circle cx="25" cy="75" r="1.5" fill={frame.accentColor} opacity="0.6"/>

            <line x1="192" y1="30" x2="170" y2="30" stroke={frame.accentColor} strokeWidth="0.8" strokeOpacity="0.6"/>
            <line x1="170" y1="30" x2="170" y2="55" stroke={frame.accentColor} strokeWidth="0.8" strokeOpacity="0.6"/>
            <circle cx="170" cy="30" r="2" fill={frame.accentColor} opacity="0.8"/>
            <line x1="192" y1="75" x2="175" y2="75" stroke={frame.accentColor} strokeWidth="0.8" strokeOpacity="0.6"/>
            <circle cx="175" cy="75" r="1.5" fill={frame.accentColor} opacity="0.6"/>

            {/* Floating diamonds */}
            <polygon points="15,55 20,48 25,55 20,62" fill="none"
              stroke={frame.accentColor} strokeWidth="0.8" opacity="0.7"/>
            <polygon points="175,50 180,43 185,50 180,57" fill="none"
              stroke={frame.accentColor} strokeWidth="0.8" opacity="0.7"/>
            <polygon points="13,90 17,85 21,90 17,95" fill="none"
              stroke={frame.overlayColor} strokeWidth="0.7" opacity="0.5"/>

            {/* Bottom neon ring */}
            <ellipse cx="100" cy="122" rx="40" ry="5"
              stroke={frame.accentColor} strokeWidth="1" strokeOpacity="0.5"
              fill="none"
            />
            <ellipse cx="100" cy="122" rx="65" ry="8"
              stroke={frame.accentColor} strokeWidth="0.5" strokeOpacity="0.25"
              fill="none"
            />

            {/* Photo slot grid (mini, inside arch) */}
            <rect x="68" y="46" width="28" height="20" rx="2"
              fill={frame.accentColor + '15'} stroke={frame.accentColor} strokeWidth="0.7" strokeOpacity="0.6"/>
            <rect x="100" y="46" width="28" height="20" rx="2"
              fill={frame.accentColor + '15'} stroke={frame.accentColor} strokeWidth="0.7" strokeOpacity="0.6"/>
            <rect x="68" y="69" width="28" height="20" rx="2"
              fill={frame.accentColor + '15'} stroke={frame.accentColor} strokeWidth="0.7" strokeOpacity="0.6"/>
            <rect x="100" y="69" width="28" height="20" rx="2"
              fill={frame.accentColor + '15'} stroke={frame.accentColor} strokeWidth="0.7" strokeOpacity="0.6"/>
          </svg>
        </div>

        {/* Top label */}
        <div className="frame-card__tag" style={{ color: frame.accentColor }}>
          COMIT BOOTH
        </div>

        {/* Bottom accent bar */}
        <div
          className="frame-card__accent-bar"
          style={{ background: `linear-gradient(90deg, transparent, ${frame.accentColor}CC, ${frame.overlayColor}CC, transparent)` }}
        />
      </div>

      {/* Info */}
      <div className="frame-card__info">
        <h3 className="frame-card__name" style={selected ? { color: frame.accentColor } : {}}>
          {frame.name}
        </h3>
        <p className="frame-card__subtitle" style={{ color: frame.accentColor }}>
          {frame.subtitle}
        </p>
        <p className="frame-card__desc">{frame.description}</p>
      </div>

      {/* Bottom indicator bar */}
      <div
        className="frame-card__indicator"
        style={{ background: selected ? `linear-gradient(90deg, ${frame.accentColor}, ${frame.overlayColor})` : 'transparent' }}
      />
    </button>
  );
}

export default FrameCard;
