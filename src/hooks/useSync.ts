import { useEffect, useRef, useCallback, useState } from 'react';
import Peer, { type DataConnection } from 'peerjs';
import { supabase } from '../lib/supabase';

export interface VersePayload {
  ref: string;
  primaryText: string;
  primaryVersion: string;
  secondaryText: string;
  secondaryVersion: string;
  showPrimary: boolean;
  showSecondary: boolean;
  primarySource: 'api.bible' | 'local' | 'nlt';
  secondarySource: 'api.bible' | 'local' | 'nlt';
  showVerseNumbers?: boolean;
}

export interface DevicePresence {
  id: string;
  name: string;
  isHost: boolean;
  isOverlay: boolean;
}

export interface ActiveSession {
  room_id: string;
  host_device_id: string;
  public_ip: string;
  last_seen: string;
  is_discoverable: boolean;
}

export function getDeviceId() {
  let id = localStorage.getItem('streambible-device-id');
  if (!id) {
    id = Math.random().toString(36).substring(2, 10);
    localStorage.setItem('streambible-device-id', id);
  }
  return id;
}

export function getFriendlyDeviceName() {
  const ua = navigator.userAgent;
  let browser = 'Browser';
  let os = 'Device';
  
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('SamsungBrowser')) browser = 'Samsung Internet';
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
  else if (ua.includes('Edge') || ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';

  if (ua.includes('Win')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'Mac';
  else if (ua.includes('iPhone')) os = 'iPhone';
  else if (ua.includes('iPad')) os = 'iPad';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('Linux')) os = 'Linux';

  return `${browser} on ${os}`;
}

export type HostStatus = 'online' | 'offline' | 'denied';

interface WebRTCCallbacks {
  onVerseUpdate?: (payload: VersePayload) => void;
  onClear?: () => void;
  onRoomReset?: () => void;
  onJoinRequest?: (payload: { fromRoom: string, deviceId: string, name: string }) => void;
  onJoinResponse?: (payload: { targetDeviceId: string, accepted: boolean, newRoomId: string }) => void;
}

/**
 * The master WebRTC hook that replaces Supabase channels.
 * It handles Host logic, Client logic, broadcasting, and presence.
 */
export function useWebRTCNode(
  roomId: string | null,
  isHost: boolean,
  isOverlay: boolean = false,
  remoteAccess: boolean = true,
  callbacks?: WebRTCCallbacks
) {
  const peerRef = useRef<Peer | null>(null);
  const connsRef = useRef<Map<string, DataConnection>>(new Map());
  const hostConnRef = useRef<DataConnection | null>(null);

  const [devices, setDevices] = useState<DevicePresence[]>([]);
  const [hostStatus, setHostStatus] = useState<HostStatus>('offline');
  const [isReady, setIsReady] = useState(false);

  const myId = getDeviceId();
  const myName = getFriendlyDeviceName();

  const remoteAccessRef = useRef(remoteAccess);
  const callbacksRef = useRef(callbacks);

  useEffect(() => {
    remoteAccessRef.current = remoteAccess;
  }, [remoteAccess]);

  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  // Handle Broadcasting payload to all peers (or upstream to host)
  const pushVerse = useCallback((payload: VersePayload) => {
    const data = { type: 'broadcast', event: 'PUSH_VERSE', payload };
    if (isHost) {
      connsRef.current.forEach(conn => conn.send(data));
      // Triger local callback for dual-window sync if host
      callbacksRef.current?.onVerseUpdate?.(payload);
    } else {
      hostConnRef.current?.send({ type: 'upstream', event: 'PUSH_VERSE', payload });
    }
  }, [isHost]);

  const clearScreen = useCallback(() => {
    const data = { type: 'broadcast', event: 'CLEAR_SCREEN', payload: {} };
    if (isHost) {
      connsRef.current.forEach(conn => conn.send(data));
      callbacksRef.current?.onClear?.();
    } else {
      hostConnRef.current?.send({ type: 'upstream', event: 'CLEAR_SCREEN', payload: {} });
    }
  }, [isHost]);

  const broadcastReset = useCallback(() => {
    const data = { type: 'broadcast', event: 'ROOM_RESET', payload: {} };
    if (isHost) {
      connsRef.current.forEach(conn => conn.send(data));
      callbacksRef.current?.onRoomReset?.();
    }
  }, [isHost]);

  const sendJoinRequest = useCallback((targetRoomId: string, name: string) => {
    // Temporarily connect to the target host to send the join request
    if (!peerRef.current) return;
    const tempConn = peerRef.current.connect(`streambible-room-${targetRoomId}`, {
      metadata: { isJoinRequest: true, deviceId: myId, name }
    });
    tempConn.on('open', () => {
      setTimeout(() => tempConn.close(), 2000); // close after sending
    });
  }, [myId]);

  const respondToJoinRequest = useCallback((targetDeviceId: string, accepted: boolean, newRoomId: string) => {
    // Host broadcasts the response to everyone, the specific client will catch it
    if (isHost) {
      const data = {
        type: 'broadcast',
        event: 'JOIN_RESPONSE',
        payload: { targetDeviceId, accepted, newRoomId }
      };
      connsRef.current.forEach(conn => conn.send(data));
    }
  }, [isHost]);

  useEffect(() => {
    if (!roomId) return;

    if (peerRef.current) {
      peerRef.current.destroy();
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDevices([]);
    setIsReady(false);
    setHostStatus('offline');
    connsRef.current.clear();
    hostConnRef.current = null;

    if (isHost) {
      // ---------------- HOST MODE ----------------
      const hostId = `streambible-room-${roomId}`;
      const peer = new Peer(hostId, {
        config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
      });

      peer.on('open', () => {
        setIsReady(true);
        setHostStatus('online');
        setDevices([{ id: myId, name: myName, isHost: true, isOverlay: false }]);
      });

      peer.on('connection', (conn) => {
        conn.on('open', () => {
          const meta = conn.metadata || {};
          
          if (meta.isJoinRequest) {
            callbacksRef.current?.onJoinRequest?.({
              fromRoom: '',
              deviceId: meta.deviceId,
              name: meta.name
            });
            return;
          }

          if (!meta.isOverlay && !remoteAccessRef.current) {
            conn.send({ type: 'system', event: 'ACCESS_DENIED' });
            setTimeout(() => conn.close(), 500);
            return;
          }

          connsRef.current.set(conn.peer, conn);
          
          // Add to presence
          setDevices(prev => {
            if (prev.find(d => d.id === meta.deviceId)) return prev;
            return [...prev, { id: meta.deviceId, name: meta.name, isHost: false, isOverlay: meta.isOverlay }];
          });

          // Broadcast updated devices list to everyone
          setTimeout(() => {
             const currentDevices = Array.from(connsRef.current.values()).map(c => ({
               id: c.metadata?.deviceId,
               name: c.metadata?.name,
               isHost: false,
               isOverlay: c.metadata?.isOverlay
             }));
             const allDevs = [{ id: myId, name: myName, isHost: true, isOverlay: false }, ...currentDevices];
             connsRef.current.forEach(c => c.send({ type: 'system', event: 'PRESENCE_UPDATE', payload: allDevs }));
          }, 100);
        });

        conn.on('data', (data: unknown) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const typedData = data as { type: string, event: string, payload: any };
          if (typedData.type === 'upstream') {
            // Client is sending an action to be broadcasted
            if (typedData.event === 'PUSH_VERSE') {
              pushVerse(typedData.payload);
            } else if (typedData.event === 'CLEAR_SCREEN') {
              clearScreen();
            }
          }
        });

        conn.on('close', () => {
          connsRef.current.delete(conn.peer);
          setDevices(prev => prev.filter(d => d.id !== conn.metadata?.deviceId));
          
          const currentDevices = Array.from(connsRef.current.values()).map(c => ({
            id: c.metadata?.deviceId,
            name: c.metadata?.name,
            isHost: false,
            isOverlay: c.metadata?.isOverlay
          }));
          const allDevs = [{ id: myId, name: myName, isHost: true, isOverlay: false }, ...currentDevices];
          connsRef.current.forEach(c => c.send({ type: 'system', event: 'PRESENCE_UPDATE', payload: allDevs }));
        });
      });

      peer.on('error', (err) => {
        console.error("PeerJS Host Error:", err);
      });

      peerRef.current = peer;

    } else {
      // ---------------- CLIENT MODE ----------------
      const peer = new Peer({
        config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
      });

      peer.on('open', () => {
        const hostId = `streambible-room-${roomId}`;
        const conn = peer.connect(hostId, {
          metadata: { deviceId: myId, name: myName, isOverlay }
        });

        conn.on('open', () => {
          setIsReady(true);
          setHostStatus('online');
          hostConnRef.current = conn;
        });

        conn.on('data', (data: unknown) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const typedData = data as { type: string, event: string, payload: any };
          if (typedData.type === 'system') {
            if (typedData.event === 'ACCESS_DENIED') setHostStatus('denied');
            if (typedData.event === 'PRESENCE_UPDATE') setDevices(typedData.payload);
          } else if (typedData.type === 'broadcast') {
            if (typedData.event === 'PUSH_VERSE') callbacksRef.current?.onVerseUpdate?.(typedData.payload);
            if (typedData.event === 'CLEAR_SCREEN') callbacksRef.current?.onClear?.();
            if (typedData.event === 'ROOM_RESET') callbacksRef.current?.onRoomReset?.();
            if (typedData.event === 'JOIN_RESPONSE') callbacksRef.current?.onJoinResponse?.(typedData.payload);
          }
        });

        conn.on('close', () => {
          setHostStatus('offline');
          setIsReady(false);
        });
      });

      peer.on('error', (err) => {
        console.error("PeerJS Client Error:", err);
        setHostStatus('offline');
      });

      peerRef.current = peer;
    }

    return () => {
      peerRef.current?.destroy();
    };
  }, [roomId, isHost, myId, myName, isOverlay, pushVerse, clearScreen]);

  return {
    devices,
    myId,
    hostStatus,
    isReady,
    pushVerse,
    clearScreen,
    broadcastReset,
    sendJoinRequest,
    respondToJoinRequest
  };
}

/**
 * Discovery Hooks - We keep these on Supabase because they don't use real-time
 * WebSockets for the core syncing, they just poll a database table for LAN discovery.
 */
export function useHeartbeat(roomId: string | null, isHost: boolean, isDiscoverable: boolean) {
  const myId = getDeviceId();
  
  useEffect(() => {
    if (!roomId || !isHost || !isDiscoverable) return;
    
    const updateHeartbeat = async () => {
      try {
        const res = await fetch('https://api.ipify.org?format=json');
        const { ip } = await res.json();
        
        await supabase.from('active_sessions').upsert({
          room_id: roomId,
          host_device_id: myId,
          public_ip: ip,
          last_seen: new Date().toISOString(),
          is_discoverable: true
        });
      } catch (err) {
        console.error("Heartbeat error", err);
      }
    };
    
    updateHeartbeat();
    const interval = setInterval(updateHeartbeat, 15000); // 15s heartbeat
    
    return () => {
      clearInterval(interval);
      supabase.from('active_sessions').delete().eq('room_id', roomId).then();
    };
  }, [roomId, isHost, isDiscoverable, myId]);
}

export function useDiscovery(enabled: boolean) {
  const [nearbySessions, setNearbySessions] = useState<ActiveSession[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);

  const fetchNearby = useCallback(async () => {
    if (!enabled) {
      setNearbySessions([]);
      return;
    }
    
    setIsDiscovering(true);
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const { ip } = await res.json();
      
      const { data } = await supabase
        .from('active_sessions')
        .select('*')
        .eq('public_ip', ip)
        .eq('is_discoverable', true)
        .gt('last_seen', new Date(Date.now() - 30000).toISOString()); // seen in last 30s
        
      setNearbySessions(data || []);
    } catch (err) {
      console.error("Discovery error", err);
    } finally {
      setIsDiscovering(false);
    }
  }, [enabled]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNearby();
    const interval = setInterval(fetchNearby, 15000);
    return () => clearInterval(interval);
  }, [fetchNearby]);

  return { nearbySessions, refresh: fetchNearby, isDiscovering };
}
