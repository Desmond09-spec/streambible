import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useSearchParams, Outlet, useNavigate } from 'react-router-dom';
import { usePresence, useHeartbeat, useSyncPublisher, useDiscovery } from '../hooks/useSync';
import { useSettings } from './SettingsContext';
import { supabase } from '../lib/supabase';

export interface SessionContextType {
  roomId: string;
  isHost: boolean;
  remoteAccess: boolean;
  setRemoteAccess: (val: boolean) => void;
  discoveryEnabled: boolean;
  setDiscoveryEnabled: (val: boolean) => void;
  devices: any[];
  myId: string;
  hostStatus: string;
  wsConnected: boolean;
  pushVerse: any;
  broadcastClear: () => void;
  joinRequest: any;
  setJoinRequest: any;
  incomingRequest: any;
  setIncomingRequest: any;
  requestStatus: 'idle' | 'pending' | 'accepted' | 'declined';
  setRequestStatus: any;
  nearbySessions: any[];
  refreshDiscovery: any;
  isDiscovering: boolean;
  regenerateRoom: () => void;
  handleJoinRequest: (targetRoomId: string) => Promise<void>;
  handleResponse: (accepted: boolean) => Promise<void>;
}

const SessionContext = createContext<SessionContextType | null>(null);

export const useSession = () => {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
};

export const SessionProvider: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const roomId = searchParams.get('room') || '';

  // Ensure every host session gets a Room ID
  useEffect(() => {
    if (!roomId) {
      const newRoom = Math.random().toString(36).substring(2, 7).toUpperCase();
      setSearchParams(prev => {
        prev.set('room', newRoom);
        return prev;
      }, { replace: true });
      localStorage.setItem(`streambible-host-${newRoom}`, 'true');
    }
  }, [roomId, setSearchParams]);

  const isHost = roomId ? localStorage.getItem(`streambible-host-${roomId}`) === 'true' : false;
  
  const [remoteAccess, setRemoteAccess] = useState(false);
  const [discoveryEnabled, setDiscoveryEnabled] = useState(false);

  const { pushVerse, clearScreen: broadcastClear } = useSyncPublisher(roomId);
  const { devices, myId, hostStatus } = usePresence(roomId, false, remoteAccess);
  const wsConnected = hostStatus === 'online';

  const { gatekeepDiscovery } = useSettings();
  const isDiscoverable = gatekeepDiscovery ? discoveryEnabled : true;
  useHeartbeat(roomId, isHost, isDiscoverable);
  const { nearbySessions, refresh: refreshDiscovery, isDiscovering } = useDiscovery(discoveryEnabled);

  const [joinRequest, setJoinRequest] = useState<{ roomId: string, deviceId: string, name: string } | null>(null);
  const [incomingRequest, setIncomingRequest] = useState<{ roomId: string, deviceId: string, name: string } | null>(null);
  const [requestStatus, setRequestStatus] = useState<'idle' | 'pending' | 'accepted' | 'declined'>('idle');

  const regenerateRoom = () => {
    if (confirm("This will disconnect all currently connected overlays and controllers. Continue?")) {
      broadcastClear();
      const newRoom = Math.random().toString(36).substring(2, 7).toUpperCase();
      localStorage.setItem(`streambible-host-${newRoom}`, 'true');
      navigate(`/controller?room=${newRoom}`);
    }
  };

  const getFriendlyDeviceName = () => {
     const dev = devices.find(d => d.id === myId);
     return dev ? dev.name : 'Unknown Device';
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
      regenerateRoom, handleJoinRequest, handleResponse
    }}>
      {children || <Outlet />}
    </SessionContext.Provider>
  );
};
