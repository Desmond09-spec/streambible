import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface SwitchingOverlayProps {
  isVisible: boolean;
  error: string | null;
}

export const SwitchingOverlay: React.FC<SwitchingOverlayProps> = ({ isVisible, error }) => {
  // Read theme directly to ensure immediate visual consistency
  const theme = localStorage.getItem('streambible-theme') || 'light';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`theme-${theme}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} // Apple-like smooth ease-out
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999, // Extremely high to sit on top of everything
            backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-base)'
          }}
        >
          {error ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
              <AlertCircle size={48} strokeWidth={1.5} color="#ef4444" />
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 500 }}>Connection Error</h3>
              <p style={{ margin: 0, fontSize: '15px', color: 'var(--color-text-muted)' }}>
                {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                style={{
                  marginTop: '12px',
                  padding: '12px 24px',
                  borderRadius: '99px',
                  background: 'var(--color-text-base)',
                  color: 'var(--color-bg-base)',
                  border: 'none',
                  fontWeight: 500,
                  fontSize: '15px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <RefreshCw size={16} /> Reload Page
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
              {/* Premium clean ring spinner using Apple's accent blue */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: '3px solid transparent',
                  borderTopColor: 'var(--color-accent-primary)',
                  borderRightColor: theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                  borderBottomColor: theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                  borderLeftColor: theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                }}
              />
              <h3 style={{ 
                margin: 0, 
                fontSize: '17px', 
                fontWeight: 500, 
                letterSpacing: '-0.02em',
                color: 'var(--color-text-base)' 
              }}>
                Switching rooms...
              </h3>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
