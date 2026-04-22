import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Type for the Broadcast Data
interface ActiveVerse {
  reference: string;
  textEn: string;
  textYo?: string;
  isVisible: boolean;
}

const FullScreenPage: React.FC = () => {
  // Mock State - In the final version, this will be driven by Supabase Realtime
  const [verse, setVerse] = useState<ActiveVerse>({
    reference: "JOHN 3:16",
    textEn: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
    textYo: "Nitori Ọlọrun fẹ araye tobẹ̃ gẹ, ti o fi Ọmọ bibi rẹ̀ kanṣoṣo funni, ki ẹnikẹni ti o ba gbà a gbọ́ mã ba ṣegbé, ṣugbọn ki o le ni iye ainipẹkun.",
    isVisible: false
  });

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
        backgroundColor: '#000000', // Solid black for full screen church display
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}
    >
      <div style={{ position: 'absolute', top: 10, left: 10, color: 'rgba(255,255,255,0.2)', fontSize: '12px' }}>
        Press 'T' to toggle verse (Dev Mode)
      </div>

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
            key={verse.reference} // Ensures animation triggers on verse change
            initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} // Elegant slow reveal
            style={{
              position: 'relative',
              zIndex: 1,
              width: '90%',
              maxWidth: '1600px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-6)'
            }}
          >
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              style={{ 
                color: 'var(--color-accent-primary)', 
                fontSize: 'var(--font-size-3xl)', 
                fontWeight: 'var(--font-weight-bold)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase'
              }}
            >
              {verse.reference}
            </motion.h1>
            
            <p 
              style={{ 
                color: '#ffffff', 
                fontSize: 'var(--font-size-5xl)', 
                fontWeight: 'var(--font-weight-semibold)',
                lineHeight: 1.4,
                textShadow: '0 4px 20px rgba(0,0,0,0.8)'
              }}
            >
              {verse.textEn}
            </p>

            {verse.textYo && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                style={{ 
                  color: 'rgba(255, 255, 255, 0.7)', 
                  fontSize: 'var(--font-size-4xl)', 
                  fontWeight: 'var(--font-weight-medium)',
                  lineHeight: 1.4,
                  fontStyle: 'italic',
                  paddingTop: 'var(--space-4)',
                  borderTop: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                {verse.textYo}
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FullScreenPage;
