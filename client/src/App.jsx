import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home           from './pages/Home';
import SelectFrame    from './pages/SelectFrame';

import EnterEmail     from './pages/EnterEmail'; // Legacy, will keep for fallback if needed
import RegistrationPage from './pages/RegistrationPage';
import AuthSessionPage from './pages/AuthSessionPage';
import SetupPage      from './pages/SetupPage/SetupPage';
import CameraPage     from './pages/CameraPage';
import AdminDashboard from './pages/AdminDashboard';
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
 */
function App() {
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [photoCount,    setPhotoCount]    = useState(1);
  const [userEmail,     setUserEmail]     = useState('');
  const [sessionToken,  setSessionToken]  = useState(null);
  const [setupData,     setSetupData]     = useState({ filter: null, stickers: [] });

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/register" element={<RegistrationPage />} />
        
        <Route 
          path="/auth" 
          element={<AuthSessionPage onAuthSuccess={(email, token) => {
            setUserEmail(email);
            setSessionToken(token);
          }} />} 
        />

        <Route
          path="/select-frame"
          element={
            userEmail
              ? <SelectFrame 
                  selectedFrame={selectedFrame} 
                  onFrameSelect={(frame) => {
                    setSelectedFrame(frame);
                    if (frame && frame.photoCount) {
                      setPhotoCount(frame.photoCount);
                    }
                  }} 
                />
              : <Navigate to="/auth" replace />
          }
        />



        <Route
          path="/setup"
          element={
            selectedFrame && userEmail && photoCount
              ? <SetupPage
                  selectedFrame={selectedFrame}
                  photoCount={photoCount}
                  onComplete={(data) => setSetupData(data)}
                />
              : <Navigate to="/select-frame" replace />
          }
        />

        <Route
          path="/camera"
          element={
            selectedFrame && userEmail
              ? <CameraPage
                  selectedFrame={selectedFrame}
                  photoCount={photoCount}
                  setupData={setupData}
                  userEmail={userEmail}
                  sessionToken={sessionToken}
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
