import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rnd } from 'react-rnd';
import { STICKERS, FILTERS } from './stickerData';
import { startCamera, stopCamera } from '../../services/camera';
import { initFaceTracking, detectFace, getLandmarks, getFeatureCoordinates } from '../../services/faceTracking';
import { getFrameSlots } from '../../frames/frameConfig';
import './SetupPage.css';

function SetupPage({ selectedFrame, photoCount, onComplete }) {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  
  const [activeTab, setActiveTab] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const [activeStickers, setActiveStickers] = useState([]); // Array of configs: { id, sticker, isTracked, x, y, width, height, rotation }
  const [cameraActive, setCameraActive] = useState(false);

  const slots = getFrameSlots(selectedFrame.id, photoCount);
  const isPortrait = slots[0] && slots[0].height > slots[0].width;
  const slotAspectRatio = slots[0] ? `${slots[0].width} / ${slots[0].height}` : '16 / 9';
  
  const boxStyle = {
    aspectRatio: slotAspectRatio,
    height: isPortrait ? '65vh' : 'auto',
    width: isPortrait ? 'auto' : '100%',
    maxHeight: '65vh',
    maxWidth: '900px'
  };

  // Initialize camera preview
  useEffect(() => {
    let stream;
    const initCam = async () => {
      try {
        stream = await startCamera(videoRef.current);
        setCameraActive(true);
      } catch (err) {
        console.error('Setup camera error:', err);
      }
    };
    initCam();
    
    return () => {
      stopCamera();
    };
  }, []);

  // Face Tracking Loop
  useEffect(() => {
    let isRunning = true;
    let rafId;

    const runTracker = async () => {
      if (!videoRef.current || !cameraActive || activeStickers.length === 0) {
        if (isRunning) rafId = requestAnimationFrame(runTracker);
        return;
      }
      
      const time = performance.now();
      const results = detectFace(videoRef.current, time);
      const landmarks = getLandmarks(results);
      
      if (landmarks) {
        const vWidth = videoRef.current.videoWidth || 640;
        const vHeight = videoRef.current.videoHeight || 480;

        setActiveStickers(prev => {
          let hasChanges = false;
          const next = prev.map(conf => {
            if (!conf.isTracked || conf.sticker.trackType === 'none') return conf;
            
            const coords = getFeatureCoordinates(landmarks, vWidth, vHeight, conf.sticker.trackType, true);
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

    if (cameraActive) {
      initFaceTracking().then(() => {
        if (isRunning) runTracker();
      });
    }

    return () => {
      isRunning = false;
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [cameraActive, activeStickers.length]);

  const handleAddSticker = (sticker) => {
    if (sticker.id === 'none') {
      setActiveStickers([]);
      return;
    }
    
    if (activeStickers.length >= 2 && !activeStickers.find(s => s.sticker.id === sticker.id)) {
      alert('Maksimal 2 pilihan stiker!');
      return;
    }

    if (activeStickers.find(s => s.sticker.id === sticker.id)) {
      setActiveStickers(activeStickers.filter(s => s.sticker.id !== sticker.id));
    } else {
      setActiveStickers([...activeStickers, {
        id: Math.random().toString(36).substr(2, 9),
        sticker,
        isTracked: sticker.trackType !== 'none',
        x: 100, y: 100, // Default position
        width: 150, height: 150,
        rotation: 0
      }]);
    }
  };

  const handleDragStop = (id, e, d) => {
    setActiveStickers(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, x: d.x, y: d.y, isTracked: false }; // Detach tracking on manual move
      }
      return s;
    }));
  };

  const handleResizeStop = (id, e, direction, ref, delta, position) => {
    setActiveStickers(prev => prev.map(s => {
      if (s.id === id) {
        return { 
          ...s, 
          width: ref.offsetWidth, 
          height: ref.offsetHeight, 
          x: position.x, 
          y: position.y,
          isTracked: false // Detach tracking on resize
        };
      }
      return s;
    }));
  };

  const handleGo = () => {
    stopCamera();
    onComplete({
      filter: selectedFilter,
      stickers: activeStickers
    });
    navigate('/camera');
  };

  const handleBack = () => {
    stopCamera();
    navigate('/enter-email');
  };

  const isStickerSelected = (id) => !!activeStickers.find(s => s.sticker.id === id);

  return (
    <div className="setup-page">
      {/* ── Left Column: Sidebar Controls ── */}
      <div className="setup-sidebar">
        <div className="setup-sidebar-top">
          <button 
            className={`setup-btn ${activeTab === 'filter' ? 'active' : ''}`}
            onClick={() => setActiveTab(activeTab === 'filter' ? null : 'filter')}
          >
            <div className="setup-btn-icon">✨</div>
            <span>Filter</span>
          </button>
          
          <button 
            className={`setup-btn ${activeTab === 'sticker' ? 'active' : ''}`}
            onClick={() => setActiveTab(activeTab === 'sticker' ? null : 'sticker')}
          >
            <div className="setup-btn-icon">🤩</div>
            <span>Sticker</span>
          </button>
        </div>
        
        <button className="setup-back-btn" onClick={handleBack}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
        </button>
      </div>

      {/* ── Middle Column: Camera Preview ── */}
      <div className="setup-middle">
        <div className="setup-camera-box" style={boxStyle}>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="setup-video"
            style={{ filter: selectedFilter.css }}
          />
          {!cameraActive && (
            <div className="setup-camera-loading">Loading Camera...</div>
          )}
          
          {/* Draggable & AR Tracked Stickers */}
          {activeStickers.length > 0 && cameraActive && (
            <div className="setup-ar-preview" style={{ position: 'absolute', inset: 0 }}>
              {activeStickers.map((s) => (
                <Rnd
                  key={s.id}
                  position={{ x: s.x, y: s.y }}
                  size={{ width: s.width, height: s.height }}
                  onDragStop={(e, d) => handleDragStop(s.id, e, d)}
                  onResizeStop={(e, direction, ref, delta, position) => handleResizeStop(s.id, e, direction, ref, delta, position)}
                  bounds="parent"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: `translate(${s.x}px, ${s.y}px) rotate(${s.rotation}deg)`,
                    transition: s.isTracked ? 'none' : 'all 0.1s ease', // Disable transition while tracking for instant sync
                    cursor: s.isTracked ? 'grab' : 'move'
                  }}
                  enableResizing={{
                    top: !s.isTracked, right: !s.isTracked, bottom: !s.isTracked, left: !s.isTracked,
                    topRight: !s.isTracked, bottomRight: !s.isTracked, bottomLeft: !s.isTracked, topLeft: !s.isTracked
                  }}
                  disableDragging={false}
                >
                  <img 
                    src={s.sticker.src} 
                    alt={s.sticker.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} 
                  />
                  {s.isTracked && <div style={{position: 'absolute', bottom: -25, background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: 10, padding: '2px 6px', borderRadius: 4}}>Tracked (Drag to Detach)</div>}
                </Rnd>
              ))}
            </div>
          )}
          
          {/* ── Modals Overlay (Positions on top of camera box) ── */}
          {activeTab === 'sticker' && (
            <div className="setup-modal sticker-modal anim-scale-in">
              <div className="sticker-grid">
                <div 
                  className={`sticker-item ${activeStickers.length === 0 ? 'selected' : ''}`} 
                  onClick={() => handleAddSticker({ id: 'none' })}
                >
                  <div className="sticker-icon">🚫</div>
                  <span>Tidak ada</span>
                </div>
                {STICKERS.map(s => (
                  <div 
                    key={s.id} 
                    className={`sticker-item ${isStickerSelected(s.id) ? 'selected' : ''}`} 
                    onClick={() => handleAddSticker(s)}
                  >
                    <img src={s.src} alt={s.name} onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
                    <div className="sticker-img-placeholder" style={{ display: 'none' }}>{s.name}</div>
                    <span>{s.name}</span>
                  </div>
                ))}
              </div>
              <div className="modal-footer">
                <span className="modal-warning">*Maksimal 2 pilihan</span>
              </div>
            </div>
          )}

          {activeTab === 'filter' && (
            <div className="setup-modal filter-modal anim-scale-in">
              <div className="filter-grid">
                {FILTERS.map(f => (
                  <div 
                    key={f.id} 
                    className={`filter-item ${selectedFilter.id === f.id ? 'active' : ''}`}
                    onClick={() => setSelectedFilter(f)}
                  >
                    <div className="filter-preview" style={{ filter: f.css }}>
                      <img src={selectedFrame.image || '/mascot.png'} alt="preview" />
                    </div>
                    <span>{f.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* GO Button */}
        <div className="setup-actions">
          <button className="setup-go-btn" onClick={handleGo}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
            GO
          </button>
        </div>
      </div>

      {/* ── Right Column: Selected Frame Preview ── */}
      <div className="setup-right">
        <div 
          className="setup-frame-thumbnail" 
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
              <div className="setup-frame-placeholder" style={{ display: 'none' }}>
                <span className="neon-dot" style={{ background: selectedFrame.accentColor }} />
                <span style={{ color: selectedFrame.accentColor }}>{selectedFrame.name}</span>
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

export default SetupPage;
