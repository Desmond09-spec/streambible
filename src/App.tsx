import { Routes, Route, Navigate } from 'react-router-dom';
import ControllerPage from './pages/ControllerPage';
import OverlayPage from './pages/OverlayPage';
import FullScreenPage from './pages/FullScreenPage';
import HelpPage from './pages/HelpPage';
import SettingsPage from './pages/SettingsPage';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/controller" replace />} />
      <Route path="/controller" element={<ControllerPage />} />
      <Route path="/overlay" element={<OverlayPage />} />
      <Route path="/fullscreen" element={<FullScreenPage />} />
      <Route path="/help" element={<HelpPage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  );
}

export default App;
