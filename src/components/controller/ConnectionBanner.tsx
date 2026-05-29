import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useSession } from '../../context/SessionContext';

export const ConnectionBanner: React.FC = () => {
  const { connectionState, retryCountdown, forceReconnect } = useSession();
  const [showRestored, setShowRestored] = useState(false);
  const [prevConnectionState, setPrevConnectionState] = useState(connectionState);

  useEffect(() => {
    if (prevConnectionState !== 'connected' && connectionState === 'connected') {
      setShowRestored(true);
      const timer = setTimeout(() => setShowRestored(false), 3000);
      return () => clearTimeout(timer);
    }
    setPrevConnectionState(connectionState);
  }, [connectionState, prevConnectionState]);

  const isDisconnected = connectionState === 'disconnected';
  const isReconnecting = connectionState === 'reconnecting';
  
  const isVisible = isDisconnected || isReconnecting || showRestored;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          style={{
            position: 'fixed',
            top: '20px',
            left: 0,
            right: 0,
            margin: '0 auto',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            padding: '12px 16px',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0,0,0,0.05)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            maxWidth: '380px',
            width: 'calc(100% - 48px)',
          }}
        >
          {showRestored && connectionState === 'connected' ? (
            <>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--success-bg, #dcfce7)',
                color: 'var(--success, #16a34a)',
                width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0
              }}>
                <CheckCircle2 size={20} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '15px', fontWeight: 600, color: '#111827', lineHeight: 1.2 }}>
                  Connection Restored
                </span>
              </div>
            </>
          ) : (
            <>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--danger-bg, #fee2e2)',
                color: 'var(--danger, #dc2626)',
                width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0
              }}>
                <WifiOff size={18} />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <span style={{ fontSize: '15px', fontWeight: 600, color: '#111827', lineHeight: 1.2 }}>
                  Connection Lost
                </span>
                <span style={{ fontSize: '13px', color: '#4b5563', lineHeight: 1.3, marginTop: '2px' }}>
                  {isReconnecting && retryCountdown !== null 
                    ? `Retrying in ${retryCountdown}s...` 
                    : isReconnecting 
                      ? 'Connecting...' 
                      : 'Waiting to reconnect...'}
                </span>
              </div>

              <button
                onClick={forceReconnect}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'var(--accent, #3b82f6)',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                <RefreshCw size={14} className={isReconnecting && retryCountdown === null ? "spin" : ""} />
                Retry
              </button>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
