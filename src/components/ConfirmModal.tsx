import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmModalProps {
  isVisible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isVisible,
  title,
  message,
  confirmLabel = 'Continue',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}) => {
  const theme = localStorage.getItem('streambible-theme') || 'light';
  const isDark = theme === 'dark';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={onCancel}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99998,
            backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.25)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <motion.div
            initial={{ scale: 1.05, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.05, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: isDark ? 'rgba(30, 30, 32, 0.75)' : 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              borderRadius: '14px',
              width: '270px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: isDark
                ? '0 16px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)'
                : '0 16px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)',
              overflow: 'hidden',
            }}
          >
            {/* Header / Content */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 16px', gap: '6px', textAlign: 'center' }}>
              <h2 style={{
                margin: 0,
                fontSize: '17px',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                color: isDark ? '#ffffff' : '#000000',
              }}>
                {title}
              </h2>
              <p style={{
                margin: 0,
                fontSize: '13px',
                lineHeight: 1.35,
                letterSpacing: '-0.01em',
                color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
              }}>
                {message}
              </p>
            </div>

            {/* Horizontal Divider */}
            <div style={{
              height: '1px',
              width: '100%',
              background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            }} />

            {/* Actions */}
            <div style={{ display: 'flex', width: '100%', height: '44px' }}>
              <button
                onClick={onCancel}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  color: '#0A84FF',
                  fontSize: '17px',
                  fontWeight: 400,
                  cursor: 'pointer',
                  letterSpacing: '-0.02em',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.background = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.background = 'transparent';
                }}
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  color: destructive ? '#FF453A' : '#0A84FF',
                  fontSize: '17px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  letterSpacing: '-0.02em',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.background = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.background = 'transparent';
                }}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
