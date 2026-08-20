import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CircuitBackground from '../components/CircuitBackground';
import Camera from '../components/Camera';
import Countdown from '../components/Countdown';
import PhotoPreview from '../components/PhotoPreview';
import { startCamera, stopCamera, captureFrame } from '../services/camera';
import { composePhotos, downloadCanvas, downloadCanvasPNG, generateFilename, printCanvas } from '../services/composer';
import QRWidget from '../components/QRWidget';
import { trackSession } from '../services/analytics';
import { playShutter, playSuccess } from '../services/sound';
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

function CameraPage({ selectedFrame, photoCount, userEmail }) {
  const navigate = useNavigate();

  const [uiState,     setUiState]     = useState(STATES.SETUP);
  const [errorMsg,    setErrorMsg]    = useState('');
  const [photos,      setPhotos]      = useState([]);
  const [retakeIdx,   setRetakeIdx]   = useState(null);
  const [currentIdx,  setCurrentIdx]  = useState(0);
  const [progress,    setProgress]    = useState(0);
  const [finalCanvas, setFinalCanvas] = useState(null);
  const [flashActive, setFlashActive] = useState(false);
  const [isMirrored,  setIsMirrored]  = useState(true);
  const [emailStatus, setEmailStatus] = useState(''); // '', 'sending', 'sent', 'error'

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
    playShutter();
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
    setEmailStatus('');
    try {
      const canvas = await composePhotos(photos, selectedFrame, photoCount, pct => setProgress(pct));
      setFinalCanvas(canvas);
      
      // Attempt to send email in background
      setEmailStatus('sending');
      fetch('http://localhost:3001/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          imageBase64: canvas.toDataURL('image/jpeg', 0.95),
          frameName: selectedFrame.name
        })
      }).then(res => {
        if (res.ok) setEmailStatus('sent');
        else setEmailStatus('error');
      }).catch(() => setEmailStatus('error'));

      setUiState(STATES.DONE);
      playSuccess();
      trackSession('complete', selectedFrame?.id, photoCount);
    } catch (err) {
      console.error(err);
      setErrorMsg('COMPOSE_ERROR');
      setUiState(STATES.ERROR);
    }
  }, [photos, selectedFrame, photoCount, userEmail]);

  const handleDownloadJPG = useCallback(() => {
    if (finalCanvas) {
      downloadCanvas(finalCanvas, generateFilename('jpg'));
      trackSession('download', selectedFrame?.id, photoCount);
    }
  }, [finalCanvas, selectedFrame, photoCount]);

  const handleDownloadPNG = useCallback(() => {
    if (finalCanvas) {
      downloadCanvasPNG(finalCanvas, generateFilename('png'));
      trackSession('download', selectedFrame?.id, photoCount);
    }
  }, [finalCanvas, selectedFrame, photoCount]);

  const handlePrint = useCallback(() => {
    if (finalCanvas) {
      printCanvas(finalCanvas, selectedFrame);
      trackSession('print', selectedFrame?.id, photoCount);
    }
  }, [finalCanvas, selectedFrame, photoCount]);

  const handleFotoLagi = useCallback(() => {
    setPhotos([]);
    setCurrentIdx(0);
    setRetakeIdx(null);
    setFinalCanvas(null);
    setProgress(0);
    setUiState(STATES.READY);
  }, []);

  const handleShareWA = useCallback(() => {
    const text = encodeURIComponent(`Hi! Lihat foto kerenku dari COMIT Booth dengan frame ${selectedFrame?.name} 📸✨\n\n(Note: Kamu perlu mendownload foto ini terlebih dahulu sebelum membagikannya)`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }, [selectedFrame]);

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
            mirrored={isMirrored}
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
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <button 
                  className="btn btn-ghost btn-sm" 
                  onClick={() => setIsMirrored(!isMirrored)}
                  title="Flip Camera"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 2.1l4 4-4 4"/><path d="M3 12.2v-2a4 4 0 0 1 4-4h13.8M7 21.9l-4-4 4-4"/><path d="M21 11.8v2a4 4 0 0 1-4 4H3.2"/>
                  </svg>
                  {isMirrored ? 'Mirrored' : 'Normal'}
                </button>
                <button id="btn-capture-start" className="btn btn-primary btn-lg capture-btn" onClick={handleStartCapture}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/>
                  </svg>
                  {retakeIdx !== null ? 'ULANG FOTO' : 'MULAI'}
                </button>
              </div>
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
              
              {/* Email Status Indicator */}
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                {emailStatus === 'sending' && <span style={{ color: '#00D9FF' }}>⏳ Mengirim ke {userEmail}...</span>}
                {emailStatus === 'sent' && <span style={{ color: '#10B981' }}>✅ Terkirim ke {userEmail}</span>}
                {emailStatus === 'error' && <span style={{ color: '#EF4444' }}>❌ Gagal mengirim ke {userEmail}</span>}
              </div>
            </div>

            {/* Photo + QR side-by-side layout */}
            <div className="result-body">
              <div className="result-image-wrap anim-scale-in">
                <img
                  src={finalCanvas.toDataURL('image/jpeg', 0.95)}
                  alt="COMIT Booth hasil akhir"
                  className="result-image"
                />
              </div>

              {/* QR Widget */}
              <div className="result-qr anim-float-up delay-3">
                <QRWidget accentColor={selectedFrame?.accentColor || '#00D9FF'} />
              </div>
            </div>

            <div className="result-actions">
              {/* Primary actions */}
              <div className="result-actions-primary">
                <button id="btn-download-jpg" className="btn btn-primary btn-lg" onClick={handleDownloadJPG}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  JPG
                </button>
                <button id="btn-download-png" className="btn btn-primary btn-lg" onClick={handleDownloadPNG}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  PNG
                </button>
                <button id="btn-print-photo" className="btn btn-outline btn-lg" onClick={handlePrint}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6 9 6 2 18 2 18 9"/>
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                    <rect x="6" y="14" width="12" height="8"/>
                  </svg>
                  CETAK FOTO
                </button>
                <button id="btn-share-wa" className="btn btn-outline btn-lg" style={{ borderColor: '#25D366', color: '#25D366' }} onClick={handleShareWA}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                  </svg>
                  SHARE WA
                </button>
              </div>
              {/* Secondary actions */}
              <div className="result-actions-secondary">
                <button id="btn-foto-lagi" className="btn btn-ghost" onClick={handleFotoLagi}>
                  📸 Foto Lagi
                </button>
                <button id="btn-back-home-result" className="btn btn-ghost btn-sm" onClick={() => { stopCamera(); navigate('/'); }}>
                  🏠 Home
                </button>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

export default CameraPage;
