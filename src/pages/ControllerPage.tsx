import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreHorizontal, ExternalLink, MonitorUp, Sparkles } from 'lucide-react';
import './ControllerLegacy.css';
import { parseReference, getCanonicalBookName, fetchVerse, fetchAllYouVersionVersions, curatedVersions, type TriageCategory } from '../services/bibleService';
import { useSyncPublisher, usePresence, useHeartbeat, useDiscovery } from '../hooks/useSync';
import { supabase } from '../lib/supabase';
import WalkthroughOverlay from '../components/WalkthroughOverlay';
import { CustomDropdown } from '../components/CustomDropdown';

const ControllerPage: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [query, setQuery] = useState('');
  const [roomId, setRoomId] = useState<string>('');
  const [remoteAccess, setRemoteAccess] = useState(false);
  const isHost = localStorage.getItem(`streambible-host-${roomId}`) === 'true';
  const { pushVerse, clearScreen: broadcastClear } = useSyncPublisher(roomId);
  const { devices, myId, hostStatus } = usePresence(roomId, false, remoteAccess);
  const wsConnected = hostStatus === 'online';
  
  // Discovery & Heartbeat
  // Room is always discoverable, regardless of Remote Access toggle
  useHeartbeat(roomId, isHost, true);
  const [discoveryEnabled, setDiscoveryEnabled] = useState(false);
  const { nearbySessions, refresh: refreshDiscovery, isDiscovering } = useDiscovery(discoveryEnabled);
  
  // Request State
  const [joinRequest, setJoinRequest] = useState<{ roomId: string, deviceId: string, name: string } | null>(null);
  const [incomingRequest, setIncomingRequest] = useState<{ roomId: string, deviceId: string, name: string } | null>(null);
  const [requestStatus, setRequestStatus] = useState<'idle' | 'pending' | 'accepted' | 'declined'>('idle');
  
  const [primaryVersion, setPrimaryVersion] = useState(() => localStorage.getItem('streambible-primary-version') || '114');
  const [secondaryVersion, setSecondaryVersion] = useState(() => localStorage.getItem('streambible-secondary-version') || '1');
  const [showPrimary, setShowPrimary] = useState(() => localStorage.getItem('streambible-show-primary') !== 'false');
  const [showSecondary, setShowSecondary] = useState(() => localStorage.getItem('streambible-show-secondary') !== 'false');

  const [primaryText, setPrimaryText] = useState('');
  const [primaryRef, setPrimaryRef] = useState('');
  const [primaryExpanded, setPrimaryExpanded] = useState(false);

  const [secondaryText, setSecondaryText] = useState('');
  const [secondaryRef, setSecondaryRef] = useState('');
  const [secondaryExpanded, setSecondaryExpanded] = useState(false);

  const [extraVersions, setExtraVersions] = useState<any[]>([]);
  const [fetchingExtra, setFetchingExtra] = useState(false);
  const [showExtraVersions, setShowExtraVersions] = useState(false);

  const [status, setStatus] = useState<'default' | 'fetching' | 'success' | 'live' | 'error'>('default');
  const [statusMsg, setStatusMsg] = useState('Ready');

  useEffect(() => {
    localStorage.setItem('streambible-primary-version', primaryVersion);
    localStorage.setItem('streambible-secondary-version', secondaryVersion);
    localStorage.setItem('streambible-show-primary', showPrimary.toString());
    localStorage.setItem('streambible-show-secondary', showSecondary.toString());
  }, [primaryVersion, secondaryVersion, showPrimary, showSecondary]);

  const loadExtraVersions = async () => {
    if (fetchingExtra || extraVersions.length > 0) return;
    setFetchingExtra(true);
    try {
      const data = await fetchAllYouVersionVersions();
      setExtraVersions(data);
      setShowExtraVersions(true);
    } catch (e) {
      console.error(e);
      alert('Failed to load extra versions.');
    } finally {
      setFetchingExtra(false);
    }
  };

  const [isNetworkExpanded, setIsNetworkExpanded] = useState(false);
  
  const [copiedType, setCopiedType] = useState<'overlay' | 'fullscreen' | 'controller' | null>(null);
  const [showFallbackToast, setShowFallbackToast] = useState(false);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [fallbackType, setFallbackType] = useState<'biblebrain' | 'local' | null>(null);
  const [triageReason, setTriageReason] = useState<TriageCategory>(null);
  const [fallbackOriginalVersion, setFallbackOriginalVersion] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Walkthrough State
  const [showTour, setShowTour] = useState(false);

  const tourSteps = [
    {
      id: 'welcome',
      title: 'Welcome to StreamBible',
      text: 'A clean, simple, and powerful way to present scripture on your livestream. Let\'s quickly go over the basics.'
    },
    {
      id: 'search',
      title: 'Search in Milliseconds',
      text: 'Type a reference like "John 3:16" in the search bar. StreamBible will instantly fetch it from YouVersion’s library of over 3,000 translations.'
    },
    {
      id: 'preview',
      title: 'Dual Language Support',
      text: 'Preview your text before it goes live. You can even toggle a secondary translation (like Yoruba) to display side-by-side with English.'
    },
    {
      id: 'broadcast',
      title: 'Push to OBS',
      text: 'Once you are happy with the preview, click "Push Live". Copy the overlay link from the top right and paste it into an OBS Browser Source to see it on screen!'
    }
  ];

  useEffect(() => {
    const saved = localStorage.getItem('streambible-theme') || 'light';
    setTheme(saved as 'light' | 'dark');

    const hasSeenTour = localStorage.getItem('streambible-tour-seen');
    if (!hasSeenTour) {
      setTimeout(() => setShowTour(true), 1000); // Small delay to let UI load
    }

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

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setIsTransitioning(true);
    setTheme(next);
    localStorage.setItem('streambible-theme', next);
    setTimeout(() => setIsTransitioning(false), 280);
  };

  useEffect(() => {
    if (!query.trim()) return;
    const timerId = setTimeout(() => {
      handleSearch(query);
    }, 900);
    return () => clearTimeout(timerId);
  }, [query, primaryVersion, secondaryVersion]);

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    setStatus('fetching');
    setStatusMsg('Fetching…');

    const parsed = parseReference(searchQuery);
    let canonicalRef = searchQuery;
    if (parsed) {
      const bookName = getCanonicalBookName(parsed.bookCode);
      const versePart = parsed.verseStart
        ? `:${parsed.verseStart}${parsed.verseEnd && parsed.verseEnd !== parsed.verseStart ? `-${parsed.verseEnd}` : ''}`
        : '';
      canonicalRef = `${bookName} ${parsed.chapter}${versePart}`;
    }

    try {
      let pText = 'Verse not found.';
      let sText = 'Verse not found.';
      let isLocalFallback = false;
      let pSource: 'youversion' | 'biblebrain' | 'local' = 'youversion';
      let sSource: 'youversion' | 'biblebrain' | 'local' = 'youversion';
      let overallTriage: TriageCategory = null;

      try {
         const pRes = await fetchVerse(primaryVersion, searchQuery);
         pText = pRes.text;
         pSource = pRes.source;
         if (pRes.triageReason) overallTriage = pRes.triageReason;
         if (pSource === 'local') isLocalFallback = true;
      } catch (e: any) {
         if (e.message === "Verse not found." || e.message === "Unable to parse reference.") {
            overallTriage = 'user_input';
         } else if (e.message === "YouVersion fetch failed") {
            // Already handled by fetchVerse assigning triageReason, but just in case
         }
      }

      if (isLocalFallback) {
          setIsUsingFallback(true);
          setFallbackType('local');
          setTriageReason(overallTriage);
          setFallbackOriginalVersion(primaryVersion);
          setPrimaryVersion('1');
          setSecondaryVersion('2079');
          setShowFallbackToast(true);
          setTimeout(() => setShowFallbackToast(false), 5000);
          
          try { 
            const pRes = await fetchVerse('1', searchQuery);
            pText = pRes.text; pSource = pRes.source;
          } catch(e){}
          try { 
            const sRes = await fetchVerse('2079', searchQuery);
            sText = sRes.text; sSource = sRes.source;
          } catch(e){}
      } else {
          try {
             const sRes = await fetchVerse(secondaryVersion, searchQuery);
             sText = sRes.text;
             sSource = sRes.source;
             if (sRes.triageReason && !overallTriage) overallTriage = sRes.triageReason;
             
             if (sSource === 'local') {
                 setIsUsingFallback(true);
                 setFallbackType('local');
                 setTriageReason(overallTriage);
                 setFallbackOriginalVersion(secondaryVersion);
                 setPrimaryVersion('1');
                 setSecondaryVersion('2079');
                 setShowFallbackToast(true);
                 setTimeout(() => setShowFallbackToast(false), 5000);
                 try { 
                   const pRes = await fetchVerse('1', searchQuery);
                   pText = pRes.text; pSource = pRes.source;
                 } catch(e){}
                 try { 
                   const ssRes = await fetchVerse('2079', searchQuery);
                   sText = ssRes.text; sSource = ssRes.source;
                 } catch(e){}
             } else if (pSource === 'biblebrain' || sSource === 'biblebrain') {
                 setIsUsingFallback(true);
                 setFallbackType('biblebrain');
                 setTriageReason(overallTriage);
                 setFallbackOriginalVersion(null);
                 setShowFallbackToast(true);
                 setTimeout(() => setShowFallbackToast(false), 5000);
             } else {
                 setIsUsingFallback(false);
                 setFallbackType(null);
                 setTriageReason(overallTriage);
                 setFallbackOriginalVersion(null);
                 if (overallTriage) {
                    setShowFallbackToast(true);
                    setTimeout(() => setShowFallbackToast(false), 5000);
                 }
             }
          } catch (e: any) {
             if (e.message === "Verse not found." || e.message === "Unable to parse reference.") {
                if (!overallTriage) overallTriage = 'user_input';
             }
             setTriageReason(overallTriage);
             if (overallTriage) {
                setShowFallbackToast(true);
                setTimeout(() => setShowFallbackToast(false), 5000);
             }
          }
      }

      setPrimaryText(pText);
      setPrimaryRef(canonicalRef);
      
      setSecondaryText(sText);
      setSecondaryRef(canonicalRef);

      // Catch-all: if nothing was retrieved, ensure the user sees a toast
      if (pText === 'Verse not found.' && sText === 'Verse not found.') {
        setTriageReason('user_input');
        setShowFallbackToast(true);
        setTimeout(() => setShowFallbackToast(false), 5000);
        setStatus('success');
        setStatusMsg('Verse not found');
      } else {
        setStatus('success');
        setStatusMsg('Ready to push');
      }
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
    const pVersionObj = curatedVersions.find(v => v.id === primaryVersion) || extraVersions.find(v => v.id.toString() === primaryVersion);
    const sVersionObj = curatedVersions.find(v => v.id === secondaryVersion) || extraVersions.find(v => v.id.toString() === secondaryVersion);

    pushVerse({
      ref: primaryRef,
      primaryText: primaryText,
      primaryVersion: pVersionObj ? (pVersionObj.abbreviation || pVersionObj.local_abbreviation) : '',
      secondaryText: secondaryText,
      secondaryVersion: sVersionObj ? (sVersionObj.abbreviation || sVersionObj.local_abbreviation) : '',
      showPrimary: showPrimary,
      showSecondary: showSecondary,
      source: fallbackType || 'youversion'
    });
    setStatus('live');
    setStatusMsg('Live on stream');
  };

  const clearScreen = () => {
    broadcastClear();
    setPrimaryText(''); setPrimaryRef('');
    setSecondaryText(''); setSecondaryRef('');
    setQuery('');
    setStatus('default');
    setStatusMsg('Ready');
  };

  useEffect(() => {
    if (!roomId || !isHost) return;
    const channel = supabase.channel(`streambible-sync-${roomId}`);
    
    channel.on('broadcast', { event: 'JOIN_REQUEST' }, ({ payload }) => {
       if (payload.deviceId !== myId) {
         setIncomingRequest({
           roomId: payload.fromRoom,
           deviceId: payload.deviceId,
           name: payload.name
         });
       }
    }).subscribe();

    return () => { channel.unsubscribe(); };
  }, [roomId, isHost, myId]);

  useEffect(() => {
    if (requestStatus !== 'pending' || !joinRequest) return;
    
    const channel = supabase.channel(`streambible-sync-${joinRequest.roomId}`);
    channel.on('broadcast', { event: 'JOIN_RESPONSE' }, ({ payload }) => {
       if (payload.targetDeviceId === myId) {
          if (payload.accepted) {
            setRequestStatus('accepted');
            const newUrl = `${window.location.pathname}?room=${payload.newRoomId}`;
            window.location.href = newUrl;
          } else {
            setRequestStatus('declined');
            setJoinRequest(null);
            setTimeout(() => setRequestStatus('idle'), 4000);
          }
       }
    }).subscribe();

    return () => { channel.unsubscribe(); };
  }, [isHost, requestStatus, myId, joinRequest]);

  const handleJoinRequest = async (targetRoomId: string) => {
    if (targetRoomId === roomId) return;
    setRequestStatus('pending');
    setJoinRequest({ roomId: targetRoomId, deviceId: '', name: 'Target Room' });

    const channel = supabase.channel(`streambible-sync-${targetRoomId}`);
    await channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.send({
          type: 'broadcast',
          event: 'JOIN_REQUEST',
          payload: {
            fromRoom: roomId,
            deviceId: myId,
            name: getFriendlyDeviceName()
          }
        });
      }
    });
  };

  const handleResponse = async (accepted: boolean) => {
    if (!incomingRequest) return;
    
    const channel = supabase.channel(`streambible-sync-${roomId}`);
    await channel.send({
      type: 'broadcast',
      event: 'JOIN_RESPONSE',
      payload: {
        targetDeviceId: incomingRequest.deviceId,
        accepted,
        newRoomId: roomId
      }
    });
    
    setIncomingRequest(null);
  };

  const getFriendlyDeviceName = () => {
     const dev = devices.find(d => d.id === myId);
     return dev ? dev.name : 'Unknown Device';
  };

  const copyUrl = (url: string, type: 'overlay' | 'fullscreen' | 'controller') => {
    navigator.clipboard.writeText(url);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 3000);
  };

  const finishTour = () => {
    setShowTour(false);
    localStorage.setItem('streambible-tour-seen', 'true');
  };

  const regenerateRoom = () => {
    if (confirm("This will disconnect all currently connected overlays and controllers. Continue?")) {
      broadcastClear();
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
      
      {showTour && <WalkthroughOverlay steps={tourSteps} onComplete={finishTour} />}

      <AnimatePresence>
        {copiedType && (
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
              <span className="copy-toast-sub">
                {copiedType === 'overlay' ? 'Bible overlay link' : copiedType === 'fullscreen' ? 'Fullscreen display link' : 'Controller link'} copied to clipboard
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFallbackToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="copy-toast visible" 
            role="alert" 
            aria-live="assertive" 
            style={{ 
               x: '-50%', 
               background: triageReason === 'internal_error' ? 'rgba(255, 69, 58, 0.15)' : triageReason === 'client_network' ? 'rgba(255, 214, 10, 0.15)' : triageReason === 'user_input' ? 'rgba(152, 152, 157, 0.15)' : 'rgba(255, 159, 10, 0.15)', 
               border: `1px solid ${triageReason === 'internal_error' ? 'rgba(255, 69, 58, 0.3)' : triageReason === 'client_network' ? 'rgba(255, 214, 10, 0.3)' : triageReason === 'user_input' ? 'rgba(152, 152, 157, 0.3)' : 'rgba(255, 159, 10, 0.3)'}`,
               color: 'var(--text-1)'
            }}
          >
            <div className="copy-toast-icon-wrap" style={{ background: triageReason === 'internal_error' ? 'rgba(255, 69, 58, 0.2)' : triageReason === 'client_network' ? 'rgba(255, 214, 10, 0.2)' : triageReason === 'user_input' ? 'rgba(152, 152, 157, 0.2)' : 'rgba(255, 159, 10, 0.2)', color: triageReason === 'internal_error' ? '#FF453A' : triageReason === 'client_network' ? '#FFD60A' : triageReason === 'user_input' ? '#98989D' : 'var(--warning)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div className="copy-toast-body">
              <span className="copy-toast-title">
                {triageReason === 'client_network' ? 'Network Error' : 
                 triageReason === 'internal_error' ? 'Critical System Error' : 
                 triageReason === 'user_input' ? 'Verse Not Found' :
                 triageReason === 'third_party_outage' && fallbackType === 'biblebrain' ? 'Primary Unreachable' :
                 triageReason === 'third_party_outage' && fallbackType === 'local' ? 'API Outage' : 'System Alert'}
              </span>
              <span className="copy-toast-sub">
                {triageReason === 'client_network' ? 'You appear to be offline. Defaulting to local database.' : 
                 triageReason === 'internal_error' ? 'Local database unavailable. Please refresh.' : 
                 triageReason === 'user_input' ? 'Please check the reference and try again.' :
                 triageReason === 'third_party_outage' && fallbackType === 'biblebrain' ? 'YouVersion is unreachable. Defaulting to Bible Brain API.' :
                 triageReason === 'third_party_outage' && fallbackType === 'local' ? 'Primary sources unreachable. Defaulting to local database.' :
                 'An unknown error occurred.'}
                 {fallbackOriginalVersion && fallbackOriginalVersion !== '1' && fallbackType === 'local' && (
                    <span style={{ display: 'block', marginTop: '4px', fontSize: '11px', opacity: 0.8, fontWeight: 500 }}>
                      Translation unavailable offline. Reverted to KJV.
                    </span>
                 )}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="header">
        <div className="wordmark">
          <div className="wordmark-icon">
            <svg viewBox="0 0 16 16" fill="none" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2.5" y="1.5" width="11" height="13" rx="1.5"/>
              <path d="M5 5h6M5 7.5h6M5 10h4"/>
            </svg>
          </div>
          <div className="wordmark-text">
            <span className="wordmark-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              StreamBible
              <span className={`ws-dot-mobile ${wsConnected ? 'connected' : 'error'}`}></span>
            </span>
            <span className="wordmark-sub mobile-hidden">Live Controller</span>
          </div>
        </div>

        <div id="header-links" className="header-right mobile-hidden" style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <button className="obs-copy-btn" onClick={() => copyUrl(`${window.location.origin}/overlay?room=${roomId}`, 'overlay')} title="Copy Lower Third Overlay Link">
            <svg className="icon-copy" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 5H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2m4-10h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2M5 8h6"/>
            </svg>
            <span className="btn-label">Overlay</span>
          </button>
          
          <button className="obs-copy-btn" onClick={() => copyUrl(`${window.location.origin}/fullscreen?room=${roomId}`, 'fullscreen')} title="Copy Full Screen Overlay Link">
            <svg className="icon-copy" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
            </svg>
            <span className="btn-label">Fullscreen</span>
          </button>

          <button className="theme-toggle" onClick={() => setShowTour(true)} title="Restart Tour">
            <span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </span>
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

        <button className="mobile-more-btn" onClick={() => setIsMobileMenuOpen(true)}>
          <MoreHorizontal size={20} />
        </button>
      </header>

      <main className="main">
        <div id="network-panel" className="network-panel">
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
                  <button onClick={() => copyUrl(`${window.location.origin}/controller?room=${roomId}`, 'controller')} style={{ padding: '4px 12px' }}>Copy</button>
                  {isHost && (
                    <button onClick={regenerateRoom} style={{ padding: '4px 12px', background: 'rgba(255,0,0,0.1)', color: '#ff4444' }} title="Reset Session ID">Reset</button>
                  )}
                </div>

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

        <AnimatePresence>
          {incomingRequest && isHost && (
            <motion.div 
              initial={{ opacity: 0, y: 50, x: '-50%', scale: 0.9 }}
              animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
              exit={{ opacity: 0, y: 20, x: '-50%', scale: 0.9 }}
              className="glass join-modal"
              style={{
                position: 'fixed',
                bottom: '100px',
                left: '50%',
                zIndex: 11000,
                width: '90%',
                maxWidth: '380px',
                textAlign: 'center',
                padding: 'var(--s-6)',
                borderRadius: 'var(--r-2xl)',
              }}
            >
              <div className="modal-icon">🤝</div>
              <h3 className="modal-title">Join Request</h3>
              <p className="modal-body-text">
                <strong>{incomingRequest.name}</strong> is nearby and wants to join your session.
              </p>
              <div className="modal-actions">
                <button 
                  onClick={() => handleResponse(false)}
                  className="modal-btn modal-btn-decline"
                >
                  Decline
                </button>
                <button 
                  onClick={() => handleResponse(true)}
                  className="modal-btn modal-btn-accept"
                >
                  Accept
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {requestStatus === 'pending' && (
            <motion.div 
              initial={{ opacity: 0, y: 20, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 20, x: '-50%' }}
              className="request-pending-pill"
            >
              <span className="spinner-dots"></span>
              Request sent. Waiting for Host approval...
              <button onClick={() => setRequestStatus('idle')} className="cancel-request-btn">Cancel</button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {requestStatus === 'declined' && (
            <motion.div 
              initial={{ opacity: 0, y: 20, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 20, x: '-50%' }}
              className="request-declined-pill"
            >
              🔒 Request declined by the Host.
            </motion.div>
          )}
        </AnimatePresence>

        <div id="discovery-section" className="discovery-section">
           <div className="device-monitor discovery-prominent">
             <div className="device-monitor-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <span className="device-monitor-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                 {discoveryEnabled && isDiscovering ? (
                    <span className="spinner-dots" style={{ margin: '0 4px' }}></span>
                 ) : (
                    <span className={`live-pulse ${!discoveryEnabled ? 'is-paused' : ''}`}></span>
                 )}
                 Discover Nearby Sessions
               </span>
               <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                 {discoveryEnabled && (
                   <button 
                     onClick={refreshDiscovery} 
                     disabled={isDiscovering}
                     className="refresh-discovery-btn"
                     title="Refresh List"
                   >
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                       <polyline points="23 4 23 10 17 10"></polyline>
                       <polyline points="1 20 1 14 7 14"></polyline>
                       <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                     </svg>
                   </button>
                 )}
                 <label className="toggle-switch">
                   <input 
                     type="checkbox" 
                     checked={discoveryEnabled} 
                     onChange={(e) => setDiscoveryEnabled(e.target.checked)} 
                   />
                   <span className="toggle-slider"></span>
                 </label>
               </div>
             </div>
             
             <AnimatePresence mode="wait">
               {!discoveryEnabled ? (
                 <motion.div 
                   key="disabled"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   className="discovery-empty-state"
                 >
                   Turn on discovery to find and join active StreamBible sessions on your Wi-Fi network.
                 </motion.div>
               ) : nearbySessions.filter(s => s.room_id !== roomId).length > 0 ? (
                 <motion.div 
                   key="list"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   className="device-list"
                 >
                   {nearbySessions.filter(s => s.room_id !== roomId).map(session => (
                     <div key={session.room_id} className="device-item discovery-item">
                       <div className="device-item-left">
                         <div className="device-icon-wrap" style={{ background: 'var(--color-accent-primary)', color: 'white' }}>
                           <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
                              <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
                              <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                              <line x1="12" y1="20" x2="12.01" y2="20"></line>
                           </svg>
                         </div>
                         <div className="device-info">
                           <div className="device-name">Room: {session.room_id}</div>
                           <div className="device-meta">Church Wi-Fi Network</div>
                         </div>
                       </div>
                       <button 
                         onClick={() => handleJoinRequest(session.room_id)}
                         disabled={requestStatus === 'pending'}
                         className="join-request-btn"
                       >
                         {requestStatus === 'pending' && joinRequest?.roomId === session.room_id ? 'Wait...' : 'Request Join'}
                       </button>
                     </div>
                   ))}
                 </motion.div>
               ) : (
                 <motion.div 
                   key="empty"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   className="discovery-empty-state"
                 >
                   {isDiscovering ? 'Scanning network...' : 'No nearby sessions found. Make sure Remote Access is enabled on the host device.'}
                 </motion.div>
               )}
             </AnimatePresence>
           </div>
        </div>

        <form id="search-bar" className="search-bar" onSubmit={onFormSubmit}>
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

        <div id="preview-cards" className="previews">
          <div className={`preview-card ${!showPrimary ? 'lang-disabled' : ''}`}>
            <div className="card-label">
              <span className="card-label-dot"></span>
              Window 1
              <span className="card-label-rule"></span>
              <div style={{ flex: 1, margin: '0 12px' }}>
                <CustomDropdown
                  value={primaryVersion}
                  onChange={setPrimaryVersion}
                  onLoadMore={loadExtraVersions}
                  curatedVersions={curatedVersions}
                  extraVersions={extraVersions}
                  showExtraVersions={showExtraVersions}
                  fetchingExtra={fetchingExtra}
                  isFallbackActive={isUsingFallback}
                />
              </div>
              <label className="lang-toggle" title="Show on stream">
                <input type="checkbox" checked={showPrimary} onChange={(e) => setShowPrimary(e.target.checked)} />
                <span className="lang-toggle-track"></span>
              </label>
            </div>
            <div className={`preview-text ${primaryText && status !== 'fetching' ? 'has-content' : ''} ${primaryExpanded ? 'expanded' : ''}`}>
              {status === 'fetching' ? <SkeletonLoader /> : (primaryText || 'Waiting for a verse…')}
            </div>
            <div className="card-footer">
              <span className={`card-ref ${primaryRef && status !== 'fetching' ? 'visible' : ''}`}>{primaryRef}</span>
              <button 
                className={`expand-btn ${primaryText.length > 230 && status !== 'fetching' ? 'visible' : ''}`}
                onClick={() => setPrimaryExpanded(!primaryExpanded)}
              >
                {primaryExpanded ? 'Show less' : 'Show more'}
              </button>
            </div>
          </div>

          <div className={`preview-card ${!showSecondary ? 'lang-disabled' : ''}`}>
            <div className="card-label">
              <span className="card-label-dot"></span>
              Window 2
              <span className="card-label-rule"></span>
              <div style={{ flex: 1, margin: '0 12px' }}>
                <CustomDropdown
                  value={secondaryVersion}
                  onChange={setSecondaryVersion}
                  onLoadMore={loadExtraVersions}
                  curatedVersions={curatedVersions}
                  extraVersions={extraVersions}
                  showExtraVersions={showExtraVersions}
                  fetchingExtra={fetchingExtra}
                  isFallbackActive={isUsingFallback}
                />
              </div>
              <label className="lang-toggle" title="Show on stream">
                <input type="checkbox" checked={showSecondary} onChange={(e) => setShowSecondary(e.target.checked)} />
                <span className="lang-toggle-track"></span>
              </label>
            </div>
            <div className={`preview-text ${secondaryText && status !== 'fetching' ? 'has-content' : ''} ${secondaryExpanded ? 'expanded' : ''}`}>
               {status === 'fetching' ? <SkeletonLoader /> : (secondaryText || 'Nduro fun ẹsẹ kan…')}
            </div>
            <div className="card-footer">
              <span className={`card-ref ${secondaryRef && status !== 'fetching' ? 'visible' : ''}`}>{secondaryRef}</span>
              <button 
                className={`expand-btn ${secondaryText.length > 230 && status !== 'fetching' ? 'visible' : ''}`}
                onClick={() => setSecondaryExpanded(!secondaryExpanded)}
              >
                {secondaryExpanded ? 'Show less' : 'Show more'}
              </button>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bottom-sheet-backdrop"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bottom-sheet-modal"
            >
              <div className="bottom-sheet-handle" />
              
              <div className="bottom-sheet-header">
                <h3>Menu</h3>
                <div className={`ws-pill ${wsConnected ? 'connected' : 'error'}`} style={{ border: 'none', background: 'transparent', padding: 0 }}>
                  <span className="ws-dot"></span>
                  <span style={{ fontSize: '13px', fontWeight: 500 }}>{wsConnected ? 'Sync Active' : 'Offline'}</span>
                </div>
              </div>

              <div className="bottom-sheet-body">
                <button className="bottom-sheet-btn" onClick={() => { copyUrl(`${window.location.origin}/overlay?room=${roomId}`, 'overlay'); setIsMobileMenuOpen(false); }}>
                  <div className="bottom-sheet-btn-icon"><ExternalLink size={18} /></div>
                  <div className="bottom-sheet-btn-text">
                    <span>Overlay Link</span>
                    <span className="sub">Copy link for OBS Browser Source</span>
                  </div>
                </button>

                <button className="bottom-sheet-btn" onClick={() => { copyUrl(`${window.location.origin}/fullscreen?room=${roomId}`, 'fullscreen'); setIsMobileMenuOpen(false); }}>
                  <div className="bottom-sheet-btn-icon"><MonitorUp size={18} /></div>
                  <div className="bottom-sheet-btn-text">
                    <span>Fullscreen Link</span>
                    <span className="sub">Copy link for full-screen display</span>
                  </div>
                </button>

                <button className="bottom-sheet-btn" onClick={() => { toggleTheme(); setIsMobileMenuOpen(false); }}>
                  <div className="bottom-sheet-btn-icon">
                    {theme === 'dark' ? <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><circle cx="8" cy="8" r="3"/><line x1="8" y1="1" x2="8" y2="2.5"/><line x1="8" y1="13.5" x2="8" y2="15"/><line x1="1" y1="8" x2="2.5" y2="8"/><line x1="13.5" y1="8" x2="15" y2="8"/><line x1="3.05" y1="3.05" x2="4.1" y2="4.1"/><line x1="11.9" y1="11.9" x2="12.95" y2="12.95"/><line x1="3.05" y1="12.95" x2="4.1" y2="11.9"/><line x1="11.9" y1="4.1" x2="12.95" y2="3.05"/></svg> : <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M13.5 10A5.5 5.5 0 0 1 6 2.5a5.5 5.5 0 1 0 7.5 7.5z"/></svg>}
                  </div>
                  <div className="bottom-sheet-btn-text">
                    <span>Toggle Theme</span>
                    <span className="sub">Switch to {theme === 'dark' ? 'Light' : 'Dark'} mode</span>
                  </div>
                </button>

                <button className="bottom-sheet-btn" onClick={() => { setShowTour(true); setIsMobileMenuOpen(false); }}>
                  <div className="bottom-sheet-btn-icon"><Sparkles size={18} /></div>
                  <div className="bottom-sheet-btn-text">
                    <span>Restart Tour</span>
                    <span className="sub">Replay the introductory walkthrough</span>
                  </div>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div style={{ textAlign: 'center', marginTop: '10px', marginBottom: '10px', display: 'flex', justifyContent: 'center', minHeight: '28px', alignItems: 'center' }}>
        {(!isUsingFallback || fallbackType === null) && (
          <img src="/youversion-logo.svg" alt="Provided by YouVersion" style={{ width: '140px', opacity: 0.5, filter: theme === 'dark' ? 'invert(1)' : 'none' }} />
        )}
        {isUsingFallback && fallbackType === 'biblebrain' && (
          <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', opacity: 0.45, color: 'var(--text-1)' }}>
            Powered by Bible Brain
          </span>
        )}
        {isUsingFallback && fallbackType === 'local' && (
          <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', opacity: 0.45, color: 'var(--text-1)' }}>
            StreamBible Local Data
          </span>
        )}
      </div>

      <footer id="action-bar" className="action-bar">
        <div className="action-row">
          <button 
            className={`btn-live ${status === 'live' ? 'is-live' : ''}`} 
            onClick={pushLive} 
            disabled={(!primaryText && !secondaryText) || status === 'fetching'}
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
