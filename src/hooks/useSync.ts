import { useEffect, useRef, useCallback, useState } from 'react';
import Peer, { type DataConnection } from 'peerjs';
import { useNetworkProber } from './useNetworkProber';

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
  fums?: string;
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
export type ConnectionState = 'connected' | 'connecting' | 'disconnected' | 'reconnecting';

export function useWebRTCNode(
  roomId: string | null,
  isHost: boolean,
  isOverlay: boolean = false,
  remoteAccess: boolean = true,
  callbacks?: WebRTCCallbacks
) {
  const peerRef = useRef<Peer | null>(null);
  const connsRef = useRef<Map<string, DataConnection>>(new Map());
  const joinRequestsRef = useRef<Map<string, DataConnection>>(new Map());
  const hostConnRef = useRef<DataConnection | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const [devices, setDevices] = useState<DevicePresence[]>([]);
  const [hostStatus, setHostStatus] = useState<HostStatus>('offline');
  const [isReady, setIsReady] = useState(false);

  const { pingMs, trueInternetActive, consecutiveFailures } = useNetworkProber();

  const [wsState, setWsState] = useState<ConnectionState>('disconnected');
  const [peerState, setPeerState] = useState<ConnectionState>('disconnected');
  
  const [retryAt, setRetryAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const retryCountdown = retryAt ? Math.max(0, Math.ceil((retryAt - now) / 1000)) : null;
  
  const retryCount = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const myId = getDeviceId();
  const myName = getFriendlyDeviceName();

  const remoteAccessRef = useRef(remoteAccess);
  const callbacksRef = useRef<WebRTCCallbacks | undefined>(callbacks);
  const lastBroadcastStateRef = useRef<{ event: 'PUSH_VERSE' | 'CLEAR_SCREEN', payload?: VersePayload } | null>(null);

  useEffect(() => {
    remoteAccessRef.current = remoteAccess;
  }, [remoteAccess]);

  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  const pushVerse = useCallback((payload: VersePayload) => {
    const data = { type: 'broadcast', event: 'PUSH_VERSE', payload };
    lastBroadcastStateRef.current = { event: 'PUSH_VERSE', payload };
    if (isHost) {
      connsRef.current.forEach(conn => conn.send(data));
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify(data));
      }
      callbacksRef.current?.onVerseUpdate?.(payload);
    } else {
      hostConnRef.current?.send({ type: 'upstream', event: 'PUSH_VERSE', payload });
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: 'broadcast', event: 'UPSTREAM_PUSH_VERSE', payload }));
      }
    }
  }, [isHost]);

  const clearScreen = useCallback(() => {
    const data = { type: 'broadcast', event: 'CLEAR_SCREEN', payload: {} };
    lastBroadcastStateRef.current = { event: 'CLEAR_SCREEN' };
    if (isHost) {
      connsRef.current.forEach(conn => conn.send(data));
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify(data));
      }
      callbacksRef.current?.onClear?.();
    } else {
      hostConnRef.current?.send({ type: 'upstream', event: 'CLEAR_SCREEN', payload: {} });
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: 'broadcast', event: 'UPSTREAM_CLEAR_SCREEN', payload: {} }));
      }
    }
  }, [isHost]);

  const broadcastReset = useCallback(() => {
    const data = { type: 'broadcast', event: 'ROOM_RESET', payload: {} };
    if (isHost) {
      connsRef.current.forEach(conn => conn.send(data));
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify(data));
      }
      callbacksRef.current?.onRoomReset?.();
    }
  }, [isHost]);

  const sendJoinRequest = useCallback((targetRoomId: string, name: string) => {
    if (!peerRef.current) return;
    const tempConn = peerRef.current.connect(`streambible-room-${targetRoomId}`, {
      metadata: { isJoinRequest: true, deviceId: myId, name }
    });
    
    tempConn.on('data', (data: unknown) => {
      const typedData = data as { type: string, event: string, payload: any };
      if (typedData.type === 'broadcast' && typedData.event === 'JOIN_RESPONSE') {
        callbacksRef.current?.onJoinResponse?.(typedData.payload);
        setTimeout(() => tempConn.close(), 500);
      }
    });

    tempConn.on('open', () => {
      // Wait up to 60 seconds for the host to accept/decline
      setTimeout(() => {
        if (tempConn.open) {
          tempConn.close();
        }
      }, 60000);
    });
  }, [myId]);

  const respondToJoinRequest = useCallback((targetDeviceId: string, accepted: boolean, newRoomId: string) => {
    if (isHost) {
      const data = {
        type: 'broadcast',
        event: 'JOIN_RESPONSE',
        payload: { targetDeviceId, accepted, newRoomId }
      };
      const reqConn = joinRequestsRef.current.get(targetDeviceId);
      if (reqConn) {
        reqConn.send(data);
        setTimeout(() => reqConn.close(), 1000);
        joinRequestsRef.current.delete(targetDeviceId);
      }
    }
  }, [isHost]);

  const lastPongRef = useRef<Map<string, number>>(new Map());

  const connect = useCallback(() => {
    if (!roomId) return;

    if (peerRef.current) peerRef.current.destroy();
    if (socketRef.current) socketRef.current.close();

    setDevices([]);
    setIsReady(false);
    setHostStatus('offline');
    connsRef.current.clear();
    hostConnRef.current = null;
    
    setWsState('connecting');
    setPeerState('connecting');

    const relayUrl = import.meta.env.VITE_RELAY_SERVER_URL || 'ws://localhost:8080';
    const ws = new WebSocket(relayUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      setWsState('connected');
      ws.send(JSON.stringify({ type: 'JOIN_ROOM', roomId }));
      if (!isHost) {
        ws.send(JSON.stringify({ type: 'broadcast', event: 'UPSTREAM_REQUEST_STATE', payload: {} }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'broadcast') {
          if (data.event === 'PUSH_VERSE' && !isHost) {
            callbacksRef.current?.onVerseUpdate?.(data.payload);
          } else if (data.event === 'CLEAR_SCREEN' && !isHost) {
            callbacksRef.current?.onClear?.();
          } else if (data.event === 'ROOM_RESET' && !isHost) {
            callbacksRef.current?.onRoomReset?.();
          } else if (isHost) {
            if (data.event === 'UPSTREAM_PUSH_VERSE') {
              pushVerse(data.payload);
            } else if (data.event === 'UPSTREAM_CLEAR_SCREEN') {
              clearScreen();
            } else if (data.event === 'UPSTREAM_PING') {
              const { deviceId, name, isOverlay } = data.payload;
              lastPongRef.current.set(deviceId, Date.now());
              setDevices(prev => {
                if (prev.find(d => d.id === deviceId)) return prev;
                return [...prev, { id: deviceId, name, isHost: false, isOverlay }];
              });
            } else if (data.event === 'UPSTREAM_REQUEST_STATE') {
              if (lastBroadcastStateRef.current) {
                const { event, payload } = lastBroadcastStateRef.current;
                const stateData = { type: 'broadcast', event, payload };
                if (socketRef.current?.readyState === WebSocket.OPEN) {
                  socketRef.current.send(JSON.stringify(stateData));
                }
                connsRef.current.forEach(conn => conn.send(stateData));
              }
            }
          } else if (!isHost && data.event === 'PRESENCE_UPDATE') {
            setDevices(data.payload);
          }
        }
      } catch (e) {
        console.error('WebSocket Relay parse error', e);
      }
    };

    ws.onclose = () => setWsState('disconnected');
    ws.onerror = () => setWsState('disconnected');

    if (isHost) {
      const hostId = `streambible-room-${roomId}`;
      const peer = new Peer(hostId, {
        config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
      });

      peer.on('open', () => {
        setIsReady(true);
        setHostStatus('online');
        setPeerState('connected');
        setDevices([{ id: myId, name: myName, isHost: true, isOverlay: false }]);
      });

      peer.on('connection', (conn) => {
        conn.on('open', () => {
          const meta = conn.metadata || {};
          if (meta.isJoinRequest) {
            joinRequestsRef.current.set(meta.deviceId, conn);
            callbacksRef.current?.onJoinRequest?.({
              fromRoom: '', deviceId: meta.deviceId, name: meta.name
            });
            // Cleanup memory if response is never triggered
            setTimeout(() => {
              const req = joinRequestsRef.current.get(meta.deviceId);
              if (req === conn) {
                req.close();
                joinRequestsRef.current.delete(meta.deviceId);
              }
            }, 65000);
            return;
          }
          if (!meta.isOverlay && !remoteAccessRef.current) {
            conn.send({ type: 'system', event: 'ACCESS_DENIED' });
            setTimeout(() => conn.close(), 500);
            return;
          }
          connsRef.current.set(conn.peer, conn);
          lastPongRef.current.set(meta.deviceId, Date.now());
          setDevices(prev => {
            if (prev.find(d => d.id === meta.deviceId)) return prev;
            return [...prev, { id: meta.deviceId, name: meta.name, isHost: false, isOverlay: meta.isOverlay }];
          });
          setTimeout(() => {
             setDevices(currentDevs => {
               connsRef.current.forEach(c => c.send({ type: 'system', event: 'PRESENCE_UPDATE', payload: currentDevs }));
               if (socketRef.current?.readyState === WebSocket.OPEN) {
                 socketRef.current.send(JSON.stringify({ type: 'broadcast', event: 'PRESENCE_UPDATE', payload: currentDevs }));
               }
               return currentDevs;
             });
          }, 100);
        });

        conn.on('data', (data: unknown) => {
          const typedData = data as { type: string, event: string, payload: any };
          if (typedData.type === 'upstream') {
            if (typedData.event === 'PUSH_VERSE') pushVerse(typedData.payload);
            else if (typedData.event === 'CLEAR_SCREEN') clearScreen();
          } else if (typedData.type === 'system' && typedData.event === 'PONG') {
            lastPongRef.current.set(typedData.payload?.deviceId, Date.now());
          }
        });

        conn.on('close', () => {
          connsRef.current.delete(conn.peer);
          lastPongRef.current.delete(conn.metadata?.deviceId);
          setDevices(prev => {
            const updated = prev.filter(d => d.id !== conn.metadata?.deviceId);
            connsRef.current.forEach(c => c.send({ type: 'system', event: 'PRESENCE_UPDATE', payload: updated }));
            if (socketRef.current?.readyState === WebSocket.OPEN) {
              socketRef.current.send(JSON.stringify({ type: 'broadcast', event: 'PRESENCE_UPDATE', payload: updated }));
            }
            return updated;
          });
        });
      });

      peer.on('error', (err) => {
        console.error("PeerJS Host Error:", err);
        setPeerState('disconnected');
      });

      const pingInterval = setInterval(() => {
        const now = Date.now();
        let devicesChanged = false;

        setDevices(prev => {
          const updated = prev.filter(d => {
            if (d.isHost) return true; // Keep self
            const lastPong = lastPongRef.current.get(d.id) || now;
            if (now - lastPong > 15000) {
              // Device timed out
              lastPongRef.current.delete(d.id);
              // Close associated peer connection if any
              for (const [peerId, conn] of connsRef.current.entries()) {
                if (conn.metadata?.deviceId === d.id) {
                  conn.close();
                  connsRef.current.delete(peerId);
                }
              }
              devicesChanged = true;
              return false;
            }
            return true;
          });

          // Send PING to all PeerJS connections
          connsRef.current.forEach(c => c.send({ type: 'system', event: 'PING' }));

          if (devicesChanged) {
            connsRef.current.forEach(c => c.send({ type: 'system', event: 'PRESENCE_UPDATE', payload: updated }));
            if (socketRef.current?.readyState === WebSocket.OPEN) {
              socketRef.current.send(JSON.stringify({ type: 'broadcast', event: 'PRESENCE_UPDATE', payload: updated }));
            }
          }

          return updated;
        });
      }, 5000);

      peerRef.current = peer;

      // Cleanup
      peerRef.current.on('close', () => clearInterval(pingInterval));
      peerRef.current.on('error', () => clearInterval(pingInterval));

    } else {
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
          setPeerState('connected');
          hostConnRef.current = conn;
        });

        conn.on('data', (data: unknown) => {
          const typedData = data as { type: string, event: string, payload: any };
          if (typedData.type === 'system') {
            if (typedData.event === 'PING') {
              conn.send({ type: 'system', event: 'PONG', payload: { deviceId: myId } });
            } else if (typedData.event === 'ACCESS_DENIED') {
              setHostStatus('denied');
            } else if (typedData.event === 'PRESENCE_UPDATE') {
              setDevices(typedData.payload);
            }
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
          setPeerState('disconnected');
        });
      });

      peer.on('error', (err) => {
        console.error("PeerJS Client Error:", err);
        setHostStatus('offline');
        setPeerState('disconnected');
      });

      peerRef.current = peer;

      // Start WebSocket Ping Loop for fallback presence
      const wsPingInterval = setInterval(() => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({ 
            type: 'broadcast', 
            event: 'UPSTREAM_PING', 
            payload: { deviceId: myId, name: myName, isOverlay } 
          }));
        }
      }, 10000);

      socketRef.current.addEventListener('close', () => clearInterval(wsPingInterval));
    }
  }, [roomId, isHost, myId, myName, isOverlay, pushVerse, clearScreen]);

  useEffect(() => {
    connect();
    return () => {
      peerRef.current?.destroy();
      socketRef.current?.close();
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, [connect]);

  // Robust Retry Mechanism
  useEffect(() => {
    // If we're fully connected on at least one, reset retry count
    if (wsState === 'connected' || peerState === 'connected') {
      retryCount.current = 0;
      setRetryAt(null);
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
      return;
    }

    // If both are disconnected and we aren't already counting down
    if (wsState === 'disconnected' && peerState === 'disconnected' && !retryTimerRef.current) {
      const retries = retryCount.current;
      retryCount.current = retries + 1;
      
      // Exponential backoff: 2s, 4s, 8s, 16s, 30s
      const delayMs = Math.min(1000 * Math.pow(2, retries + 1), 30000);
      
      setRetryAt(Date.now() + delayMs);

      retryTimerRef.current = setTimeout(() => {
        setRetryAt(null);
        retryTimerRef.current = null;
        
        // Ensure UI transitions to 'reconnecting' immediately
        setWsState('reconnecting');
        setPeerState('reconnecting');
        
        connect();
      }, delayMs);
    }
    
    return () => {
      // Don't clear retryTimerRef here because we want it to persist across re-renders
    };
  }, [wsState, peerState, connect]);

  // Handle active internet restoration/drops via useNetworkProber
  useEffect(() => {
    if (trueInternetActive) {
      // If internet is suddenly active and we are waiting to retry, force it immediately
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
        setRetryAt(null);
        retryCount.current = 0; // Reset backoff since we know network is good
        connect();
      }
    } else {
      // If internet suddenly drops to false (multiple failed pings), kill hanging connections
      if (wsState === 'connected' || wsState === 'connecting') {
        socketRef.current?.close();
      }
    }
  }, [trueInternetActive, wsState, connect]);

  const forceReconnect = useCallback(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    setRetryAt(null);
    retryCount.current = 0; // Reset backoff
    connect();
  }, [connect]);

  // Immediately detect OS-level network drops/restores
  useEffect(() => {
    const handleOffline = () => {
      setWsState('disconnected');
      setPeerState('disconnected');
    };
    
    const handleOnline = () => {
      forceReconnect();
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [forceReconnect]);

  // Auto-resync when the Host itself reconnects to the network
  const prevConnState = useRef('disconnected');
  useEffect(() => {
    const isConnected = wsState === 'connected' || peerState === 'connected';
    if (isConnected && prevConnState.current !== 'connected') {
      if (isHost && lastBroadcastStateRef.current) {
        const { event, payload } = lastBroadcastStateRef.current;
        if (event === 'PUSH_VERSE' && payload) {
          pushVerse(payload);
        } else if (event === 'CLEAR_SCREEN') {
          clearScreen();
        }
      }
    }
    prevConnState.current = isConnected ? 'connected' : 'disconnected';
  }, [wsState, peerState, isHost, pushVerse, clearScreen]);

  // Unified connection state for UI
  const connectionState: 'connected' | 'connecting' | 'reconnecting' | 'disconnected' = 
    (wsState === 'connected' || peerState === 'connected') 
      ? 'connected' 
      : (retryAt !== null || wsState === 'reconnecting' || peerState === 'reconnecting' || wsState === 'connecting' || peerState === 'connecting') 
        ? 'reconnecting' 
        : 'disconnected';

  return {
    wsState,
    peerState,
    devices,
    hostStatus,
    myId,
    isReady,
    pushVerse,
    clearScreen,
    broadcastReset,
    sendJoinRequest,
    respondToJoinRequest,
    connectionState,
    retryCountdown,
    forceReconnect,
    pingMs,
    consecutiveFailures,
  };
}

/**
 * Discovery Hooks - We keep these on Supabase because they don't use real-time
 * WebSockets for the core syncing, they just poll a database table for LAN discovery.
 */

let cachedPublicIp: string | null = null;
let isFetchingIp = false;
let ipFetchPromise: Promise<string> | null = null;

async function getPublicIp(): Promise<string> {
  if (cachedPublicIp) return cachedPublicIp;
  if (isFetchingIp && ipFetchPromise) return ipFetchPromise;

  isFetchingIp = true;
  ipFetchPromise = fetch('https://api.ipify.org?format=json')
    .then(res => res.json())
    .then(data => {
      cachedPublicIp = data.ip;
      isFetchingIp = false;
      return data.ip;
    })
    .catch(err => {
      isFetchingIp = false;
      throw err;
    });

  return ipFetchPromise;
}

// Re-fetch IP when coming back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    cachedPublicIp = null;
    getPublicIp().catch(console.error);
  });
}

export function useHeartbeat(roomId: string | null, isHost: boolean, isDiscoverable: boolean) {
  const myId = getDeviceId();
  
  useEffect(() => {
    if (!roomId || !isHost || !isDiscoverable) return;
    
    const updateHeartbeat = async () => {
      try {
        const ip = await getPublicIp();
        
        const relayApiUrl = import.meta.env.VITE_RELAY_SERVER_URL 
          ? import.meta.env.VITE_RELAY_SERVER_URL.replace(/^ws/, 'http').replace(/\/$/, '')
          : 'http://localhost:8080';
          
        await fetch(`${relayApiUrl}/api/heartbeat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            room_id: roomId,
            host_device_id: myId,
            public_ip: ip,
            is_discoverable: true
          })
        });
      } catch (err) {
        console.error("Heartbeat error", err);
      }
    };
    
    updateHeartbeat();
    const interval = setInterval(updateHeartbeat, 15000); // 15s heartbeat
    
    return () => {
      clearInterval(interval);
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
      const ip = await getPublicIp();
      
      const relayApiUrl = import.meta.env.VITE_RELAY_SERVER_URL 
        ? import.meta.env.VITE_RELAY_SERVER_URL.replace(/^ws/, 'http').replace(/\/$/, '')
        : 'http://localhost:8080';
        
      const res = await fetch(`${relayApiUrl}/api/discovery?ip=${encodeURIComponent(ip)}`);
      const data = await res.json();
        
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
