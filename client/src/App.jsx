import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home           from './pages/Home';
import SelectFrame   from './pages/SelectFrame';
import EnterEmail    from './pages/EnterEmail';
import SetupPage     from './pages/SetupPage/SetupPage';
import CameraPage    from './pages/CameraPage';
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
  const [userEmail,     setUserEmail]     = useState('');
  const [setupData,     setSetupData]     = useState({ filter: null, stickers: [] });

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/select-frame"
          element={
            <SelectFrame
              selectedFrame={selectedFrame}
              onFrameSelect={setSelectedFrame}
            />
          }
        />



        <Route 
          path="/enter-email" 
          element={
            selectedFrame 
              ? <EnterEmail onEmailSubmit={setUserEmail} />
              : <Navigate to="/select-frame" replace />
          } 
        />

        <Route
          path="/setup"
          element={
            selectedFrame && userEmail
              ? <SetupPage
                  selectedFrame={selectedFrame}
                  photoCount={selectedFrame.photoCount}
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
                  photoCount={selectedFrame.photoCount}
                  setupData={setupData}
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
