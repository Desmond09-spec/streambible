import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ControllerLegacy.css';
import { parseReference, getCanonicalBookName, fetchEnglishVerse, fetchYorubaVerse } from '../services/bibleService';
import { useSyncPublisher, usePresence } from '../hooks/useSync';

const ControllerPage: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [query, setQuery] = useState('');
  const [roomId, setRoomId] = useState<string>('');
  const { pushVerse, clearScreen: broadcastClear } = useSyncPublisher(roomId);
  const [remoteAccess, setRemoteAccess] = useState(false);
  const isHost = localStorage.getItem(`streambible-host-${roomId}`) === 'true';
  const { devices, myId, hostStatus } = usePresence(roomId, false, remoteAccess);
  
  const [enText, setEnText] = useState('');
  const [enRef, setEnRef] = useState('');
  const [enExpanded, setEnExpanded] = useState(false);
  const [showEn, setShowEn] = useState(true);

  const [yoText, setYoText] = useState('');
  const [yoRef, setYoRef] = useState('');
  const [yoExpanded, setYoExpanded] = useState(false);
  const [showYo, setShowYo] = useState(true);

  const [status, setStatus] = useState<'default' | 'fetching' | 'success' | 'live' | 'error'>('default');
  const [statusMsg, setStatusMsg] = useState('Ready');
  
  const [isNetworkExpanded, setIsNetworkExpanded] = useState(false);
  
  const [isCopied, setIsCopied] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('streambible-theme') || 'light';
    setTheme(saved as 'light' | 'dark');

    // Room ID Setup
    const params = new URLSearchParams(window.location.search);
    let currentRoom = params.get('room');
    if (!currentRoom) {
      currentRoom = Math.random().toString(36).substring(2, 7).toUpperCase();
      const newUrl = `${window.location.pathname}?room=${currentRoom}`;
      window.history.replaceState({}, '', newUrl);
      localStorage.setItem(`streambible-host-${currentRoom}`, 'true');
    }
    setRoomId(currentRoom);
  }, []);

  // Debounced Live Search
  useEffect(() => {
    if (!query.trim()) {
      if (status !== 'live') {
        setStatus('default');
        setStatusMsg('Ready');
        setEnText(''); setEnRef('');
        setYoText(''); setYoRef('');
      }
      return;
    }
    
    const delayDebounceFn = setTimeout(() => {
      handleSearch(query);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setIsTransitioning(true);
    setTheme(next);
    localStorage.setItem('streambible-theme', next);
    setTimeout(() => setIsTransitioning(false), 280);
  };

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    setStatus('fetching');
    setStatusMsg('Fetching…');

    // Build canonical reference label (e.g. "Jn 3:16" → "John 3:16")
    const parsed = parseReference(searchQuery);
    let canonicalRef = searchQuery; // fallback to raw query
    if (parsed) {
      const bookName = getCanonicalBookName(parsed.bookCode);
      const versePart = parsed.verseStart
        ? `:${parsed.verseStart}${parsed.verseEnd && parsed.verseEnd !== parsed.verseStart ? `-${parsed.verseEnd}` : ''}`
        : '';
      canonicalRef = `${bookName} ${parsed.chapter}${versePart}`;
    }

    try {
      const [enResponse, yoResponse] = await Promise.all([
        fetchEnglishVerse(searchQuery).catch(() => 'Verse not found in KJV.'),
        fetchYorubaVerse(searchQuery).catch(() => 'Ẹsẹ yii ko si ninu Bibeli Yoruba.')
      ]);

      setEnText(enResponse);
      setEnRef(canonicalRef);
      
      setYoText(yoResponse);
      setYoRef(canonicalRef);

      setStatus('success');
      setStatusMsg('Ready to push');
    } catch (error) {
      setStatus('error');
      setStatusMsg('Error fetching verses');
    }
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const pushLive = () => {
    pushVerse({
      ref: enRef,
      en: enText,
      yo: yoText,
      showEn,
      showYo,
    });
    setStatus('live');
    setStatusMsg('Live on stream');
  };

  const clearScreen = () => {
    broadcastClear();
    setEnText(''); setEnRef('');
    setYoText(''); setYoRef('');
    setQuery('');
    setStatus('default');
    setStatusMsg('Ready');
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  const regenerateRoom = () => {
    if (confirm("This will disconnect all currently connected overlays and controllers. Continue?")) {
      broadcastClear(); // Wipe old screens
      const newRoom = Math.random().toString(36).substring(2, 7).toUpperCase();
      const newUrl = `${window.location.pathname}?room=${newRoom}`;
      window.history.replaceState({}, '', newUrl);
      localStorage.setItem(`streambible-host-${newRoom}`, 'true');
      setRoomId(newRoom);
    }
  };

  const SkeletonLoader = () => (
    <div style={{ width: '100%', paddingTop: '4px' }}>
      <div className="skeleton-bar" style={{ width: '100%' }}></div>
      <div className="skeleton-bar" style={{ width: '90%' }}></div>
      <div className="skeleton-bar" style={{ width: '95%' }}></div>
      <div className="skeleton-bar" style={{ width: '60%' }}></div>
    </div>
  );

  return (
    <div id="controller-legacy-wrapper" className={`theme-${theme} legacy-body${isTransitioning ? ' theme-transitioning' : ''}`} style={{ width: '100%', minHeight: '100vh', flex: 1 }}>
      
      {/* Toast Notification with Framer Motion */}
      <AnimatePresence>
        {isCopied && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '-50%', scale: 0.95 }}
            animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
            exit={{ opacity: 0, y: -10, x: '-50%', scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="copy-toast visible" 
            role="status" 
            aria-live="polite" 
            aria-atomic="true"
            style={{ x: '-50%' }}
          >
            <div className="copy-toast-icon-wrap">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="2.5 8.5 6 12 13.5 4"/>
              </svg>
            </div>
            <div className="copy-toast-body">
              <span className="copy-toast-title">Link copied</span>
              <span className="copy-toast-sub">Bible overlay link copied to clipboard</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <header className="header">
        <div className="wordmark">
          <div className="wordmark-icon">
            <svg viewBox="0 0 16 16" fill="none" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2.5" y="1.5" width="11" height="13" rx="1.5"/>
              <path d="M5 5h6M5 7.5h6M5 10h4"/>
            </svg>
          </div>
          <div className="wordmark-text">
            <span className="wordmark-name">StreamBible</span>
            <span className="wordmark-sub">Live Controller</span>
          </div>
        </div>

        <div className="header-right" style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <button className="obs-copy-btn" onClick={() => copyUrl(`${window.location.origin}/overlay?room=${roomId}`)} title="Copy Lower Third Overlay Link">
            <svg className="icon-copy" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 5H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2m4-10h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2M5 8h6"/>
            </svg>
            <span className="btn-label">Overlay</span>
          </button>
          
          <button className="obs-copy-btn" onClick={() => copyUrl(`${window.location.origin}/full-screen?room=${roomId}`)} title="Copy Full Screen Overlay Link">
            <svg className="icon-copy" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
            </svg>
            <span className="btn-label">Fullscreen</span>
          </button>

          <button className="theme-toggle" onClick={toggleTheme}>
            <span>
              {theme === 'dark' ? (
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="3"/><line x1="8" y1="1" x2="8" y2="2.5"/><line x1="8" y1="13.5" x2="8" y2="15"/><line x1="1" y1="8" x2="2.5" y2="8"/><line x1="13.5" y1="8" x2="15" y2="8"/><line x1="3.05" y1="3.05" x2="4.1" y2="4.1"/><line x1="11.9" y1="11.9" x2="12.95" y2="12.95"/><line x1="3.05" y1="12.95" x2="4.1" y2="11.9"/><line x1="11.9" y1="4.1" x2="12.95" y2="3.05"/></svg>
              ) : (
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13.5 10A5.5 5.5 0 0 1 6 2.5a5.5 5.5 0 1 0 7.5 7.5z"/></svg>
              )}
            </span>
          </button>

          <div className="ws-pill connected">
            <span className="ws-dot"></span>
            <span id="wsLabel">Connected</span>
            <svg className="ws-wifi-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 6a10.9 10.9 0 0 1 14 0"/>
              <path d="M3.5 9a7 7 0 0 1 9 0"/>
              <path d="M6 12a3.5 3.5 0 0 1 4 0"/>
              <circle cx="8" cy="14.5" r="0.75" fill="currentColor" stroke="none"/>
              <line className="ws-wifi-slash" x1="2" y1="2" x2="14" y2="14" strokeWidth="1.5"/>
            </svg>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="main">
        {/* NETWORK SECURITY PANEL */}
        <div className="network-panel">
          <div className="network-header">
            <div className="network-title-box">
              <div className="network-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0110 0v4"></path>
                </svg>
                Remote Access
              </div>
              <div className="network-status">Allow mobile devices on this Wi-Fi to control StreamBible.</div>
            </div>
            <div className="network-header-controls">
              <label className={`toggle-switch ${!isHost ? 'is-locked' : ''}`}>
                <input 
                  type="checkbox" 
                  checked={remoteAccess} 
                  onChange={(e) => setRemoteAccess(e.target.checked)} 
                  disabled={!isHost}
                />
                <span className="toggle-slider"></span>
              </label>
              <button 
                className={`network-collapse-btn ${isNetworkExpanded ? '' : 'collapsed'} ${remoteAccess ? 'active' : ''}`}
                onClick={() => setIsNetworkExpanded(!isNetworkExpanded)}
              >
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="4 10 8 6 12 10"/>
                </svg>
              </button>
            </div>
          </div>
          
          <AnimatePresence initial={false}>
            {isNetworkExpanded && remoteAccess && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                className="network-expanded visible"
                style={{ overflow: 'hidden' }}
              >
                <div className="qr-container" style={{ padding: '16px', background: 'white', borderRadius: '12px', display: 'inline-block' }}>
                   {roomId && (
                     <img 
                       src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(`${window.location.origin}/controller?room=${roomId}`)}`} 
                       alt="Scan to control session"
                       width={140}
                       height={140}
                       style={{ display: 'block' }}
                     />
                   )}
                </div>
                <div className="network-url-box" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <svg className="network-url-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0110 0v4"></path>
                  </svg>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{window.location.origin}/controller?room={roomId}</span>
                  <button onClick={() => copyUrl(`${window.location.origin}/controller?room=${roomId}`)} style={{ padding: '4px 12px' }}>Copy</button>
                  {isHost && (
                    <button onClick={regenerateRoom} style={{ padding: '4px 12px', background: 'rgba(255,0,0,0.1)', color: '#ff4444' }} title="Reset Session ID">Reset</button>
                  )}
                </div>

                {/* DEVICE MONITOR SECTION */}
                <div className="device-monitor">
                   <div className="device-monitor-header">
                     <span className="device-monitor-title">Live Sessions</span>
                   </div>
                   <div className="device-list">
                     {[...devices]
                       .sort((a, b) => {
                         if (a.id === myId) return -1;
                         if (b.id === myId) return 1;
                         if (a.isHost) return -1;
                         if (b.isHost) return 1;
                         return 0;
                       })
                       .map((dev) => {
                         const isMe = dev.id === myId;
                         return (
                           <div key={dev.id} className={`device-item ${isMe ? 'is-me' : ''}`}>
                             <div className="device-item-left">
                               <div className="device-icon-wrap">
                                 <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                   <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                                   <line x1="12" y1="18" x2="12.01" y2="18"></line>
                                 </svg>
                               </div>
                               <div className="device-info">
                                 <div className="device-name">{isMe ? 'You' : dev.name}</div>
                                 <div className="device-meta">
                                   {isMe ? dev.name : (dev.isOverlay ? 'Overlay' : 'Remote Controller')}
                                   {dev.isHost && <span className="device-badge badge-host">Host</span>}
                                   {isMe && <span className="device-badge badge-me">You</span>}
                                 </div>
                               </div>
                             </div>
                           </div>
                         );
                       })}
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SEARCH BAR (Now a form for native mobile submission) */}
        <form className="search-bar" onSubmit={onFormSubmit}>
          <span className="search-icon">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6.5" cy="6.5" r="4"/>
              <path d="M10 10L13.5 13.5"/>
            </svg>
          </span>
          <input
            type="text"
            id="searchInput"
            placeholder="John 3:16 · Romans 8:28 · Psalms 23:1…"
            autoComplete="off"
            spellCheck="false"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="search-hint">Enter ↵</kbd>
        </form>

        {/* PREVIEWS */}
        <div className="previews">
          {/* ENGLISH CARD */}
          <div className={`preview-card ${!showEn ? 'lang-disabled' : ''}`}>
            <div className="card-label">
              <span className="card-label-dot"></span>
              English
              <span className="card-label-rule"></span>
              <label className="lang-toggle" title="Show English on stream">
                <input type="checkbox" checked={showEn} onChange={(e) => setShowEn(e.target.checked)} />
                <span className="lang-toggle-track"></span>
              </label>
            </div>
            <div className={`preview-text ${enText && status !== 'fetching' ? 'has-content' : ''} ${enExpanded ? 'expanded' : ''}`}>
              {status === 'fetching' ? <SkeletonLoader /> : (enText || 'Waiting for a verse…')}
            </div>
            <div className="card-footer">
              <span className={`card-ref ${enRef && status !== 'fetching' ? 'visible' : ''}`}>{enRef}</span>
              <button 
                className={`expand-btn ${enText.length > 230 && status !== 'fetching' ? 'visible' : ''}`}
                onClick={() => setEnExpanded(!enExpanded)}
              >
                {enExpanded ? 'Show less' : 'Show more'}
              </button>
            </div>
          </div>

          {/* YORUBA CARD */}
          <div className={`preview-card ${!showYo ? 'lang-disabled' : ''}`}>
            <div className="card-label">
              <span className="card-label-dot"></span>
              Yoruba
              <span className="card-label-rule"></span>
              <label className="lang-toggle" title="Show Yoruba on stream">
                <input type="checkbox" checked={showYo} onChange={(e) => setShowYo(e.target.checked)} />
                <span className="lang-toggle-track"></span>
              </label>
            </div>
            <div className={`preview-text ${yoText && status !== 'fetching' ? 'has-content' : ''} ${yoExpanded ? 'expanded' : ''}`}>
               {status === 'fetching' ? <SkeletonLoader /> : (yoText || 'Nduro fun ẹsẹ kan…')}
            </div>
            <div className="card-footer">
              <span className={`card-ref ${yoRef && status !== 'fetching' ? 'visible' : ''}`}>{yoRef}</span>
              <button 
                className={`expand-btn ${yoText.length > 230 && status !== 'fetching' ? 'visible' : ''}`}
                onClick={() => setYoExpanded(!yoExpanded)}
              >
                {yoExpanded ? 'Show less' : 'Show more'}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ACTION BAR */}
      <footer className="action-bar">
        <div className="action-row">
          <button 
            className={`btn-live ${status === 'live' ? 'is-live' : ''}`} 
            onClick={pushLive} 
            disabled={(!enText && !yoText) || status === 'fetching'}
          >
            Push Live
          </button>
          <button className="btn-clear" onClick={clearScreen}>Clear</button>
        </div>
        <div className="status-pill" data-state={status}>
          <span className="status-dot"></span>
          <span>{statusMsg}</span>
        </div>
      </footer>
      {/* DISCONNECTED OVERLAY for Guests */}
      {!isHost && hostStatus !== 'online' && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(10px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          textAlign: 'center',
          padding: '20px'
        }}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ maxWidth: '400px' }}
          >
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>
              {hostStatus === 'denied' ? '🔒' : '📡'}
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>
              {hostStatus === 'denied' ? 'Access Revoked' : 'Host Disconnected'}
            </h2>
            <p style={{ opacity: 0.7, lineHeight: 1.5 }}>
              {hostStatus === 'denied' 
                ? "The host has disabled remote access for this session. Please contact your media team."
                : "The primary controller has gone offline or the session has been reset."}
            </p>
            <button 
              onClick={() => window.location.href = window.location.pathname}
              style={{
                marginTop: '30px',
                padding: '12px 24px',
                borderRadius: 'full',
                background: 'var(--color-accent-primary)',
                color: 'white',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Back to Home
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ControllerPage;
