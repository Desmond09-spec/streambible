import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ControllerPage from './pages/ControllerPage';
import OverlayPage from './pages/OverlayPage';
import FullScreenPage from './pages/FullScreenPage';
import HelpPage from './pages/HelpPage';
import SettingsPage from './pages/SettingsPage';
import { AuthPage } from './pages/AuthPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { CopyrightPage } from './pages/CopyrightPage';
import { SettingsProvider } from './context/SettingsContext';
import { SessionProvider } from './context/SessionContext';
import './App.css';

function App() {
  useEffect(() => {
    // Clean up old yv_ cache keys to prevent stale local storage accumulation
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('yv_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (e) {
      console.error('Error cleaning up local storage', e);
    }
  }, []);

  return (
    <SettingsProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/controller" replace />} />
        
        {/* Host Session Routes */}
        <Route element={<SessionProvider />}>
          <Route path="/controller" element={<ControllerPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route path="/overlay" element={<OverlayPage />} />
        <Route path="/fullscreen" element={<FullScreenPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/copyright" element={<CopyrightPage />} />
      </Routes>
    </SettingsProvider>
  );
}

export default App;
