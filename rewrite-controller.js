const fs = require('fs');

const destPath = 'C:\\Users\\danie\\OneDrive\\Documents\\Projects\\Streambible-suite\\bible-overlay\\streambible-dual\\src\\pages\\ControllerPage.tsx';

const content = `import React, { useState, useEffect, useRef } from 'react';
import './ControllerLegacy.css';
import { fetchEnglishVerse, fetchYorubaVerse } from '../services/bibleService';

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

  useEffect(() => {
    const saved = localStorage.getItem('streambible-theme') || 'light';
    setTheme(saved as 'light' | 'dark');
  }, []);

  useEffect(() => {
    document.body.className = \`theme-\${theme}\`;
  }, [theme]);

  const toggleTheme = () => {
    document.body.classList.add('theme-transitioning');
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('streambible-theme', next);
    setTimeout(() => document.body.classList.remove('theme-transitioning'), 280);
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    setStatus('fetching');
    setStatusMsg('Fetching…');
    setEnText(''); setEnRef(''); setEnExpanded(false);
    setYoText(''); setYoRef(''); setYoExpanded(false);

    try {
      let fetchedEn = '';
      let fetchedYo = '';
      
      try {
        fetchedEn = await fetchEnglishVerse(query);
      } catch (e) {}
      
      try {
        fetchedYo = await fetchYorubaVerse(query);
      } catch (e) {}

      if (!fetchedEn && !fetchedYo) {
        throw new Error('no-content');
      }

      setEnText(fetchedEn || '—');
      setEnRef(query.toUpperCase());
      
      setYoText(fetchedYo || '—');
      setYoRef(query.toUpperCase());

      setStatus('success');
      setStatusMsg('Ready to push');

    } catch (e) {
      setStatus('error');
      setStatusMsg('Nothing found — try "John 3:16" format');
    }
  };

  const pushLive = () => {
    setStatus('live');
    setStatusMsg('Live on stream');
    // TODO: Send via Supabase
  };

  const clearScreen = () => {
    setEnText(''); setEnRef('');
    setYoText(''); setYoRef('');
    setQuery('');
    setStatus('default');
    setStatusMsg('Ready');
    // TODO: Send via Supabase
  };

  return (
    <div className="controller-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', minHeight: '100vh', padding: '24px 24px 40px', gap: '24px' }}>
      {/* Toast Notification */}
      <div className="copy-toast" id="copyToast" role="status" aria-live="polite" aria-atomic="true">
        <div className="copy-toast-icon-wrap">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="2.5 8.5 6 12 13.5 4"/>
          </svg>
        </div>
        <div className="copy-toast-body">
          <span className="copy-toast-title">Link copied</span>
          <span className="copy-toast-sub">Bible overlay link copied to clipboard</span>
        </div>
      </div>

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
          <button className="obs-copy-btn" onClick={() => alert('Supabase link coming soon!')}>
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
            <span>Connected</span>
            <svg className="ws-wifi-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 6a10.9 10.9 0 0 1 14 0"/>
              <path d="M3.5 9a7 7 0 0 1 9 0"/>
              <path d="M6 12a3.5 3.5 0 0 1 4 0"/>
              <circle cx="8" cy="14.5" r="0.75" fill="currentColor" stroke="none"/>
            </svg>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="main">
        {/* SEARCH BAR */}
        <div className="search-bar">
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
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <kbd className="search-hint">Enter ↵</kbd>
        </div>

        {/* PREVIEWS */}
        <div className="previews">
          {/* ENGLISH CARD */}
          <div className={\`preview-card \${!showEn ? 'lang-disabled' : ''}\`}>
            <div className="card-label">
              <span className="card-label-dot"></span>
              English
              <span className="card-label-rule"></span>
              <label className="lang-toggle" title="Show English on stream">
                <input type="checkbox" checked={showEn} onChange={(e) => setShowEn(e.target.checked)} />
                <span className="lang-toggle-track"></span>
              </label>
            </div>
            <div className={\`preview-text \${enText ? 'has-content' : ''} \${enExpanded ? 'expanded' : ''}\`}>
              {enText || 'Waiting for a verse…'}
            </div>
            <div className="card-footer">
              <span className={\`card-ref \${enRef ? 'visible' : ''}\`}>{enRef}</span>
              <button 
                className={\`expand-btn \${enText.length > 230 ? 'visible' : ''}\`}
                onClick={() => setEnExpanded(!enExpanded)}
              >
                {enExpanded ? 'Show less' : 'Show more'}
              </button>
            </div>
          </div>

          {/* YORUBA CARD */}
          <div className={\`preview-card \${!showYo ? 'lang-disabled' : ''}\`}>
            <div className="card-label">
              <span className="card-label-dot"></span>
              Yoruba
              <span className="card-label-rule"></span>
              <label className="lang-toggle" title="Show Yoruba on stream">
                <input type="checkbox" checked={showYo} onChange={(e) => setShowYo(e.target.checked)} />
                <span className="lang-toggle-track"></span>
              </label>
            </div>
            <div className={\`preview-text \${yoText ? 'has-content' : ''} \${yoExpanded ? 'expanded' : ''}\`}>
              {yoText || 'Nduro fun ẹsẹ kan…'}
            </div>
            <div className="card-footer">
              <span className={\`card-ref \${yoRef ? 'visible' : ''}\`}>{yoRef}</span>
              <button 
                className={\`expand-btn \${yoText.length > 230 ? 'visible' : ''}\`}
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
            className={\`btn-live \${status === 'live' ? 'is-live' : ''}\`} 
            onClick={pushLive} 
            disabled={!enText && !yoText}
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
`;

fs.writeFileSync(destPath, content);
console.log('ControllerPage.tsx successfully recreated.');
