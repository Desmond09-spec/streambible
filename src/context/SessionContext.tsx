import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useSearchParams, useNavigate, Outlet } from 'react-router-dom';
import { useHeartbeat, useWebRTCNode, useDiscovery, type VersePayload, type DevicePresence, type ActiveSession } from '../hooks/useSync';
import { useSettings } from './SettingsContext';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface SessionContextType {
  roomId: string;
  isHost: boolean;
  remoteAccess: boolean;
  setRemoteAccess: (val: boolean) => void;
  discoveryEnabled: boolean;
  setDiscoveryEnabled: (val: boolean) => void;
  devices: DevicePresence[];
  myId: string;
  hostStatus: string;
  wsConnected: boolean;
  pushVerse: (payload: VersePayload) => void;
  broadcastClear: () => void;
  joinRequest: { roomId: string, deviceId: string, name: string } | null;
  setJoinRequest: React.Dispatch<React.SetStateAction<{ roomId: string, deviceId: string, name: string } | null>>;
  incomingRequest: { roomId: string, deviceId: string, name: string } | null;
  setIncomingRequest: React.Dispatch<React.SetStateAction<{ roomId: string, deviceId: string, name: string } | null>>;
  requestStatus: 'idle' | 'pending' | 'accepted' | 'declined' | 'timeout';
  setRequestStatus: React.Dispatch<React.SetStateAction<'idle' | 'pending' | 'accepted' | 'declined' | 'timeout'>>;
  nearbySessions: ActiveSession[];
  refreshDiscovery: () => Promise<void>;
  isDiscovering: boolean;
  regenerateRoom: () => void;
  pendingReset: boolean;
  confirmRegenerate: () => void;
  cancelRegenerate: () => void;
  handleJoinRequest: (targetRoomId: string) => Promise<void>;
  handleResponse: (accepted: boolean) => Promise<void>;
  user: User | null;
  claimedRoomId: string | null;
  hasOnboarded: boolean;
  setHasOnboarded: (val: boolean) => void;
  connectionState: 'connected' | 'connecting' | 'reconnecting' | 'disconnected';
  retryCountdown: number | null;
  forceReconnect: () => void;
  pingMs: number | null;
  consecutiveFailures: number;
}

const SessionContext = createContext<SessionContextType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useSession = () => {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
};

const LS_ROOM_KEY = 'streambible-active-room';

const generateRoomId = () =>
  Math.random().toString(36).substring(2, 7).toUpperCase();

export const SessionProvider: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Priority: Claimed Room -> URL param → localStorage → generate new
  const [roomId, setRoomId] = useState<string>(() => {
    const fromUrl = searchParams.get('room');
    if (fromUrl) return fromUrl;
    
    const fromStorage = localStorage.getItem(LS_ROOM_KEY);
    if (fromStorage) return fromStorage;
    
    const newRoom = generateRoomId();
    localStorage.setItem(`streambible-host-${newRoom}`, 'true');
    return newRoom;
  });

  const [user, setUser] = useState<User | null>(null);
  const [claimedRoomId, setClaimedRoomId] = useState<string | null>(null);
  const [hasOnboarded, setHasOnboarded] = useState<boolean>(false);

  useEffect(() => {
    const fetchAuthAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('claimed_room_id, has_onboarded')
          .eq('id', user.id)
          .single();
          
        if (data) {
          setHasOnboarded(!!data.has_onboarded);
          if (data.claimed_room_id) {
            setClaimedRoomId(data.claimed_room_id);
            setRoomId(data.claimed_room_id);
            localStorage.setItem(`streambible-host-${data.claimed_room_id}`, 'true');
            localStorage.setItem(LS_ROOM_KEY, data.claimed_room_id);
          }
        }
      }
    };
    
    fetchAuthAndProfile();

    const fromUrl = searchParams.get('room');
    if (fromUrl) {
      setSearchParams(prev => {
        prev.delete('room');
        return prev;
      }, { replace: true });
    }
    if (!claimedRoomId) {
      localStorage.setItem(LS_ROOM_KEY, roomId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const isHost = localStorage.getItem(`streambible-host-${roomId}`) === 'true';

  const [isSwitching, setIsSwitching] = useState(false);
  const switchStartTime = useRef(0);
  const switchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [remoteAccess, setRemoteAccess] = useState(false);
  const [discoveryEnabled, setDiscoveryEnabled] = useState(false);

  const [joinRequest, setJoinRequest] = useState<{ roomId: string, deviceId: string, name: string } | null>(null);
  const [incomingRequest, setIncomingRequest] = useState<{ roomId: string, deviceId: string, name: string } | null>(null);
  const [requestStatus, setRequestStatus] = useState<'idle' | 'pending' | 'accepted' | 'declined' | 'timeout'>('idle');

  // Callbacks for the WebRTC Node
  const onRoomReset = useCallback(() => {
    if (!isHost) {
      localStorage.removeItem(LS_ROOM_KEY);
      window.location.reload();
    }
  }, [isHost]);

  const onJoinRequest = useCallback((req: { fromRoom: string, deviceId: string, name: string }) => {
    setIncomingRequest({
      roomId: req.fromRoom,
      deviceId: req.deviceId,
      name: req.name
    });

    // Automatically dismiss the host's approval prompt after 60s
    setTimeout(() => {
      setIncomingRequest(prev => {
        if (prev?.deviceId === req.deviceId) {
          return null; // Dismiss prompt
        }
        return prev;
      });
    }, 60000);
  }, []);

  const onJoinResponse = useCallback((res: { targetDeviceId: string, accepted: boolean, newRoomId: string }) => {
    if (res.accepted) {
      setRequestStatus('accepted');
      setIsSwitching(true);
      switchStartTime.current = Date.now();
      localStorage.setItem(LS_ROOM_KEY, res.newRoomId);
      setRoomId(res.newRoomId);
      navigate('/controller', { replace: true });
    } else {
      setRequestStatus('declined');
      setJoinRequest(null);
      setTimeout(() => setRequestStatus('idle'), 4000);
    }
  }, [navigate]);

  const {
    devices,
    myId,
    hostStatus,
    isReady,
    pushVerse,
    clearScreen: broadcastClear,
    broadcastReset,
    sendJoinRequest,
    respondToJoinRequest,
    connectionState,
    retryCountdown,
    forceReconnect,
    pingMs,
    consecutiveFailures
  } = useWebRTCNode(roomId, isHost, false, remoteAccess, {
    onRoomReset,
    onJoinRequest,
    onJoinResponse
  });

  const wsConnected = isHost ? devices.some(d => d.isOverlay) : hostStatus === 'online';

  useEffect(() => {
    if (!isSwitching) return;

    if (isReady) {
      if (switchTimeoutRef.current) clearTimeout(switchTimeoutRef.current);
      const elapsed = Date.now() - switchStartTime.current;
      const remaining = Math.max(0, 1200 - elapsed);
      if (remaining > 0) {
        setTimeout(() => setIsSwitching(false), remaining);
      } else {
        setIsSwitching(false);
      }
    } else {
      switchTimeoutRef.current = setTimeout(() => {
        // Handle timeout silently or log it
        console.warn('Connection timed out while switching rooms.');
      }, 8000);
    }

    return () => {
      if (switchTimeoutRef.current) clearTimeout(switchTimeoutRef.current);
    };
  }, [isSwitching, isReady]);

  const { gatekeepDiscovery } = useSettings();
  const isDiscoverable = gatekeepDiscovery ? discoveryEnabled : true;
  useHeartbeat(roomId, isHost, isDiscoverable);
  const { nearbySessions, refresh: refreshDiscovery, isDiscovering } = useDiscovery(discoveryEnabled);

  const [pendingReset, setPendingReset] = useState(false);

  const regenerateRoom = () => {
    setPendingReset(true);
  };

  const confirmRegenerate = async () => {
    setPendingReset(false);
    broadcastClear();
    setIsSwitching(true);
    switchStartTime.current = Date.now();

    broadcastReset();

    const newRoom = generateRoomId();
    localStorage.setItem(`streambible-host-${newRoom}`, 'true');
    localStorage.setItem(LS_ROOM_KEY, newRoom);
    setRoomId(newRoom);
    navigate('/controller', { replace: true });
  };

  const cancelRegenerate = () => {
    setPendingReset(false);
  };

  const handleJoinRequest = async (targetRoomId: string) => {
    if (targetRoomId === roomId) return;
    setRequestStatus('pending');
    setJoinRequest({ roomId: targetRoomId, deviceId: '', name: 'Target Room' });
    sendJoinRequest(targetRoomId, 'Remote Device');

    // Automatically reset the requester's UI after 60s
    setTimeout(() => {
      setRequestStatus(prev => {
        if (prev === 'pending') {
          setJoinRequest(null);
          // Auto-hide the timeout message after 4s
          setTimeout(() => setRequestStatus('idle'), 4000);
          return 'timeout';
        }
        return prev;
      });
    }, 60000);
  };

  const handleResponse = async (accepted: boolean) => {
    if (!incomingRequest) return;
    if (accepted && !remoteAccess) setRemoteAccess(true);
    
    respondToJoinRequest(incomingRequest.deviceId, accepted, roomId);
    setIncomingRequest(null);
  };

  return (
    <SessionContext.Provider value={{
      roomId, isHost, remoteAccess, setRemoteAccess,
      discoveryEnabled, setDiscoveryEnabled, devices, myId,
      hostStatus, wsConnected, pushVerse, broadcastClear,
      joinRequest, setJoinRequest, incomingRequest, setIncomingRequest,
      requestStatus, setRequestStatus, nearbySessions, refreshDiscovery,
      isDiscovering, regenerateRoom, pendingReset, confirmRegenerate,
      cancelRegenerate, handleJoinRequest, handleResponse,
      user, claimedRoomId, hasOnboarded, setHasOnboarded,
      connectionState, retryCountdown, forceReconnect, pingMs, consecutiveFailures
    }}>
      {children ? children : <Outlet />}
    </SessionContext.Provider>
  );
};
