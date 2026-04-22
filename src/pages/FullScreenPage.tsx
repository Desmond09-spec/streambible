import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AutoFitFont } from '../components/AutoFitFont';

import { useSyncSubscriber } from '../hooks/useSync';
import type { VersePayload } from '../hooks/useSync';

// Extension of VersePayload for local UI state
interface ActiveVerse extends VersePayload {
  isVisible: boolean;
}

const FullScreenPage: React.FC = () => {
  const [verse, setVerse] = useState<ActiveVerse>({
    ref: "",
    en: "",
    yo: "",
    showEn: true,
    showYo: true,
    isVisible: false
  });

  useSyncSubscriber(
    (payload) => setVerse({ ...payload, isVisible: true }),
    () => setVerse((prev) => ({ ...prev, isVisible: false }))
  );

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
          width: '80vw',
          height: '80vh',
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
              
              {verse.showEn && (
                <p 
                  style={{ 
                    color: '#ffffff', 
                    fontSize: 'calc(var(--font-size-5xl) * var(--font-scale))', 
                    fontWeight: 'var(--font-weight-semibold)',
                    lineHeight: 1.4,
                    textShadow: '0 4px 20px rgba(0,0,0,0.8)'
                  }}
                >
                  {verse.en}
                </p>
              )}

              {verse.showYo && verse.yo && (
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
                    borderTop: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  {verse.yo}
                </motion.p>
              )}
            </AutoFitFont>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FullScreenPage;
