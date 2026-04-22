import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Type for the Broadcast Data
interface ActiveVerse {
  reference: string;
  textEn: string;
  textYo?: string;
  isVisible: boolean;
}

const OverlayPage: React.FC = () => {
  // Mock State - In the final version, this will be driven by Supabase Realtime
  const [verse, setVerse] = useState<ActiveVerse>({
    reference: "GENESIS 1:1",
    textEn: "In the beginning God created the heaven and the earth.",
    textYo: "Ni atetekose Olorun da orun on aiye.",
    isVisible: false
  });

  // For testing purposes, toggle visibility on click
  // In OBS, the user won't click this, it's just for development preview.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 't') {
        setVerse(prev => ({ ...prev, isVisible: !prev.isVisible }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
      {/* Dev helper text (will be removed in production) */}
      <div style={{ position: 'absolute', top: 10, left: 10, color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>
        Press 'T' to toggle verse (Dev Mode)
      </div>

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
                width: '100%',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
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
                    fontSize: 'var(--font-size-xl)', 
                    fontWeight: 'var(--font-weight-bold)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    marginBottom: 'var(--space-3)'
                  }}
                >
                  {verse.reference}
                </h2>
                
                <p 
                  style={{ 
                    color: '#ffffff', 
                    fontSize: 'var(--font-size-4xl)', 
                    fontWeight: 'var(--font-weight-semibold)',
                    lineHeight: 1.3,
                    textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                    marginBottom: verse.textYo ? 'var(--space-3)' : 0
                  }}
                >
                  {verse.textEn}
                </p>

                {verse.textYo && (
                  <p 
                    style={{ 
                      color: 'rgba(255, 255, 255, 0.75)', 
                      fontSize: 'var(--font-size-3xl)', 
                      fontWeight: 'var(--font-weight-medium)',
                      lineHeight: 1.3,
                      fontStyle: 'italic'
                    }}
                  >
                    {verse.textYo}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OverlayPage;
