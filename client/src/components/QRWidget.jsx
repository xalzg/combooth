import React, { useEffect, useRef, useState } from 'react';
import { renderQRToCanvas, QR_URL, QR_LABEL } from '../services/qr';
import './QRWidget.css';

/**
 * QRWidget — Displays a scannable QR code card in the result screen.
 *
 * Props:
 *  - accentColor:  string  (frame accent color for glow tint)
 */
function QRWidget({ accentColor = '#00D9FF' }) {
  const canvasRef = useRef(null);
  const [ready,   setReady]   = useState(false);
  const [copied,  setCopied]  = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await renderQRToCanvas(canvasRef.current, {
          size:   160,
          dark:   accentColor,
          light:  '#071426',
          margin: 1,
        });
        if (!cancelled) setReady(true);
      } catch (err) {
        console.warn('[QRWidget] render failed:', err);
      }
    })();
    return () => { cancelled = true; };
  }, [accentColor]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(QR_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: open in new tab
      window.open(QR_URL, '_blank', 'noopener');
    }
  };

  return (
    <div className="qr-widget" style={{ '--accent': accentColor }}>
      {/* Header */}
      <div className="qr-widget__header">
        <span className="qr-widget__icon">📸</span>
        <span className="qr-widget__title">SCAN &amp; SHARE</span>
      </div>

      {/* QR canvas */}
      <div className={`qr-widget__canvas-wrap ${ready ? 'qr-widget__canvas-wrap--ready' : ''}`}>
        <canvas
          ref={canvasRef}
          width={160}
          height={160}
          className="qr-widget__canvas"
          aria-label={`QR code menuju ${QR_URL}`}
        />
        {!ready && <div className="qr-widget__loading"><div className="spinner" style={{ width: 28, height: 28, borderWidth: 2 }} /></div>}
      </div>

      {/* Label & copy */}
      <div className="qr-widget__footer">
        <span className="qr-widget__label" style={{ color: accentColor }}>
          {QR_LABEL}
        </span>
        <button
          className="qr-widget__copy-btn"
          onClick={handleCopyLink}
          id="btn-copy-ig-link"
          title="Salin link Instagram"
        >
          {copied
            ? <><span>✓</span> Disalin!</>
            : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Salin Link</>
          }
        </button>
        <p className="qr-widget__hint">Follow kami di Instagram</p>
      </div>
    </div>
  );
}

export default QRWidget;
