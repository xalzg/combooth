import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CircuitBackground from '../components/CircuitBackground';
import Camera from '../components/Camera';
import Countdown from '../components/Countdown';
import PhotoPreview from '../components/PhotoPreview';
import { startCamera, stopCamera, captureFrame } from '../services/camera';
import { composePhotos, downloadCanvas, generateFilename } from '../services/composer';
import './CameraPage.css';

const STATES = {
  SETUP:      'SETUP',
  READY:      'READY',
  COUNTDOWN:  'COUNTDOWN',
  CAPTURING:  'CAPTURING',
  REVIEWING:  'REVIEWING',
  PROCESSING: 'PROCESSING',
  DONE:       'DONE',
  ERROR:      'ERROR',
};

function CameraPage({ selectedFrame, photoCount }) {
  const navigate = useNavigate();

  const [uiState,     setUiState]     = useState(STATES.SETUP);
  const [errorMsg,    setErrorMsg]    = useState('');
  const [photos,      setPhotos]      = useState([]);
  const [retakeIdx,   setRetakeIdx]   = useState(null);
  const [currentIdx,  setCurrentIdx]  = useState(0);
  const [progress,    setProgress]    = useState(0);
  const [finalCanvas, setFinalCanvas] = useState(null);
  const [flashActive, setFlashActive] = useState(false);

  const videoRef  = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (!selectedFrame || !photoCount) {
      navigate('/select-frame');
    }
  }, [selectedFrame, photoCount, navigate]);

  // Start camera — runs AFTER component mounts.
  // The <Camera> component is ALWAYS in the DOM (off-screen when not active),
  // so videoRef.current is guaranteed to be populated here.
  useEffect(() => {
    if (!selectedFrame || !photoCount) return;
    let cancelled = false;

    (async () => {
      try {
        // Small delay to ensure video element is mounted
        await new Promise(r => setTimeout(r, 100));

        const stream = await startCamera(videoRef.current);
        streamRef.current = stream;

        if (!cancelled) setUiState(STATES.READY);
      } catch (err) {
        if (cancelled) return;
        if (err.message === 'CAMERA_DENIED')    setErrorMsg('CAMERA_DENIED');
        else if (err.message === 'CAMERA_NOT_FOUND') setErrorMsg('CAMERA_NOT_FOUND');
        else setErrorMsg('CAMERA_ERROR');
        setUiState(STATES.ERROR);
      }
    })();

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [selectedFrame, photoCount]);

  // Fallback: re-attach stream if videoRef changes (e.g. after DOM update)
  useEffect(() => {
    if (streamRef.current && videoRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [uiState]);

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleStartCapture = useCallback(() => {
    setUiState(STATES.COUNTDOWN);
  }, []);

  const handleCountdownComplete = useCallback(() => {
    setUiState(STATES.CAPTURING);
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 350);

    setTimeout(() => {
      try {
        const v = videoRef.current;
        if (!v || !v.videoWidth) throw new Error('no video');

        const dataUrl = captureFrame(v);

        setPhotos(prev => {
          const next = [...prev];
          const idx  = retakeIdx !== null ? retakeIdx : currentIdx;
          next[idx]  = dataUrl;
          return next;
        });

        const idx = retakeIdx !== null ? retakeIdx : currentIdx;

        if (retakeIdx !== null) {
          setRetakeIdx(null);
          setUiState(STATES.REVIEWING);
        } else if (idx + 1 < photoCount) {
          setCurrentIdx(idx + 1);
          setUiState(STATES.READY);
        } else {
          setUiState(STATES.REVIEWING);
        }
      } catch {
        setErrorMsg('CAPTURE_ERROR');
        setUiState(STATES.ERROR);
      }
    }, 200);
  }, [currentIdx, retakeIdx, photoCount]);

  const handleRetake = useCallback((index) => {
    setRetakeIdx(index);
    setCurrentIdx(index);
    setUiState(STATES.READY);
  }, []);

  const handleRetakeAll = useCallback(() => {
    setPhotos([]);
    setCurrentIdx(0);
    setRetakeIdx(null);
    setUiState(STATES.READY);
  }, []);

  const handleContinueToCompose = useCallback(async () => {
    setUiState(STATES.PROCESSING);
    setProgress(0);
    try {
      const canvas = await composePhotos(photos, selectedFrame, photoCount, pct => setProgress(pct));
      setFinalCanvas(canvas);
      setUiState(STATES.DONE);
    } catch (err) {
      console.error(err);
      setErrorMsg('COMPOSE_ERROR');
      setUiState(STATES.ERROR);
    }
  }, [photos, selectedFrame, photoCount]);

  const handleDownloadJPG = useCallback(() => {
    if (finalCanvas) downloadCanvas(finalCanvas, generateFilename('jpg'));
  }, [finalCanvas]);

  const handleFotoLagi = useCallback(() => {
    setPhotos([]);
    setCurrentIdx(0);
    setRetakeIdx(null);
    setFinalCanvas(null);
    setProgress(0);
    setUiState(STATES.READY);
  }, []);

  const handleRetryCamera = useCallback(async () => {
    setUiState(STATES.SETUP);
    setErrorMsg('');
    try {
      await new Promise(r => setTimeout(r, 150));
      const stream = await startCamera(videoRef.current);
      streamRef.current = stream;
      setUiState(STATES.READY);
    } catch (err) {
      setErrorMsg(err.message);
      setUiState(STATES.ERROR);
    }
  }, []);

  if (!selectedFrame || !photoCount) return null;

  const isPhotoTaking = uiState === STATES.READY || uiState === STATES.COUNTDOWN || uiState === STATES.CAPTURING;
  const displayIdx    = retakeIdx !== null ? retakeIdx : currentIdx;

  return (
    <div className="page camera-page">
      <CircuitBackground variant="camera" />

      {/* Header */}
      <header className="app-header">
        <div>
          <div className="logo-text">COMIT BOOTH</div>
          <div className="org-text">Community of Information Technology</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {selectedFrame && (
            <span style={{ fontFamily: 'Orbitron', fontSize: '0.65rem', color: selectedFrame.accentColor, fontWeight: 700 }}>
              ◆ {selectedFrame.name}
            </span>
          )}
          <button className="btn btn-ghost btn-sm" onClick={() => { stopCamera(); navigate('/select-photos'); }} id="btn-back-photos">
            ← Kembali
          </button>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────────────
          CAMERA SECTION — ALWAYS IN DOM (off-screen when not in photo states)
          This is CRITICAL: keeps videoRef.current populated so startCamera
          can attach the MediaStream to the video element.
          ───────────────────────────────────────────────────────────────────── */}
      <div className={`camera-always-wrapper ${isPhotoTaking ? 'camera-always-wrapper--visible' : 'camera-always-wrapper--hidden'}`}>
        <div className="camera-viewport">
          <Camera
            videoRef={videoRef}
            mirrored={true}
            isActive={uiState === STATES.READY}
            photoIndex={displayIdx + 1}
            photoTotal={photoCount}
          />
          {uiState === STATES.COUNTDOWN && (
            <Countdown onComplete={handleCountdownComplete} duration={1} />
          )}
          {flashActive && <div className="camera-flash" aria-hidden="true" />}
        </div>
      </div>

      {/* ── SETUP ── */}
      {uiState === STATES.SETUP && (
        <main className="page-content">
          <div className="camera-loading anim-scale-in">
            <div className="spinner" style={{ width: 56, height: 56, borderWidth: 4 }} />
            <h3 style={{ fontFamily: 'Orbitron', color: '#00D9FF', letterSpacing: '0.1em', margin: 0 }}>
              MEMUAT KAMERA...
            </h3>
            <p style={{ color: '#8899AA', fontSize: '0.85rem', margin: 0 }}>
              Izinkan akses kamera ketika diminta oleh browser.
            </p>
          </div>
        </main>
      )}

      {/* ── ERROR ── */}
      {uiState === STATES.ERROR && (
        <main className="page-content">
          <div className="camera-error anim-scale-in card" style={{ padding: '48px 40px', maxWidth: 500, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center' }}>
            <div style={{ fontSize: '3rem' }}>
              {errorMsg === 'CAMERA_DENIED'    ? '🔒' :
               errorMsg === 'CAMERA_NOT_FOUND' ? '📷' : '⚠️'}
            </div>
            <h3 style={{ fontFamily: 'Orbitron', fontSize: '1.1rem', margin: 0, letterSpacing: '0.08em' }}>
              {errorMsg === 'CAMERA_DENIED'    ? 'CAMERA ACCESS REQUIRED' :
               errorMsg === 'CAMERA_NOT_FOUND' ? 'CAMERA NOT FOUND' :
               errorMsg === 'CAPTURE_ERROR'    ? 'CAPTURE FAILED' :
               errorMsg === 'COMPOSE_ERROR'    ? 'PROCESSING ERROR' : 'OOPS!'}
            </h3>
            <p style={{ color: '#8899AA', fontSize: '0.88rem', lineHeight: 1.6, margin: 0, maxWidth: 360 }}>
              {errorMsg === 'CAMERA_DENIED'
                ? 'Silakan izinkan akses kamera melalui ikon gembok di address bar browser, kemudian klik Coba Lagi.'
                : errorMsg === 'CAMERA_NOT_FOUND'
                ? 'Pastikan webcam terhubung dan terdeteksi oleh sistem.'
                : errorMsg === 'CAPTURE_ERROR'
                ? 'Foto gagal diambil. Pastikan kamera aktif, lalu klik Coba Lagi.'
                : errorMsg === 'COMPOSE_ERROR'
                ? 'Foto gagal diproses. Silakan coba ulang.'
                : 'Terjadi kesalahan. Silakan coba lagi.'}
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={handleRetryCamera} id="btn-retry-camera">
                🔄 Coba Lagi
              </button>
              <button className="btn btn-ghost" onClick={() => { stopCamera(); navigate('/'); }} id="btn-home-from-error">
                Kembali ke Home
              </button>
            </div>
          </div>
        </main>
      )}

      {/* ── READY / COUNTDOWN / CAPTURING ── */}
      {isPhotoTaking && (
        <main className="camera-main page-content">
          {/* Info row */}
          <div className="camera-info anim-float-up">
            <div className="badge">
              <span className="neon-dot" />
              {retakeIdx !== null
                ? `Mengulang Foto ${retakeIdx + 1}`
                : `Foto ${displayIdx + 1} dari ${photoCount}`}
            </div>
            <h3 style={{ fontFamily: 'Orbitron', color: '#fff', fontSize: '1rem', margin: 0, letterSpacing: '0.05em' }}>
              {uiState === STATES.READY && retakeIdx !== null ? 'SIAP MENGULANG FOTO?' :
               uiState === STATES.READY ? 'BERSIAPLAH!' : 'GET READY!'}
            </h3>
          </div>

          {/* Controls */}
          <div className="camera-controls anim-float-up delay-2">
            {uiState === STATES.READY && (
              <button id="btn-capture-start" className="btn btn-primary btn-lg capture-btn" onClick={handleStartCapture}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/>
                </svg>
                {retakeIdx !== null ? 'ULANG FOTO' : 'MULAI'}
              </button>
            )}
            {uiState === STATES.COUNTDOWN && (
              <p className="countdown-hint">Bersiaplah dan lihat ke kamera...</p>
            )}
          </div>

          {/* Thumbnails of already-captured photos */}
          {photos.length > 0 && retakeIdx === null && (
            <div className="captured-strip">
              {photos.map((p, i) => (
                <div key={i} className="captured-thumb">
                  <img src={p} alt={`Foto ${i + 1}`} />
                  <span>{i + 1}</span>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* ── REVIEWING ── */}
      {uiState === STATES.REVIEWING && (
        <main className="page-content reviewing-main">
          <PhotoPreview
            photos={photos}
            photoCount={photoCount}
            onRetake={handleRetake}
            onContinue={handleContinueToCompose}
            onRetakeAll={handleRetakeAll}
          />
        </main>
      )}

      {/* ── PROCESSING ── */}
      {uiState === STATES.PROCESSING && (
        <main className="page-content">
          <div className="processing-screen anim-scale-in">
            <div className="processing-icon">
              <div className="processing-spinner" />
              <span>✦</span>
            </div>
            <h2 style={{ fontFamily: 'Orbitron', color: '#00D9FF', textAlign: 'center', margin: 0, fontSize: '1.3rem' }}>
              CREATING YOUR MOMENT...
            </h2>
            <p style={{ color: '#8899AA', textAlign: 'center', fontSize: '0.85rem', margin: 0 }}>
              Menggabungkan foto dan frame Anda...
            </p>
            <div style={{ width: '100%', maxWidth: 420 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontFamily: 'Orbitron', fontSize: '0.62rem', color: '#8899AA', letterSpacing: '0.1em' }}>PROCESSING</span>
                <span style={{ fontFamily: 'Orbitron', fontSize: '0.62rem', color: '#00D9FF' }}>{Math.round(progress)}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ── DONE ── */}
      {uiState === STATES.DONE && finalCanvas && (
        <main className="page-content result-main">
          <div className="result-screen anim-float-up">
            <div className="result-header">
              <div className="badge">
                <span className="neon-dot" style={{ background: '#00FFB3', boxShadow: '0 0 8px #00FFB3' }} />
                Selesai!
              </div>
              <h2 style={{ fontFamily: 'Orbitron', fontWeight: 800, fontSize: 'clamp(1.2rem, 3vw, 2rem)', margin: 0, letterSpacing: '0.08em' }}>
                YOUR MOMENT IS READY
              </h2>
              <p style={{ color: '#8899AA', margin: 0, fontSize: '0.85rem' }}>
                Foto berhasil dikomposisikan dengan frame {selectedFrame.name}.
              </p>
            </div>

            <div className="result-image-wrap anim-scale-in">
              <img
                src={finalCanvas.toDataURL('image/jpeg', 0.95)}
                alt="COMIT Booth hasil akhir"
                className="result-image"
              />
            </div>

            <div className="result-actions">
              <button id="btn-download-jpg" className="btn btn-primary btn-lg" onClick={handleDownloadJPG}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                DOWNLOAD JPG
              </button>
              <button id="btn-foto-lagi" className="btn btn-outline" onClick={handleFotoLagi}>
                📸 Foto Lagi
              </button>
              <button id="btn-back-home-result" className="btn btn-ghost" onClick={() => { stopCamera(); navigate('/'); }}>
                🏠 Home
              </button>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

export default CameraPage;
