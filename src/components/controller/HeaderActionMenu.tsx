import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreHorizontal, Monitor, LayoutTemplate, Settings, HelpCircle } from 'lucide-react';
import { getPublicBaseUrl } from "../../utils/urlHelpers";

interface HeaderActionMenuProps {
  roomId: string;
  isHost: boolean;
  copyUrl: (url: string, type: "overlay" | "fullscreen" | "controller") => void;
  onNavigateSettings: () => void;
  onNavigateHelp: () => void;
}

export const HeaderActionMenu: React.FC<HeaderActionMenuProps> = ({
  roomId,
  isHost,
  copyUrl,
  onNavigateSettings,
  onNavigateHelp
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = (type: "overlay" | "fullscreen") => {
    copyUrl(`${getPublicBaseUrl()}/#/${type}?room=${roomId}`, type);
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        ref={buttonRef}
        className="header-icon-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="More options"
      >
        <MoreHorizontal size={18} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              minWidth: '200px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-base)',
              borderRadius: 'var(--r-md)',
              boxShadow: 'var(--shadow-lg)',
              padding: '8px',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-3)', padding: '4px 8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Outputs
            </div>

            <button
              onClick={() => handleCopy("overlay")}
              className="dropdown-action-btn"
            >
              <LayoutTemplate size={16} />
              <span>Copy Overlay Link</span>
            </button>

            <button
              onClick={() => handleCopy("fullscreen")}
              className="dropdown-action-btn"
            >
              <Monitor size={16} />
              <span>Copy Fullscreen Link</span>
            </button>

            <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }} />

            {isHost ? (
              <button
                onClick={() => {
                  onNavigateSettings();
                  setIsOpen(false);
                }}
                className="dropdown-action-btn"
              >
                <Settings size={16} />
                <span>Session Settings</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onNavigateHelp();
                  setIsOpen(false);
                }}
                className="dropdown-action-btn"
              >
                <HelpCircle size={16} />
                <span>Help & Guides</span>
              </button>
            )}

          </motion.div>
        )}
      </AnimatePresence>
      <style>{`
        .dropdown-action-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 10px 12px;
          border: none;
          background: transparent;
          color: var(--text-1);
          font-size: 13px;
          font-weight: 500;
          text-align: left;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease;
        }
        .dropdown-action-btn:hover {
          background: var(--bg-elevated);
        }
        .dropdown-action-btn svg {
          color: var(--text-2);
          transition: color 0.2s ease;
        }
        .dropdown-action-btn:hover svg {
          color: var(--accent);
        }
      `}</style>
    </div>
  );
};
