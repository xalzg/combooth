import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CircuitBackground from '../components/CircuitBackground';
import Camera from '../components/Camera';
import Countdown from '../components/Countdown';
import PhotoPreview from '../components/PhotoPreview';
import { getFrameSlots } from '../frames/frameConfig';
import { startCamera, stopCamera, captureFrame } from '../services/camera';
import { composePhotos, applyEditorChanges, bakeStickersOntoPhoto, downloadCanvas, downloadCanvasPNG, generateFilename, printCanvas, getTransparentFrameURL } from '../services/composer';
import { initFaceTracking, detectFace, getLandmarks, getFeatureCoordinates } from '../services/faceTracking';
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
  SAVE:       'SAVE',
  DONE:       'DONE',
  ERROR:      'ERROR',
};

function CameraPage({ selectedFrame, photoCount, setupData, userEmail }) {
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
  const [liveStickers, setLiveStickers] = useState(setupData?.stickers || []);
  const liveStickersRef = useRef(liveStickers);
  const [transparentOverlay, setTransparentOverlay] = useState(null);

  const slots = getFrameSlots(selectedFrame?.id, photoCount);
  const frameW = selectedFrame?.canvas?.width || 1080;
  const frameH = selectedFrame?.canvas?.height || 1920;
  const isPortrait = frameH > frameW;
  
  const boxStyle = {
    aspectRatio: `${frameW} / ${frameH}`,
    height: isPortrait ? '70vh' : 'auto',
    width: isPortrait ? 'auto' : '100%',
    maxHeight: '70vh',
    maxWidth: '900px',
    position: 'relative',
    backgroundColor: selectedFrame?.previewBg || '#071426',
    borderRadius: '16px',
    overflow: 'hidden'
  };

  useEffect(() => {
    liveStickersRef.current = liveStickers;
  }, [liveStickers]);

  const videoRef  = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (!selectedFrame || !photoCount) {
      navigate('/select-frame');
    } else {
      getTransparentFrameURL(selectedFrame, photoCount).then(setTransparentOverlay);
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

  // Face Tracking Loop for CameraPage
  useEffect(() => {
    let isRunning = true;
    let rafId;

    const runTracker = async () => {
      const v = videoRef.current;
      if (!v || uiState !== STATES.READY && uiState !== STATES.COUNTDOWN && uiState !== STATES.CAPTURING) {
        if (isRunning) rafId = requestAnimationFrame(runTracker);
        return;
      }
      
      const time = performance.now();
      const results = detectFace(v, time);
      const landmarks = getLandmarks(results);
      
      if (landmarks) {
        const vWidth = v.videoWidth || 640;
        const vHeight = v.videoHeight || 480;

        setLiveStickers(prev => {
          let hasChanges = false;
          const next = prev.map(conf => {
            if (!conf.isTracked) return conf;
            
            const coords = getFeatureCoordinates(landmarks, vWidth, vHeight, conf.sticker.trackType, isMirrored);
            if (coords) {
              hasChanges = true;
              return {
                ...conf,
                x: coords.x,
                y: coords.y,
                width: coords.width,
                height: coords.height,
                rotation: coords.rotation
              };
            }
            return conf;
          });
          return hasChanges ? next : prev;
        });
      }
      
      if (isRunning) {
        rafId = requestAnimationFrame(runTracker);
      }
    };

    if (uiState === STATES.READY || uiState === STATES.COUNTDOWN || uiState === STATES.CAPTURING) {
      initFaceTracking().then(() => {
        if (isRunning) runTracker();
      });
    }

    return () => {
      isRunning = false;
      if (rafId) cancelAnimationFrame(rafId);
    };
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

    setTimeout(async () => {
      try {
        const v = videoRef.current;
        if (!v || !v.videoWidth) throw new Error('no video');

        const dataUrl = await bakeStickersOntoPhoto(v, liveStickersRef.current, isMirrored);

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
      // 1. Compose base photos
      const baseCanvas = await composePhotos(photos, selectedFrame, photoCount, pct => setProgress(pct * 0.5));
      
      // 2. Apply chosen filters
      const finalFilterAndStickers = {
        filter: setupData?.filter || { css: 'none' },
        stickers: [] // Stickers are already baked into the photos!
      };
      
      const editedCanvas = await applyEditorChanges(baseCanvas, finalFilterAndStickers, pct => setProgress(50 + pct * 0.5));
      
      setFinalCanvas(editedCanvas);
      
      // 3. Attempt to send email in background
      if (userEmail) {
        setEmailStatus('sending');
        fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userEmail,
            imageBase64: editedCanvas.toDataURL('image/jpeg', 0.95),
            frameName: selectedFrame.name
          })
        }).then(res => {
          if (res.ok) setEmailStatus('sent');
          else setEmailStatus('error');
        }).catch(() => setEmailStatus('error'));
      }

      setUiState(STATES.SAVE);
      playSuccess();
      trackSession('complete', selectedFrame?.id, photoCount);
    } catch (err) {
      console.error(err);
      setErrorMsg('COMPOSE_ERROR');
      setUiState(STATES.ERROR);
    }
  }, [photos, selectedFrame, photoCount, setupData, userEmail]);

  const handleSaveClick = useCallback(() => {
    if (finalCanvas) {
      downloadCanvasPNG(finalCanvas, generateFilename('png'));
      trackSession('download', selectedFrame?.id, photoCount);
      setUiState(STATES.DONE);
      playSuccess();
    }
  }, [finalCanvas, selectedFrame, photoCount]);

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
    <div className="camera-page-layout">
      {/* ── Left Column: Sidebar Controls ── */}
      <div className="camera-sidebar">
        <button className="camera-back-btn" onClick={() => { stopCamera(); navigate('/setup'); }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
        </button>
      </div>

      {/* ── Middle Column: Camera Preview ── */}
      <div className="camera-middle">
        {uiState === STATES.ERROR ? (
          <div className="camera-error card" style={{ padding: '48px 40px', maxWidth: 500, textAlign: 'center' }}>
            <h2>{errorMsg}</h2>
            <button className="btn btn-primary" onClick={handleRetryCamera}>🔄 Coba Lagi</button>
          </div>
        ) : uiState === STATES.PROCESSING ? (
          <div className="processing-screen anim-scale-in">
            <h2 style={{ fontFamily: 'Orbitron', margin: 0 }}>PROCESSING...</h2>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : uiState === STATES.SAVE || uiState === STATES.DONE ? (
          <div className="save-main">
            <img src={finalCanvas?.toDataURL('image/jpeg', 0.95)} alt="Final" style={{ height: '80vh', borderRadius: '12px', border: '4px solid #000' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginLeft: 40, alignItems: 'center' }}>
              <div style={{ marginBottom: '8px', fontSize: '1rem', fontWeight: 700 }}>
                {emailStatus === 'sending' && <span style={{ color: '#0070f3' }}>⏳ Mengirim ke {userEmail}...</span>}
                {emailStatus === 'sent' && <span style={{ color: '#10B981' }}>✅ Terkirim ke {userEmail}</span>}
                {emailStatus === 'error' && <span style={{ color: '#EF4444' }}>❌ Gagal mengirim ke {userEmail}</span>}
              </div>
              <button className="btn btn-primary" style={{ padding: '16px 48px', fontSize: '2rem' }} onClick={handleSaveClick}>Save</button>
              <button className="btn btn-ghost" onClick={() => { stopCamera(); navigate('/'); }}>Home</button>
            </div>
          </div>
        ) : uiState === STATES.REVIEWING ? (
          <div className="reviewing-main">
            <PhotoPreview
              photos={photos}
              photoCount={photoCount}
              onRetake={handleRetake}
              onContinue={handleContinueToCompose}
              onRetakeAll={handleRetakeAll}
            />
          </div>
        ) : (
          <>
            <div className="camera-box" style={boxStyle}>
              {/* Previous photos */}
              {photos.map((photoData, idx) => {
                if (!photoData || idx === displayIdx) return null;
                const slot = slots[idx];
                if (!slot) return null;
                return (
                  <div key={`photo-${idx}`} style={{
                    position: 'absolute',
                    left: `${(slot.x / frameW) * 100}%`,
                    top: `${(slot.y / frameH) * 100}%`,
                    width: `${(slot.width / frameW) * 100}%`,
                    height: `${(slot.height / frameH) * 100}%`,
                    overflow: 'hidden'
                  }}>
                    <img src={photoData} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Captured" />
                  </div>
                );
              })}

              {/* Current live camera slot */}
              {(() => {
                const slot = slots[displayIdx] || slots[0];
                return (
                  <div 
                    className="camera-viewport"
                    style={{ 
                      position: 'absolute',
                      left: `${(slot.x / frameW) * 100}%`,
                      top: `${(slot.y / frameH) * 100}%`,
                      width: `${(slot.width / frameW) * 100}%`,
                      height: `${(slot.height / frameH) * 100}%`,
                      filter: setupData?.filter?.css || 'none', 
                      overflow: 'hidden'
                    }}
                  >
                    <Camera
                      videoRef={videoRef}
                      mirrored={isMirrored}
                      isActive={uiState === STATES.READY || uiState === STATES.COUNTDOWN}
                      photoIndex={displayIdx + 1}
                      photoTotal={photoCount}
                    />
                    {uiState === STATES.COUNTDOWN && (
                      <Countdown onComplete={handleCountdownComplete} duration={1} />
                    )}
                    {flashActive && <div className="camera-flash" aria-hidden="true" />}
                    
                    {/* Dynamic AR Stickers Overlay */}
                    {liveStickers.length > 0 && isPhotoTaking && (
                      <div className="camera-ar-stickers" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                        {liveStickers.map((s) => (
                          <div 
                            key={s.id} 
                            style={{ 
                              position: 'absolute', 
                              left: 0, top: 0,
                              width: s.width, height: s.height,
                              transform: `translate(${s.x}px, ${s.y}px) rotate(${s.rotation}deg)`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                          >
                            <img src={s.sticker.src} alt={s.sticker.name} onError={(e) => e.target.style.display='none'} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Frame overlay */}
              {transparentOverlay && (
                <img 
                  src={transparentOverlay} 
                  style={{ 
                    position: 'absolute', 
                    inset: 0, 
                    width: '100%', 
                    height: '100%', 
                    pointerEvents: 'none',
                    zIndex: 20 
                  }} 
                  alt=""
                />
              )}
            </div>

            <div className="camera-actions">
              <button 
                className="btn btn-ghost" 
                onClick={() => setIsMirrored(!isMirrored)}
                title="Flip Camera"
              >
                {isMirrored ? 'Mirrored' : 'Normal'}
              </button>
              
              {uiState === STATES.READY && (
                <button className="camera-capture-btn" onClick={handleStartCapture}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/>
                  </svg>
                  {retakeIdx !== null ? 'ULANG FOTO' : 'AMBIL FOTO'}
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Right Column: Selected Frame Preview ── */}
      <div className="camera-right">
        <div 
          className="camera-frame-thumbnail"
          style={{ aspectRatio: `${selectedFrame.canvas.width} / ${selectedFrame.canvas.height}` }}
        >
          {selectedFrame.image ? (
            <>
              <img 
                src={selectedFrame.image} 
                alt={selectedFrame.name} 
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="setup-frame-placeholder" style={{ display: 'none', flexDirection: 'column' }}>
                <span className="neon-dot" style={{ background: selectedFrame.accentColor, marginBottom: 8 }} />
                <span style={{ color: selectedFrame.accentColor, fontWeight: 'bold' }}>{selectedFrame.name}</span>
              </div>
            </>
          ) : (
            <div className="setup-frame-placeholder">
              <span className="neon-dot" style={{ background: selectedFrame.accentColor }} />
              <span style={{ color: selectedFrame.accentColor }}>{selectedFrame.name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CameraPage;
