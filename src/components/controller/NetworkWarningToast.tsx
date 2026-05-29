import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff } from 'lucide-react';
import { useSession } from '../../context/SessionContext';

export const NetworkWarningToast: React.FC = () => {
  const { consecutiveFailures, connectionState } = useSession();

  // Only show if we have 1 or 2 consecutive failures (at 3, the main connection drops)
  // and we are technically still "connected" to the room
  const isVisible = consecutiveFailures > 0 && consecutiveFailures < 3 && connectionState === 'connected';

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
            top: '80px',
            left: 0,
            right: 0,
            margin: '0 auto',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(255, 255, 255, 0.65)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            padding: '12px 16px',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0,0,0,0.05)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            maxWidth: '320px',
            width: 'calc(100% - 48px)',
          }}
        >
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(245, 158, 11, 0.15)',
            color: '#f59e0b',
            width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0
          }}>
            <WifiOff size={18} />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827', lineHeight: 1.2 }}>
              Network Unstable
            </span>
            <span style={{ fontSize: '13px', color: '#4b5563', lineHeight: 1.3, marginTop: '2px' }}>
              Packets dropped. Checking connection...
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
