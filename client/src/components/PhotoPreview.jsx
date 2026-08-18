import React from 'react';
import './PhotoPreview.css';

/**
 * PhotoPreview — Grid showing all captured photos with per-photo retake option.
 *
 * Props:
 *  - photos:         string[]  (dataURLs)
 *  - photoCount:     number    (total expected photos)
 *  - onRetake:       (index) => void
 *  - onContinue:     () => void
 *  - onRetakeAll:    () => void
 */
function PhotoPreview({ photos, photoCount, onRetake, onContinue, onRetakeAll }) {
  const gridClass = photoCount <= 2 ? 'photo-grid--row' : 'photo-grid--2x2';

  return (
    <div className="photo-preview">
      {/* Header */}
      <div className="photo-preview__header">
        <div className="badge">
          <span className="neon-dot" />
          Preview Foto
        </div>
        <h2 className="photo-preview__title">YOUR MOMENTS</h2>
        <p className="photo-preview__subtitle">
          Periksa foto Anda sebelum melanjutkan
        </p>
      </div>

      {/* Photo grid */}
      <div className={`photo-grid ${gridClass}`}>
        {Array.from({ length: photoCount }, (_, i) => (
          <div key={i} className="photo-grid__item">
            {photos[i] ? (
              <>
                <img
                  src={photos[i]}
                  alt={`Foto ${i + 1}`}
                  className="photo-grid__img"
                />
                {/* Retake button */}
                <button
                  className="photo-retake-btn"
                  onClick={() => onRetake(i)}
                  aria-label={`Ambil ulang foto ${i + 1}`}
                  id={`retake-photo-${i}`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M1 4v6h6M23 20v-6h-6"/>
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                  </svg>
                  Ulang
                </button>
                {/* Photo number badge */}
                <div className="photo-num-badge">{i + 1}</div>
              </>
            ) : (
              <div className="photo-grid__empty">
                <div className="photo-empty-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </div>
                <p>Foto {i + 1}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="photo-preview__actions">
        <button
          className="btn btn-ghost"
          onClick={onRetakeAll}
          id="btn-retake-all"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 4v6h6M23 20v-6h-6"/>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
          </svg>
          Foto Ulang Semua
        </button>

        <button
          className="btn btn-primary btn-lg"
          onClick={onContinue}
          disabled={photos.length < photoCount}
          id="btn-continue-compose"
        >
          Buat Komposisi
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default PhotoPreview;
