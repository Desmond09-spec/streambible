import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from '../context/SessionContext';
import { supabase } from '../lib/supabase';
import { useLocation } from 'react-router-dom';

export const OnboardingModal: React.FC = () => {
  const { user, hasOnboarded, claimedRoomId, setHasOnboarded } = useSession();
  const location = useLocation();

  const [dismissed, setDismissed] = useState(false);
  const [forceClaimView, setForceClaimView] = useState(false);

  const isVisible = useMemo(() => {
    if (!user || dismissed) return false;
    if (location.pathname !== '/controller' && location.pathname !== '/settings') return false;
    if (!hasOnboarded || !claimedRoomId) return true;
    return false;
  }, [user, dismissed, hasOnboarded, claimedRoomId, location.pathname]);

  // Derive view from state — safe, no side-effects in effects/memos
  const view: 'tour' | 'claim' = (hasOnboarded || forceClaimView) ? 'claim' : 'tour';

  const [claimInput, setClaimInput] = useState('');
  const [claimStatus, setClaimStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [claimMessage, setClaimMessage] = useState('');

  const completeOnboarding = async () => {
    if (!user) return;
    try {
      await supabase.from('profiles').update({ has_onboarded: true }).eq('id', user.id);
      setHasOnboarded(true);
    } catch (e) {
      console.error('Failed to update onboarding status', e);
    }
  };

  const handleClaim = async () => {
    if (!user) return;
    const roomCode = claimInput.toUpperCase().trim();
    if (roomCode.length < 3 || roomCode.length > 8) {
      setClaimStatus('error');
      setClaimMessage('Room ID must be 3-8 characters.');
      return;
    }
    if (!/^[A-Z0-9]+$/.test(roomCode)) {
      setClaimStatus('error');
      setClaimMessage('Letters and numbers only.');
      return;
    }

    setClaimStatus('loading');
    setClaimMessage('');

    try {
      const { data: isAvailable, error: rpcError } = await supabase
        .rpc('check_room_available', { room_code: roomCode });

      if (rpcError) throw rpcError;

      if (!isAvailable) {
        setClaimStatus('error');
        setClaimMessage('This Room ID is already taken. Try another.');
        return;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ claimed_room_id: roomCode, has_onboarded: true })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setClaimStatus('success');
      setClaimMessage('Room successfully claimed!');
      
      // Delay dismissal for smooth UX
      setTimeout(() => {
        setHasOnboarded(true);
        // Page reload to ensure all contexts pick up the newly claimed room as active
        window.location.reload();
      }, 1500);

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to claim room.';
      setClaimStatus('error');
      setClaimMessage(msg);
    }
  };

  const renderTourView = () => (
    <motion.div
      key="tour"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
    >
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Welcome to StreamBible Pro</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px' }}>
          You're now logged in. Here is how to keep your stream frictionless and resilient.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <div style={{ background: 'var(--color-bg-secondary)', padding: '10px', borderRadius: '12px', color: 'var(--color-accent-primary)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>1. Claim Your Room</h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
              Lock down a permanent, vanity URL so your OBS browser source overlay never breaks.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <div style={{ background: 'var(--color-bg-secondary)', padding: '10px', borderRadius: '12px', color: 'var(--color-accent-primary)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>2. Gatekeep Discovery</h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
              Toggle Gatekeeping in Settings to hide your session from the public local network for ultimate privacy.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <div style={{ background: 'var(--color-bg-secondary)', padding: '10px', borderRadius: '12px', color: 'var(--color-accent-primary)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>3. Resilient Fallbacks</h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
              If your venue's internet drops, the system instantly switches to a local cached database to keep you live.
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={() => setForceClaimView(true)}
        style={{
          marginTop: '10px',
          padding: '14px',
          background: 'var(--color-accent-primary)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontWeight: '600',
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        Continue to Claim Room
      </button>
    </motion.div>
  );

  const renderClaimView = () => (
    <motion.div
      key="claim"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
    >
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
          {hasOnboarded ? 'Welcome Back!' : 'Lock down your stream'}
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px' }}>
          {hasOnboarded 
            ? "We noticed you haven't claimed a permanent Room ID yet. Without it, your overlay URL will reset if you clear your cache. Claim an ID to 'set it and forget it' in OBS."
            : "Choose a custom, permanent 3-8 character room code. This guarantees your OBS overlay connection remains stable across all devices."}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <motion.input
          animate={
            claimStatus === 'error' ? { x: [-5, 5, -5, 5, 0], transition: { duration: 0.4 } } :
            claimStatus === 'success' ? { boxShadow: '0 0 15px rgba(52,199,89,0.4)', borderColor: 'var(--color-accent-success)' } :
            {}
          }
          type="text"
          placeholder="e.g. GRACE"
          value={claimInput}
          onChange={(e) => setClaimInput(e.target.value.toUpperCase())}
          maxLength={8}
          autoFocus
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '8px',
            border: `2px solid ${claimStatus === 'error' ? 'var(--color-accent-danger)' : 'var(--color-border)'}`,
            background: 'var(--color-bg-secondary)',
            color: 'var(--color-text-primary)',
            outline: 'none',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            letterSpacing: '2px',
            fontSize: '18px',
            textAlign: 'center'
          }}
        />
        
        {claimMessage && (
          <div style={{
            fontSize: '13px',
            fontWeight: '500',
            textAlign: 'center',
            color: claimStatus === 'error' ? 'var(--color-accent-danger)' : 'var(--color-accent-success)',
          }}>
            {claimMessage}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
        <button
          onClick={async () => {
            await completeOnboarding();
            setDismissed(true);
          }}
          style={{
            flex: 1,
            padding: '14px',
            background: 'transparent',
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Skip for now
        </button>
        <button
          onClick={handleClaim}
          disabled={claimStatus === 'loading' || !claimInput.trim()}
          style={{
            flex: 2,
            padding: '14px',
            background: claimStatus === 'success' ? 'var(--color-accent-success)' : 'var(--color-accent-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: (claimStatus === 'loading' || !claimInput.trim()) ? 'not-allowed' : 'pointer',
            opacity: (claimStatus === 'loading' || !claimInput.trim()) ? 0.6 : 1
          }}
        >
          {claimStatus === 'loading' ? 'Checking...' : claimStatus === 'success' ? 'Claimed!' : 'Claim Room ID'}
        </button>
      </div>
    </motion.div>
  );

  return (
    <AnimatePresence>
      {isVisible && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              background: 'var(--color-bg-primary)',
              width: '100%',
              maxWidth: '480px',
              borderRadius: '24px',
              padding: '32px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              border: '1px solid var(--color-border)'
            }}
          >
            <AnimatePresence mode="wait">
              {view === 'tour' ? renderTourView() : renderClaimView()}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
