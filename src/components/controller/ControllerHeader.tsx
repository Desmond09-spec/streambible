import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';
import { useSession } from '../../context/SessionContext';
import { HeaderActionMenu } from './HeaderActionMenu';

interface ControllerHeaderProps {
  wsConnected: boolean;
  roomId: string | null;
  claimedRoomId: string | null;
  isHost: boolean;
  theme: "light" | "dark";
  toggleTheme: () => void;
  copyUrl: (url: string, type: "overlay" | "fullscreen" | "controller") => void;
  setIsMobileMenuOpen: (open: boolean) => void;
  setIsConnectionSheetOpen: (open: boolean) => void;
}

export const ControllerHeader: React.FC<ControllerHeaderProps> = ({
  wsConnected,
  roomId,
  claimedRoomId,
  isHost,
  theme,
  toggleTheme,
  copyUrl,
  setIsMobileMenuOpen,
  setIsConnectionSheetOpen,
}) => {
  const { connectionState } = useSession();
  const navigate = useNavigate();

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
    <header className="header header-3col">

      {/* ── LEFT: Identity ───────────────────────────────── */}
      <div className="wordmark">
        <div className="wordmark-icon">
          <svg viewBox="0 0 16 16" fill="none" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2.5" y="1.5" width="11" height="13" rx="1.5" />
            <path d="M5 5h6M5 7.5h6M5 10h4" />
          </svg>
        </div>
        <div className="wordmark-text">
          <span className="wordmark-name">StreamBible</span>
        </div>
      </div>

      {/* ── CENTER: Room title (clickable, macOS-style) ──── */}
      <button
        className="header-center-zone mobile-hidden"
        onClick={() => setIsConnectionSheetOpen(true)}
        title="View Connection Status"
      >
        {/* Status dot */}
        <span
          className="header-status-dot"
          style={{
            background: statusColor,
            boxShadow: isConnected ? `0 0 6px ${statusColor}` : 'none',
            animation: isConnected ? 'breathe 2.4s ease-in-out infinite' : 'none',
          }}
        />
        {/* Status label */}
        <span className="header-status-label" style={{ color: statusColor }}>
          {statusLabel}
        </span>

        {/* Divider */}
        <span className="header-center-divider">·</span>

        {/* Room ID */}
        <span className="header-room-id">
          Room&nbsp;{roomId}
          {roomId === claimedRoomId && (
            <span style={{ color: '#E5B05C', marginLeft: '5px', textShadow: '0 0 8px rgba(229,176,92,0.4)' }} title="Claimed Premium Room">✦</span>
          )}
        </span>
      </button>

      {/* ── RIGHT: Utility icons ─────────────────────────── */}
      <div className="header-right mobile-hidden" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>

        {/* Theme toggle */}
        <button className="header-icon-btn" onClick={toggleTheme} title="Toggle Theme">
          {theme === 'dark' ? (
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13.5 10A5.5 5.5 0 0 1 6 2.5a5.5 5.5 0 1 0 7.5 7.5z" />
            </svg>
          )}
        </button>

        {/* More actions menu */}
        <HeaderActionMenu
          roomId={roomId || ''}
          isHost={isHost}
          copyUrl={copyUrl}
          onNavigateSettings={() => navigate(`/settings?room=${roomId}`)}
          onNavigateHelp={() => navigate('/help')}
        />
      </div>

      {/* ── MOBILE: Status icon + hamburger ───── */}
      <div className="mobile-action-group">
        <div
          className={`mobile-status-btn ${isConnected ? 'connected' : 'error'}`}
          onClick={() => setIsConnectionSheetOpen(true)}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
            <path d="M1 6a10.9 10.9 0 0 1 14 0" />
            <path d="M3.5 9a7 7 0 0 1 9 0" />
            <path d="M6 12a3.5 3.5 0 0 1 4 0" />
            <circle cx="8" cy="14.5" r="0.75" fill="currentColor" stroke="none" />
            {connectionState !== 'connected' && (
              <line x1="2" y1="2" x2="14" y2="14" strokeWidth="1.5" />
            )}
          </svg>
        </div>
        <button className="mobile-more-btn" onClick={() => setIsMobileMenuOpen(true)}>
          <MoreHorizontal size={20} />
        </button>
      </div>

    </header>
  );
};
