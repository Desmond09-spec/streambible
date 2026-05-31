import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, MonitorUp, Settings } from 'lucide-react';
import { useSession } from '../../context/SessionContext';
import { getPublicBaseUrl } from '../../utils/urlHelpers';

interface MobileMenuSheetProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (val: boolean) => void;
  wsConnected: boolean;
  roomId: string | null;
  copyUrl: (url: string, type: "overlay" | "fullscreen" | "controller") => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  isHost: boolean;
}

export const MobileMenuSheet: React.FC<MobileMenuSheetProps> = ({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  wsConnected,
  roomId,
  copyUrl,
  theme,
  toggleTheme,
  isHost,
}) => {
  const navigate = useNavigate();
  const { connectionState } = useSession();

  const isConnected = connectionState === 'connected';
  const isReconnecting = connectionState === 'reconnecting';

  const statusLabel = isConnected
    ? (wsConnected ? 'Sync Active' : 'Connected')
    : isReconnecting
    ? 'Reconnecting…'
    : 'Offline';

  const statusColor = isConnected
    ? 'var(--success)'
    : isReconnecting
    ? '#f59e0b'
    : 'var(--danger)';

  return (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bottom-sheet-backdrop"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bottom-sheet-modal"
          >
            <div className="bottom-sheet-handle" />

            <div className="bottom-sheet-header">
              <h3>Menu</h3>
              <div className={`bottom-sheet-pill ${isConnected ? "connected" : isReconnecting ? "reconnecting" : "error"}`}>
                <span
                  className="ws-dot"
                  style={{
                    background: statusColor,
                    boxShadow: isConnected ? `0 0 6px ${statusColor}` : "none",
                    animation: isConnected ? "breathe 2.4s ease-in-out infinite" : "none",
                  }}
                ></span>
                <span>
                  {statusLabel}
                </span>
              </div>
            </div>

            <div className="bottom-sheet-body">
              <button
                className="bottom-sheet-btn"
                onClick={() => {
                  copyUrl(
                    `${getPublicBaseUrl()}/#/overlay?room=${roomId}`,
                    "overlay",
                  );
                  setIsMobileMenuOpen(false);
                }}
              >
                <div className="bottom-sheet-btn-icon">
                  <ExternalLink size={18} />
                </div>
                <div className="bottom-sheet-btn-text">
                  <span>Overlay Link</span>
                  <span className="sub">Copy link for OBS Browser Source</span>
                </div>
              </button>

              <button
                className="bottom-sheet-btn"
                onClick={() => {
                  copyUrl(
                    `${getPublicBaseUrl()}/#/fullscreen?room=${roomId}`,
                    "fullscreen",
                  );
                  setIsMobileMenuOpen(false);
                }}
              >
                <div className="bottom-sheet-btn-icon">
                  <MonitorUp size={18} />
                </div>
                <div className="bottom-sheet-btn-text">
                  <span>Fullscreen Link</span>
                  <span className="sub">
                    Copy link for full-screen display
                  </span>
                </div>
              </button>

              <button
                className="bottom-sheet-btn"
                onClick={() => {
                  toggleTheme();
                  setIsMobileMenuOpen(false);
                }}
              >
                <div className="bottom-sheet-btn-icon">
                  {theme === "dark" ? (
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      width="18"
                      height="18"
                    >
                      <circle cx="8" cy="8" r="3" />
                      <line x1="8" y1="1" x2="8" y2="2.5" />
                      <line x1="8" y1="13.5" x2="8" y2="15" />
                      <line x1="1" y1="8" x2="2.5" y2="8" />
                      <line x1="13.5" y1="8" x2="15" y2="8" />
                      <line x1="3.05" y1="3.05" x2="4.1" y2="4.1" />
                      <line x1="11.9" y1="11.9" x2="12.95" y2="12.95" />
                      <line x1="3.05" y1="12.95" x2="4.1" y2="11.9" />
                      <line x1="11.9" y1="4.1" x2="12.95" y2="3.05" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      width="18"
                      height="18"
                    >
                      <path d="M13.5 10A5.5 5.5 0 0 1 6 2.5a5.5 5.5 0 1 0 7.5 7.5z" />
                    </svg>
                  )}
                </div>
                <div className="bottom-sheet-btn-text">
                  <span>Toggle Theme</span>
                  <span className="sub">
                    Switch to {theme === "dark" ? "Light" : "Dark"} mode
                  </span>
                </div>
              </button>

              {isHost ? (
                <button
                  className="bottom-sheet-btn"
                  onClick={() => {
                    navigate(`/settings?room=${roomId}`);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <div className="bottom-sheet-btn-icon">
                    <Settings size={18} />
                  </div>
                  <div className="bottom-sheet-btn-text">
                    <span>Session Settings</span>
                    <span className="sub">
                      Configure search, network, and broadcast options
                    </span>
                  </div>
                </button>
              ) : (
                <button
                  className="bottom-sheet-btn"
                  onClick={() => {
                    navigate("/help");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <div className="bottom-sheet-btn-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      width="18"
                      height="18"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </div>
                  <div className="bottom-sheet-btn-text">
                    <span>Help & Documentation</span>
                    <span className="sub">
                      Guides, FAQs, and getting started
                    </span>
                  </div>
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
