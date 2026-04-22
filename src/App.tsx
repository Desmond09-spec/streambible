import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ControllerPage from './pages/ControllerPage';
import OverlayPage from './pages/OverlayPage';
import FullScreenPage from './pages/FullScreenPage';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/controller" replace />} />
      <Route path="/controller" element={<ControllerPage />} />
      <Route path="/overlay" element={<OverlayPage />} />
      <Route path="/fullscreen" element={<FullScreenPage />} />
    </Routes>
  );
}

export default App;
