import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home           from './pages/Home';
import SelectFrame   from './pages/SelectFrame';
import SelectPhotos  from './pages/SelectPhotos';
import CameraPage    from './pages/CameraPage';
import AdminDashboard from './pages/AdminDashboard';
import EnterEmail     from './pages/EnterEmail';
import './index.css';
import './App.css';

/**
 * App — Root component with global session state.
 *
 * Session state is kept here (not in localStorage) so it resets
 * cleanly on page refresh without requiring a backend.
 *
 * State:
 *  - selectedFrame:  Frame config object (from frameConfig.js)
 *  - photoCount:     number 1–4
 */
function App() {
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [photoCount,    setPhotoCount]    = useState(4); // default 4
  const [userEmail,     setUserEmail]     = useState('');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route 
          path="/enter-email" 
          element={<EnterEmail onEmailSubmit={setUserEmail} />} 
        />

        <Route
          path="/select-frame"
          element={
            userEmail
              ? <SelectFrame
                  selectedFrame={selectedFrame}
                  onFrameSelect={setSelectedFrame}
                />
              : <Navigate to="/enter-email" replace />
          }
        />

        <Route
          path="/select-photos"
          element={
            selectedFrame
              ? <SelectPhotos
                  photoCount={photoCount}
                  onPhotoCountSelect={setPhotoCount}
                  selectedFrame={selectedFrame}
                />
              : <Navigate to="/select-frame" replace />
          }
        />

        <Route
          path="/camera"
          element={
            selectedFrame && photoCount && userEmail
              ? <CameraPage
                  selectedFrame={selectedFrame}
                  photoCount={photoCount}
                  userEmail={userEmail}
                />
              : <Navigate to="/select-frame" replace />
          }
        />

        {/* Admin dashboard — no auth guard; restrict via network/IP in production */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Catch-all → home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
