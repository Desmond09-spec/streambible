import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Settings } from 'lucide-react';

interface ControllerHeaderProps {
  wsConnected: boolean;
  roomId: string | null;
  claimedRoomId: string | null;
  isHost: boolean;
  theme: "light" | "dark";
  toggleTheme: () => void;
  copyUrl: (url: string, type: "overlay" | "fullscreen" | "controller") => void;
  setIsMobileMenuOpen: (open: boolean) => void;
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
}) => {
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="wordmark">
        <div className="wordmark-icon">
          <svg
            viewBox="0 0 16 16"
            fill="none"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2.5" y="1.5" width="11" height="13" rx="1.5" />
            <path d="M5 5h6M5 7.5h6M5 10h4" />
          </svg>
        </div>
        <div className="wordmark-text">
          <span
            className="wordmark-name"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            StreamBible
            <span
              className={`ws-dot-mobile ${wsConnected ? "connected" : "error"}`}
            ></span>
          </span>
          <span
            className="wordmark-sub mobile-hidden"
            style={{ display: "flex", alignItems: "center", gap: "4px" }}
          >
            Room {roomId}
            {roomId === claimedRoomId && (
              <span
                style={{
                  color: "#E5B05C",
                  fontSize: "14px",
                  textShadow: "0 0 8px rgba(229,176,92,0.4)",
                }}
                title="Claimed Premium Room"
              >
                ✦
              </span>
            )}
          </span>
        </div>
      </div>

      <div
        id="header-links"
        className="header-right mobile-hidden"
        style={{
          display: "flex",
          gap: "var(--space-2)",
          alignItems: "center",
        }}
      >
        <button
          className="obs-copy-btn"
          onClick={() =>
            copyUrl(
              `${window.location.origin}/overlay?room=${roomId}`,
              "overlay",
            )
          }
          title="Copy Lower Third Overlay Link"
        >
          <svg
            className="icon-copy"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 5H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2m4-10h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2M5 8h6" />
          </svg>
          <span className="btn-label">Overlay</span>
        </button>

        <button
          className="obs-copy-btn"
          onClick={() =>
            copyUrl(
              `${window.location.origin}/fullscreen?room=${roomId}`,
              "fullscreen",
            )
          }
          title="Copy Full Screen Overlay Link"
        >
          <svg
            className="icon-copy"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
          </svg>
          <span className="btn-label">Fullscreen</span>
        </button>

        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title="Toggle Theme"
        >
          <span>
            {theme === "dark" ? (
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
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
              >
                <path d="M13.5 10A5.5 5.5 0 0 1 6 2.5a5.5 5.5 0 1 0 7.5 7.5z" />
              </svg>
            )}
          </span>
        </button>

        {isHost ? (
          <button
            className="theme-toggle"
            onClick={() => navigate(`/settings?room=${roomId}`)}
            title="Session Settings"
          >
            <span>
              <Settings size={16} />
            </span>
          </button>
        ) : (
          <button
            className="theme-toggle"
            onClick={() => navigate("/help")}
            title="Help"
          >
            <span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </span>
          </button>
        )}

        <div className="ws-pill connected">
          <span className="ws-dot"></span>
          <span id="wsLabel">Connected</span>
          <svg
            className="ws-wifi-icon"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M1 6a10.9 10.9 0 0 1 14 0" />
            <path d="M3.5 9a7 7 0 0 1 9 0" />
            <path d="M6 12a3.5 3.5 0 0 1 4 0" />
            <circle
              cx="8"
              cy="14.5"
              r="0.75"
              fill="currentColor"
              stroke="none"
            />
            <line
              className="ws-wifi-slash"
              x1="2"
              y1="2"
              x2="14"
              y2="14"
              strokeWidth="1.5"
            />
          </svg>
        </div>
      </div>

      <button
        className="mobile-more-btn"
        onClick={() => setIsMobileMenuOpen(true)}
      >
        <MoreHorizontal size={20} />
      </button>
    </header>
  );
};
