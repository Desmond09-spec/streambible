import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AutoFitFont } from '../components/AutoFitFont';
import { VerseText } from '../components/VerseText';

import { useSyncSubscriber, usePresence } from '../hooks/useSync';
import type { VersePayload } from '../hooks/useSync';

// Extension of VersePayload for local UI state
interface ActiveVerse extends VersePayload {
  isVisible: boolean;
}

const FullScreenPage: React.FC = () => {
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

  useSyncSubscriber(
    roomId,
    (payload) => setVerse({ ...payload, isVisible: true }),
    () => setVerse((prev) => ({ ...prev, isVisible: false }))
  );

  const { hostStatus } = usePresence(roomId || "", true);

  if (roomId === null || hostStatus !== 'online') {
    if (window.location.search && !new URLSearchParams(window.location.search).get('room')) {
       return (
         <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
           <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.3)', borderRadius: '12px' }}>
             <h2 style={{ marginBottom: '1rem', color: '#ff4444' }}>Missing Room ID</h2>
             <p>Please provide a room code in the URL.<br/>Example: <code>/full-screen?room=XYZ12</code></p>
           </div>
         </div>
       );
    }
    return null;
  }

  return (
    <div 
      style={{ 
        width: '100vw', 
        height: '100vh', 
        backgroundColor: '#000000', // Solid black for full screen church display
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}
    >


      {/* Abstract background glow */}
      <div 
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100vw',
          height: '100vh',
          background: 'radial-gradient(circle, rgba(10,132,255,0.15) 0%, rgba(0,0,0,0) 70%)',
          zIndex: 0
        }}
      />

      <AnimatePresence mode="wait">
        {verse.isVisible && (
          <motion.div
            key={verse.ref} // Ensures animation triggers on verse change
            initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} // Elegant slow reveal
            style={{
              position: 'relative',
              zIndex: 1,
              width: '90vw',
              height: '80vh', // Fixed height ensures bounds
              maxWidth: '1600px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-6)'
            }}
          >
            <AutoFitFont dependencies={[verse]}>
              <div style={{ padding: '3vh 2vw' }}>
                <motion.h1 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  style={{ 
                    color: 'var(--color-accent-primary)', 
                    fontSize: 'calc(var(--font-size-3xl) * var(--font-scale))', 
                    fontWeight: 'var(--font-weight-bold)',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    marginBottom: 'calc(var(--space-6) * var(--font-scale))'
                  }}
                >
                  {verse.ref}
                </motion.h1>
                
                {verse.showPrimary && verse.primaryText && (
                  <p 
                    style={{ 
                      color: '#ffffff', 
                      fontSize: 'calc(var(--font-size-5xl) * var(--font-scale))', 
                      fontWeight: 'var(--font-weight-semibold)',
                      lineHeight: 1.4,
                      textShadow: '0 4px 20px rgba(0,0,0,0.8)',
                      textAlign: 'center'
                    }}
                  >
                    <VerseText text={verse.primaryText} showVerseNumbers={verse.showVerseNumbers ?? false} isMultiVerse={verse.ref.includes('-')} />&nbsp;&nbsp;&nbsp;
                    <span style={{ display: 'inline-block', whiteSpace: 'nowrap', fontSize: '0.65em', opacity: 0.5, fontWeight: 'var(--font-weight-medium)', letterSpacing: '0.05em' }}>[{verse.primaryVersion}]</span>
                  </p>
                )}

                {verse.showSecondary && verse.secondaryText && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    style={{ 
                      color: 'rgba(255, 255, 255, 0.7)', 
                      fontSize: 'calc(var(--font-size-4xl) * var(--font-scale))', 
                      fontWeight: 'var(--font-weight-medium)',
                      lineHeight: 1.4,
                      fontStyle: 'italic',
                      paddingTop: 'calc(var(--space-4) * var(--font-scale))',
                      marginTop: 'calc(var(--space-4) * var(--font-scale))',
                      borderTop: '1px solid rgba(255,255,255,0.1)',
                      textAlign: 'center'
                    }}
                  >
                    <VerseText text={verse.secondaryText} showVerseNumbers={verse.showVerseNumbers ?? false} isMultiVerse={verse.ref.includes('-')} />&nbsp;&nbsp;&nbsp;
                    <span style={{ display: 'inline-block', whiteSpace: 'nowrap', fontSize: '0.65em', opacity: 0.5, fontStyle: 'normal', letterSpacing: '0.05em' }}>[{verse.secondaryVersion}]</span>
                  </motion.p>
                )}
              </div>
            </AutoFitFont>


          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FullScreenPage;
