import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useSession } from '../../context/SessionContext';

interface ConnectionStatusModalProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

export const ConnectionStatusModal: React.FC<ConnectionStatusModalProps> = ({
  isOpen,
  setIsOpen,
}) => {
  const {
    connectionState,
    retryCountdown,
    forceReconnect,
    isHost,
    roomId,
    hostStatus,
    devices,
    pingMs,
  } = useSession();

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 680);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 680);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isConnected = connectionState === 'connected';
  const isReconnecting = connectionState === 'reconnecting';
  const isDisconnected = connectionState === 'disconnected';

  const overlayCount = devices.filter(d => d.isOverlay).length;
  const guestCount = devices.filter(d => !d.isHost && !d.isOverlay).length;

  let heroState = 'Offline';
  let heroColor = 'var(--danger)';
  let heroBg = 'var(--danger-bg)';
  let heroIcon = <WifiOff size={32} />;
  let heroDesc = "Connection lost. Ensure you have an active internet connection.";

  if (isConnected) {
    if (isHost && overlayCount === 0) {
      heroState = 'Waiting for Overlays...';
      heroColor = '#f59e0b';
      heroBg = 'rgba(245, 158, 11, 0.15)';
      heroIcon = <Wifi size={32} />;
      heroDesc = "Connected to network, but no displays are receiving your verses yet.";
    } else {
      heroState = 'Sync Active';
      heroColor = 'var(--success)';
      heroBg = 'var(--success-bg)';
      heroIcon = <Wifi size={32} />;
      heroDesc = "Your device is actively syncing verses in real-time.";
    }
  } else if (isReconnecting) {
    heroState = 'Reconnecting...';
    heroColor = '#f59e0b';
    heroBg = 'rgba(245, 158, 11, 0.15)';
    heroIcon = <RefreshCw size={32} className="spin" />;
  }

  let pingStatus = "Evaluating...";
  let pingColor = "var(--text-2)";
  
  if (pingMs === null) {
    pingStatus = "Disconnected";
    pingColor = "var(--danger)";
  } else if (pingMs < 150) {
    pingStatus = "Excellent";
    pingColor = "var(--success)";
  } else if (pingMs <= 400) {
    pingStatus = "Fair";
    pingColor = "#f59e0b"; // yellow
  } else {
    pingStatus = "Poor";
    pingColor = "#f97316"; // orange
  }

  const renderContent = () => (
    <div className="connection-status-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Hero Header */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
        <div 
          style={{ 
            width: '64px', height: '64px', borderRadius: '50%', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: heroBg,
            color: heroColor,
            marginBottom: '4px'
          }}
        >
          {heroIcon}
        </div>
        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: 'var(--text-1)' }}>
          {heroState}
        </h3>
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-2)', maxWidth: '280px', lineHeight: 1.4 }}>
          {heroDesc}
        </p>
      </div>

      {/* Badges / Diagnostics */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--bg-body)', padding: '16px', borderRadius: '12px' }}>
        
        {/* Network Quality (Ping) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-2)' }}>Latency (Ping)</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-raised)', padding: '4px 10px', borderRadius: '12px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: pingColor, boxShadow: `0 0 6px ${pingColor}` }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)' }}>
              {pingMs !== null ? `${pingMs}ms` : 'Timeout'}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-2)', marginLeft: '4px' }}>
              ({pingStatus})
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-2)' }}>Role</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)', background: 'var(--bg-raised)', padding: '4px 10px', borderRadius: '12px' }}>
            {isHost ? 'Host' : 'Guest'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-2)' }}>Room ID</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)', background: 'var(--bg-raised)', padding: '4px 10px', borderRadius: '12px', fontFamily: 'monospace' }}>
            {roomId}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-2)' }}>Overlay Network</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isConnected ? 'var(--success)' : 'var(--danger)' }} />
            <span style={{ fontSize: '13px', color: 'var(--text-1)' }}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        {isHost && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-2)' }}>Active Overlays</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)', background: 'var(--bg-raised)', padding: '4px 10px', borderRadius: '12px' }}>
                {overlayCount}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-2)' }}>Active Guests</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)', background: 'var(--bg-raised)', padding: '4px 10px', borderRadius: '12px' }}>
                {guestCount}
              </span>
            </div>
          </>
        )}
        {!isHost && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-2)' }}>Host Device</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: hostStatus === 'online' ? 'var(--success)' : 'var(--danger)' }} />
              <span style={{ fontSize: '13px', color: 'var(--text-1)' }}>
                {hostStatus === 'online' ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action Area */}
      {(isDisconnected || isReconnecting) && (
        <button
          onClick={forceReconnect}
          disabled={isReconnecting && retryCountdown === null}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
            background: 'var(--accent)', color: '#fff', fontSize: '15px', fontWeight: 600,
            cursor: (isReconnecting && retryCountdown === null) ? 'default' : 'pointer', 
            opacity: (isReconnecting && retryCountdown === null) ? 0.7 : 1,
            marginTop: '8px', transition: 'all 0.2s'
          }}
        >
          {isReconnecting && retryCountdown === null ? (
            <>
              <RefreshCw size={18} className="spin" />
              Connecting...
            </>
          ) : isReconnecting && retryCountdown !== null ? (
            <>
              <RefreshCw size={18} />
              Force Retry Now (Auto in {retryCountdown}s)
            </>
          ) : (
            <>
              <RefreshCw size={18} />
              Retry Connection
            </>
          )}
        </button>
      )}
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={isMobile ? "bottom-sheet-backdrop" : "overlay-backdrop"}
            onClick={() => setIsOpen(false)}
            style={!isMobile ? { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 999 } : undefined}
          />
          {isMobile ? (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bottom-sheet-modal"
            >
              <div className="bottom-sheet-handle" />
              {renderContent()}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
              animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
              exit={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="glass"
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                width: '100%',
                maxWidth: '400px',
                padding: '24px',
                borderRadius: '24px',
                zIndex: 1000,
                boxShadow: 'var(--shadow-xl)',
              }}
            >
              <button 
                onClick={() => setIsOpen(false)}
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}
              >
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              {renderContent()}
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
};
