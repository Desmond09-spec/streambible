import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ControllerLegacy.css';
import { parseReference, getCanonicalBookName } from '../services/bibleService';

const ControllerPage: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [query, setQuery] = useState('');
  
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
  const [remoteAccess, setRemoteAccess] = useState(false);
  
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('streambible-theme') || 'light';
    setTheme(saved as 'light' | 'dark');
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
    const wrapper = document.getElementById('controller-legacy-wrapper');
    if (wrapper) wrapper.classList.add('theme-transitioning');
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('streambible-theme', next);
    setTimeout(() => {
      if (wrapper) wrapper.classList.remove('theme-transitioning');
    }, 280);
  };

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    setStatus('fetching');
    setStatusMsg('Fetching…');

    // MOCKED DELAY for skeleton UI demonstration
    await new Promise(resolve => setTimeout(resolve, 800));

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

    // Mocked responses
    setEnText('For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.');
    setEnRef(canonicalRef);
    
    setYoText('Nitori Ọlọrun fẹ araye to bẹ̃ gẹ, ti o fi Ọmọ bibi rẹ̀ kanṣoṣo funni, ki ẹnikẹni ti o ba gbà a gbọ́ mã ba ṣegbe, ṣugbọn ki o le ni iye ainipẹkun.');
    setYoRef(canonicalRef);

    setStatus('success');
    setStatusMsg('Ready to push');
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const pushLive = () => {
    setStatus('live');
    setStatusMsg('Live on stream');
  };

  const clearScreen = () => {
    setEnText(''); setEnRef('');
    setYoText(''); setYoRef('');
    setQuery('');
    setStatus('default');
    setStatusMsg('Ready');
  };

  const handleCopyLink = () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
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
    <div id="controller-legacy-wrapper" className={`theme-${theme} legacy-body`} style={{ width: '100%', minHeight: '100vh', flex: 1 }}>
      
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

        <div className="header-right">
          <button className="obs-copy-btn" onClick={handleCopyLink}>
            <svg className="icon-copy" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 5H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2m4-10h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2M5 8h6"/>
            </svg>
            <svg className="icon-link" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.71"/>
            </svg>
            <span className="btn-label">Copy Link</span>
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
              <label className="toggle-switch">
                <input type="checkbox" checked={remoteAccess} onChange={(e) => setRemoteAccess(e.target.checked)} />
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
                <div className="qr-container">
                   {/* QR Code Placeholder */}
                   <div style={{ width: 140, height: 140, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, color: '#999', fontSize: 12 }}>QR Code</div>
                </div>
                <div className="network-url-box">
                  <svg className="network-url-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0110 0v4"></path>
                  </svg>
                  <span>http://192.168.x.x:5173/controller</span>
                  <button onClick={handleCopyLink}>Copy</button>
                </div>

                {/* DEVICE MONITOR SECTION */}
                <div className="device-monitor">
                   <div className="device-monitor-header">
                     <span className="device-monitor-title">Live Sessions</span>
                   </div>
                   <div className="device-list">
                     {/* Mock Session */}
                     <div className="device-item is-me">
                       <div className="device-item-left">
                         <div className="device-icon-wrap">
                           <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                              <line x1="12" y1="18" x2="12.01" y2="18"></line>
                           </svg>
                         </div>
                         <div className="device-info">
                           <div className="device-name">Current Device</div>
                           <div className="device-meta">
                             localhost
                             <span className="device-badge badge-host">Host</span>
                             <span className="device-badge badge-me">You</span>
                           </div>
                         </div>
                       </div>
                     </div>
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
    </div>
  );
};

export default ControllerPage;
