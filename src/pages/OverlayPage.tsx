import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AutoFitFont } from '../components/AutoFitFont';

import { useSyncSubscriber, usePresence } from '../hooks/useSync';
import type { VersePayload } from '../hooks/useSync';

// Extension of VersePayload for local UI state
interface ActiveVerse extends VersePayload {
  isVisible: boolean;
}

const OverlayPage: React.FC = () => {
  const [roomId, setRoomId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRoomId(params.get('room'));
  }, []);
  const [verse, setVerse] = useState<ActiveVerse>({
    ref: "",
    primaryText: "",
    primaryVersion: "",
    secondaryText: "",
    secondaryVersion: "",
    showPrimary: true,
    showSecondary: true,
    source: 'youversion',
    isVisible: false
  });

  useSyncSubscriber(
    roomId,
    (payload) => setVerse({ ...payload, isVisible: true }),
    () => setVerse((prev) => ({ ...prev, isVisible: false }))
  );

  const { hostStatus } = usePresence(roomId || "", true);

  if (roomId === null || hostStatus === 'offline') {
    // Only show the error if we've checked the URL and it's definitely missing
    if (window.location.search && !new URLSearchParams(window.location.search).get('room')) {
       return (
         <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
           <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.3)', borderRadius: '12px' }}>
             <h2 style={{ marginBottom: '1rem', color: '#ff4444' }}>Missing Room ID</h2>
             <p>Please provide a room code in the URL.<br/>Example: <code>/overlay?room=XYZ12</code></p>
           </div>
         </div>
       );
    }
    // Still loading or checking
    return null;
  }

  return (
    <div 
      style={{ 
        width: '100vw', 
        height: '100vh', 
        backgroundColor: 'transparent', // Crucial for OBS Browser Source
        position: 'relative',
        overflow: 'hidden'
      }}
    >


      <AnimatePresence>
        {verse.isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ 
              type: "spring", 
              stiffness: 260, 
              damping: 25,
              mass: 1.2
            }}
            style={{
              position: 'absolute',
              bottom: '40px',
              left: '5%',
              right: '5%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}
          >
            <div 
              style={{
                background: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-6) var(--space-8)',
                boxShadow: '0 30px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                maxWidth: '1400px',
                width: '92vw',
                height: '35vh', // Fixed height so the content shrinks instead of pushing the box down
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <AutoFitFont dependencies={[verse]}>
              {/* Subtle light sweep effect */}
              <motion.div
                initial={{ left: '-100%' }}
                animate={{ left: '200%' }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 5 }}
                style={{
                  position: 'absolute',
                  top: 0,
                  width: '30%',
                  height: '100%',
                  background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent)',
                  transform: 'skewX(-20deg)',
                  zIndex: 0
                }}
              />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <h2 
                  style={{ 
                    color: 'var(--color-accent-primary)', 
                    fontSize: 'calc(var(--font-size-xl) * var(--font-scale))', 
                    fontWeight: 'var(--font-weight-bold)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    marginBottom: 'calc(var(--space-3) * var(--font-scale))'
                  }}
                >
                  {verse.ref}
                </h2>
                
                {verse.showPrimary && verse.primaryText && (
                  <p 
                    style={{ 
                      color: '#ffffff', 
                      fontSize: 'calc(var(--font-size-4xl) * var(--font-scale))', 
                      fontWeight: 'var(--font-weight-semibold)',
                      lineHeight: 1.3,
                      textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                      marginBottom: (verse.showSecondary && verse.secondaryText) ? 'calc(var(--space-3) * var(--font-scale))' : 0
                    }}
                  >
                    {verse.primaryText}
                  </p>
                )}

                {verse.showSecondary && verse.secondaryText && (
                  <p 
                    style={{ 
                      color: 'rgba(255, 255, 255, 0.75)', 
                      fontSize: 'calc(var(--font-size-3xl) * var(--font-scale))', 
                      fontWeight: 'var(--font-weight-medium)',
                      lineHeight: 1.3,
                      fontStyle: 'italic'
                    }}
                  >
                    {verse.secondaryText}
                  </p>
                )}
              </div>
              
              {/* ATTRIBUTION */}
              {verse.source === 'youversion' && (
                <div style={{ position: 'absolute', bottom: '12px', right: '20px', opacity: 0.35 }}>
                  <img src="/youversion-logo.svg" alt="Provided by YouVersion" style={{ width: '100px' }} />
                </div>
              )}
              {verse.source === 'biblebrain' && (
                <div style={{ position: 'absolute', bottom: '12px', right: '20px', opacity: 0.5 }}>
                  <span style={{ color: '#fff', fontSize: '12px', fontWeight: 'bold', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Powered by Bible Brain</span>
                </div>
              )}
              {verse.source === 'local' && (
                <div style={{ position: 'absolute', bottom: '12px', right: '20px', opacity: 0.5 }}>
                  <span style={{ color: '#fff', fontSize: '12px', fontWeight: 'bold', letterSpacing: '0.05em', textTransform: 'uppercase' }}>StreamBible Local Data</span>
                </div>
              )}
              </AutoFitFont>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OverlayPage;
