import React, { useEffect, useRef } from 'react';
import './Camera.css';

/**
 * Camera — Live webcam video preview component.
 *
 * Props:
 *  - videoRef:    Ref forwarded from parent (for capture)
 *  - mirrored:    Boolean (default true = selfie mode)
 *  - isActive:    Boolean — shows active indicator
 *  - photoIndex:  Current photo being taken (e.g., 1)
 *  - photoTotal:  Total photos (e.g., 4)
 */
function Camera({ videoRef, mirrored = true, isActive = false, photoIndex, photoTotal }) {
  return (
    <div className={`camera-wrapper ${isActive ? 'camera-wrapper--active' : ''}`}>
      {/* Corner decorators */}
      <div className="camera-corner camera-corner--tl" />
      <div className="camera-corner camera-corner--tr" />
      <div className="camera-corner camera-corner--bl" />
      <div className="camera-corner camera-corner--br" />

      {/* Video element */}
      <video
        ref={videoRef}
        className={`camera-video ${mirrored ? 'camera-video--mirrored' : ''}`}
        autoPlay
        playsInline
        muted
        id="camera-live-feed"
      />

      {/* Status indicator */}
      {isActive && (
        <div className="camera-status">
          <span className="camera-status__dot" />
          <span className="camera-status__text">LIVE</span>
        </div>
      )}

      {/* Photo counter (if provided) */}
      {photoIndex !== undefined && photoTotal !== undefined && (
        <div className="camera-counter">
          <span className="camera-counter__label">FOTO</span>
          <span className="camera-counter__num">{photoIndex}</span>
          <span className="camera-counter__sep">/</span>
          <span className="camera-counter__total">{photoTotal}</span>
        </div>
      )}

      {/* Scan-line overlay effect */}
      <div className="camera-scanline" aria-hidden="true" />
    </div>
  );
}

export default Camera;
