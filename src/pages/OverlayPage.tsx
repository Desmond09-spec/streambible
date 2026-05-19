import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AutoFitFont } from '../components/AutoFitFont';
import { VerseText } from '../components/VerseText';

import { useWebRTCNode } from '../hooks/useSync';
import type { VersePayload } from '../hooks/useSync';

// Extension of VersePayload for local UI state
interface ActiveVerse extends VersePayload {
  isVisible: boolean;
}

const OverlayPage: React.FC = () => {
  const [roomId, setRoomId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    Promise.resolve().then(() => setRoomId(params.get('room')));
  }, []);
  const [verse, setVerse] = useState<ActiveVerse>({
    ref: "",
    primaryText: "",
    primaryVersion: "",
    secondaryText: "",
    secondaryVersion: "",
    showPrimary: true,
    showSecondary: true,
    primarySource: 'api.bible',
    secondarySource: 'api.bible',
    isVisible: false
  });

  const { hostStatus } = useWebRTCNode(roomId, false, true, false, {
    onVerseUpdate: (payload) => setVerse({ ...payload, isVisible: true }),
    onClear: () => setVerse((prev) => ({ ...prev, isVisible: false })),
    onRoomReset: () => window.location.reload()
  });

  // Auto-clear the screen gracefully if the host disconnects
  useEffect(() => {
    if (hostStatus !== 'online') {
      const id = setTimeout(() => setVerse(prev => ({ ...prev, isVisible: false })), 0);
      return () => clearTimeout(id);
    }
  }, [hostStatus]);

  if (roomId === null) {
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
            initial={{ opacity: 0, x: -50, filter: 'blur(10px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -50, filter: 'blur(10px)' }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              mass: 1
            }}
            style={{
              position: 'absolute',
              bottom: '5vh',
              left: '4vw',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'flex-end',
              maxWidth: '65vw' // Restrict width so it doesn't span the whole screen
            }}
          >
            <div 
              style={{
                background: 'rgba(12, 12, 14, 0.85)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderLeft: '4px solid var(--color-accent-primary)',
                borderRadius: '16px',
                padding: '1.5rem 2.5rem',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
                display: 'inline-block',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <AutoFitFont dependencies={[verse]} maxHeightPx={window.innerHeight * 0.40} textAlign="left">
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <h2 
                    style={{ 
                      color: 'var(--color-accent-primary)', 
                      fontSize: 'calc(1rem * var(--font-scale))', 
                      fontWeight: '800',
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      marginBottom: 'calc(0.75rem * var(--font-scale))',
                      textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                    }}
                  >
                    {verse.ref}
                  </h2>
                  
                  {verse.showPrimary && verse.primaryText && (
                    <p 
                      style={{ 
                        color: '#ffffff', 
                        fontSize: 'calc(2.5vw * var(--font-scale))', 
                        fontWeight: '600',
                        lineHeight: 1.4,
                        textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                        marginBottom: (verse.showSecondary && verse.secondaryText) ? 'calc(1rem * var(--font-scale))' : 0,
                        textAlign: 'left'
                      }}
                    >
                      <VerseText text={verse.primaryText} showVerseNumbers={verse.showVerseNumbers ?? false} isMultiVerse={verse.ref.includes('-')} />&nbsp;&nbsp;&nbsp;
                      <span style={{ display: 'inline-block', whiteSpace: 'nowrap', fontSize: '0.6em', opacity: 0.6, fontWeight: '500', letterSpacing: '0.05em', transform: 'translateY(-2px)' }}>[{verse.primaryVersion}]</span>
                    </p>
                  )}

                  {verse.showSecondary && verse.secondaryText && (
                    <p 
                      style={{ 
                        color: 'rgba(255, 255, 255, 0.75)', 
                        fontSize: 'calc(2vw * var(--font-scale))', 
                        fontWeight: '400',
                        lineHeight: 1.4,
                        fontStyle: 'italic',
                        textAlign: 'left'
                      }}
                    >
                      <VerseText text={verse.secondaryText} showVerseNumbers={verse.showVerseNumbers ?? false} isMultiVerse={verse.ref.includes('-')} />&nbsp;&nbsp;&nbsp;
                      <span style={{ display: 'inline-block', whiteSpace: 'nowrap', fontSize: '0.6em', opacity: 0.6, fontStyle: 'normal', letterSpacing: '0.05em', transform: 'translateY(-2px)' }}>[{verse.secondaryVersion}]</span>
                    </p>
                  )}
                </div>
              </AutoFitFont>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OverlayPage;
