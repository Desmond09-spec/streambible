import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useSearchParams, Outlet, useNavigate } from 'react-router-dom';
import { usePresence, useHeartbeat, useSyncPublisher, useDiscovery, type VersePayload, type DevicePresence, type ActiveSession } from '../hooks/useSync';
import { useSettings } from './SettingsContext';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import { SwitchingOverlay } from '../components/SwitchingOverlay';
import { ConfirmModal } from '../components/ConfirmModal';
import { OnboardingModal } from '../components/OnboardingModal';

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
  requestStatus: 'idle' | 'pending' | 'accepted' | 'declined';
  setRequestStatus: React.Dispatch<React.SetStateAction<'idle' | 'pending' | 'accepted' | 'declined'>>;
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
  setHasOnboarded: React.Dispatch<React.SetStateAction<boolean>>;
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
    // Check Auth and fetch claimed room ID
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
            // If we have a claimed room, we enforce it as our active room
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
    // Only set standard room to storage if we don't have a claimed room yet
    if (!claimedRoomId) {
      localStorage.setItem(LS_ROOM_KEY, roomId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const isHost = localStorage.getItem(`streambible-host-${roomId}`) === 'true';

  const [isSwitching, setIsSwitching] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);
  const switchStartTime = useRef(0);
  const switchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [remoteAccess, setRemoteAccess] = useState(false);
  const [discoveryEnabled, setDiscoveryEnabled] = useState(false);

  const { pushVerse, clearScreen: broadcastClear, broadcastReset } = useSyncPublisher(roomId);
  const { devices, myId, hostStatus, isReady } = usePresence(roomId, false, remoteAccess);
  const wsConnected = hostStatus === 'online';

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
        setSwitchError('Connection timed out. Please check your network.');
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

  const [joinRequest, setJoinRequest] = useState<{ roomId: string, deviceId: string, name: string } | null>(null);
  const [incomingRequest, setIncomingRequest] = useState<{ roomId: string, deviceId: string, name: string } | null>(null);
  const [requestStatus, setRequestStatus] = useState<'idle' | 'pending' | 'accepted' | 'declined'>('idle');

  const [pendingReset, setPendingReset] = useState(false);
  const [sessionTerminated, setSessionTerminated] = useState(false);

  const regenerateRoom = () => {
    setPendingReset(true);
  };

  const confirmRegenerate = async () => {
    setPendingReset(false);
    broadcastClear();
    setIsSwitching(true);
    switchStartTime.current = Date.now();
    setSwitchError(null);

    broadcastReset();

    const newRoom = generateRoomId();
    localStorage.setItem(`streambible-host-${newRoom}`, 'true');
    localStorage.setItem(LS_ROOM_KEY, newRoom);
    setRoomId(newRoom);
    // Navigate to clear the page state without a URL room param
    navigate('/controller', { replace: true });
  };

  const cancelRegenerate = () => {
    setPendingReset(false);
  };

  const getFriendlyDeviceName = () => {
     const dev = devices.find(d => d.id === myId);
     return dev ? dev.name : 'Unknown Device';
  };

  useEffect(() => {
    if (!roomId) return;
    const channel = supabase.channel(`streambible-sync-${roomId}`);
    
    if (isHost) {
      channel.on('broadcast', { event: 'JOIN_REQUEST' }, ({ payload }) => {
         if (payload.deviceId !== myId) {
           setIncomingRequest({
             roomId: payload.fromRoom,
             deviceId: payload.deviceId,
             name: payload.name
           });
         }
      });
    }

    channel.on('broadcast', { event: 'ROOM_RESET' }, () => {
       if (!isHost) {
          localStorage.removeItem(LS_ROOM_KEY);
          setSessionTerminated(true);
       }
    });

    channel.subscribe();
    return () => { channel.unsubscribe(); };
  }, [roomId, isHost, myId]);

  useEffect(() => {
    if (requestStatus !== 'pending' || !joinRequest) return;
    
    const channel = supabase.channel(`streambible-sync-${joinRequest.roomId}`);
    channel.on('broadcast', { event: 'JOIN_RESPONSE' }, ({ payload }) => {
       if (payload.targetDeviceId === myId) {
          if (payload.accepted) {
            setRequestStatus('accepted');
            setIsSwitching(true);
            switchStartTime.current = Date.now();
            setSwitchError(null);
            // Switch room in context, not in URL
            const newRoom = payload.newRoomId;
            localStorage.setItem(LS_ROOM_KEY, newRoom);
            setRoomId(newRoom);
            navigate('/controller', { replace: true });
          } else {
            setRequestStatus('declined');
            setJoinRequest(null);
            setTimeout(() => setRequestStatus('idle'), 4000);
          }
       }
    }).subscribe();

    return () => { channel.unsubscribe(); };
  }, [isHost, requestStatus, myId, joinRequest, navigate]);

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
    
    if (accepted && !remoteAccess) {
      setRemoteAccess(true);
    }
    
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

  return (
    <SessionContext.Provider value={{
      roomId, isHost, remoteAccess, setRemoteAccess, discoveryEnabled, setDiscoveryEnabled,
      devices, myId, hostStatus, wsConnected, pushVerse, broadcastClear,
      joinRequest, setJoinRequest, incomingRequest, setIncomingRequest,
      requestStatus, setRequestStatus, nearbySessions, refreshDiscovery, isDiscovering,
      regenerateRoom, pendingReset, confirmRegenerate, cancelRegenerate, handleJoinRequest, handleResponse,
      user, claimedRoomId, hasOnboarded, setHasOnboarded
    }}>
      <OnboardingModal />
      <SwitchingOverlay isVisible={isSwitching} error={switchError} />
      <ConfirmModal
        isVisible={pendingReset}
        title="Reset Session?"
        message="This will disconnect all currently connected overlays and remote controllers."
        confirmLabel="Reset"
        cancelLabel="Cancel"
        destructive
        onConfirm={confirmRegenerate}
        onCancel={cancelRegenerate}
      />
      <ConfirmModal
        isVisible={sessionTerminated}
        title="Session Ended"
        message="The host has closed this room. You have been disconnected."
        confirmLabel="Create New Room"
        cancelLabel="Dismiss"
        onConfirm={() => {
          setSessionTerminated(false);
          window.location.reload();
        }}
        onCancel={() => {
          setSessionTerminated(false);
        }}
      />
      {children || <Outlet />}
    </SessionContext.Provider>
  );
};


