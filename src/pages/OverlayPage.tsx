import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AutoFitFont } from '../components/AutoFitFont';
import { VerseText } from '../components/VerseText';

import { FumsExecutor } from '../components/FumsExecutor';
import type { VersePayload } from '../context/SessionContext';

// Extension of VersePayload for local UI state
interface ActiveVerse extends VersePayload {
  isVisible: boolean;
}

const OverlayPage: React.FC = () => {
  const [verse, setVerse] = useState<ActiveVerse>({
    ref: "",
    primaryText: "",
    primaryVersion: "",
    secondaryText: "",
    secondaryVersion: "",
    showPrimary: true,
    showSecondary: true,
    primarySource: 'local',
    secondarySource: 'local',
    isVisible: false
  });

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let destroyed = false;

    const connect = () => {
      if (destroyed) return;
      // Works both when loaded via http://localhost:3456 (OBS) and http://localhost:5173 (dev)
      const wsUrl = `ws://${window.location.hostname}:${window.location.port || 3456}/ws-relay`;
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        ws!.send(JSON.stringify({ type: 'register', role: 'overlay' }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'push_verse') {
            setVerse({ ...data.payload, isVisible: true });
          } else if (data.type === 'clear_screen') {
            setVerse((prev) => ({ ...prev, isVisible: false }));
          } else if (data.type === 'ping') {
            // Bounce back so the controller can measure round-trip latency
            ws!.send(JSON.stringify({ type: 'pong', ts: data.ts }));
          }
        } catch (_) { /* ignore */ }
      };

      ws.onclose = () => {
        if (!destroyed) {
          reconnectTimer = setTimeout(connect, 2000);
        }
      };

      ws.onerror = () => ws?.close();
    };

    connect();

    return () => {
      destroyed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      ws?.close();
    };
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
            <FumsExecutor fumsToken={verse.fums} />
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
                      <VerseText text={verse.primaryText} source={verse.primarySource} showVerseNumbers={verse.showVerseNumbers ?? false} isMultiVerse={verse.ref.includes('-')} />&nbsp;&nbsp;&nbsp;
                      <a href="/#/copyright" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', whiteSpace: 'nowrap', fontSize: '0.6em', opacity: 0.6, fontWeight: '500', letterSpacing: '0.05em', transform: 'translateY(-2px)', color: 'inherit', textDecoration: 'none' }}>[{verse.primaryVersion}]</a>
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
                      <VerseText text={verse.secondaryText} source={verse.secondarySource} showVerseNumbers={verse.showVerseNumbers ?? false} isMultiVerse={verse.ref.includes('-')} />&nbsp;&nbsp;&nbsp;
                      <a href="/#/copyright" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', whiteSpace: 'nowrap', fontSize: '0.6em', opacity: 0.6, fontStyle: 'normal', letterSpacing: '0.05em', transform: 'translateY(-2px)', color: 'inherit', textDecoration: 'none' }}>[{verse.secondaryVersion}]</a>
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
