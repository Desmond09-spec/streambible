import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';

export interface VersePayload {
  ref: string;
  primaryText: string;
  primaryVersion: string;
  secondaryText?: string;
  secondaryVersion?: string;
  showPrimary?: boolean;
  showSecondary?: boolean;
  primarySource?: 'local' | 'api.bible' | 'nlt';
  secondarySource?: 'local' | 'api.bible' | 'nlt';
  showVerseNumbers?: boolean;
  fums?: string;
  book?: string;
  chapter?: number;
  verse?: number;
  text?: string;
  versionId?: string;
}

export interface SessionContextType {
  wsConnected: boolean;
  connectionState: 'connected' | 'connecting' | 'reconnecting' | 'disconnected';
  pushVerse: (payload: VersePayload) => void;
  broadcastClear: () => void;
  forceReconnect: () => void;
  
  // Dummy fields to prevent breaking existing UI components before we clean them up
  roomId: string;
  isHost: boolean;
  devices: any[];
  myId: string;
  hostStatus: string;
  remoteAccess: boolean;
  setRemoteAccess: (val: boolean) => void;
  discoveryEnabled: boolean;
  setDiscoveryEnabled: (val: boolean) => void;
  joinRequest: any;
  setJoinRequest: any;
  incomingRequest: any;
  setIncomingRequest: any;
  requestStatus: any;
  setRequestStatus: any;
  nearbySessions: any[];
  refreshDiscovery: () => Promise<void>;
  isDiscovering: boolean;
  regenerateRoom: () => void;
  pendingReset: boolean;
  confirmRegenerate: () => void;
  cancelRegenerate: () => void;
  handleJoinRequest: (id: string) => Promise<void>;
  handleResponse: (acc: boolean) => Promise<void>;
  user: any;
  claimedRoomId: string | null;
  hasOnboarded: boolean;
  setHasOnboarded: (val: boolean) => void;
  retryCountdown: number | null;
  pingMs: number | null;
  consecutiveFailures: number;
}

const SessionContext = createContext<SessionContextType | null>(null);

export const useSession = () => {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
};

export const SessionProvider: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const [serverConnected, setServerConnected] = useState(false);
  const [connectedClients, setConnectedClients] = useState(0);
  const [pingMs, setPingMs] = useState<number | null>(null);
  const [connectionState, setConnectionState] = useState<'connected' | 'connecting' | 'reconnecting' | 'disconnected'>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    setConnectionState('connecting');
    let wsUrl = '';
    if (window.location.protocol === 'file:') {
      wsUrl = 'ws://127.0.0.1:3456/ws-relay';
    } else {
      wsUrl = `ws://${window.location.hostname}:${window.location.port}/ws-relay`;
    }

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setServerConnected(true);
      setConnectionState('connected');
      // Identify this connection as the controller so the server can exclude it from overlay counts
      ws.send(JSON.stringify({ type: 'register', role: 'controller' }));
    };

    ws.onclose = () => {
      setServerConnected(false);
      setConnectedClients(0);
      setPingMs(null);
      setConnectionState('disconnected');
      wsRef.current = null;
    };

    ws.onerror = (err) => {
      console.warn('WebSocket error:', err);
      ws.close();
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'push_verse') {
          window.dispatchEvent(new CustomEvent('streambible-verse', { detail: data.payload }));
        } else if (data.type === 'clear_screen') {
          window.dispatchEvent(new CustomEvent('streambible-clear'));
        } else if (data.type === 'client_count') {
          setConnectedClients(data.count ?? 0);
          // No overlays → no meaningful ping
          if ((data.count ?? 0) === 0) setPingMs(null);
        } else if (data.type === 'pong') {
          // Round-trip time from controller → relay → overlay → relay → controller
          if (typeof data.ts === 'number') {
            setPingMs(Date.now() - data.ts);
          }
        }
      } catch (e) {
        // ignore malformed messages
      }
    };
  }, []);

  useEffect(() => {
    connectWebSocket();
    const interval = setInterval(() => {
      if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
        connectWebSocket();
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [connectWebSocket]);

  // Send a ping to overlays every 3s to measure real RTT.
  // The overlays bounce back a pong with the same timestamp.
  useEffect(() => {
    const startPing = () => {
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = setInterval(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN && connectedClients > 0) {
          wsRef.current.send(JSON.stringify({ type: 'ping', ts: Date.now() }));
        } else if (connectedClients === 0) {
          setPingMs(null);
        }
      }, 3000);
    };
    startPing();
    return () => {
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
    };
  }, [connectedClients]);

  const pushVerse = useCallback((payload: VersePayload) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'push_verse', payload }));
    }
  }, []);

  const broadcastClear = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'clear_screen' }));
    }
  }, []);

  const forceReconnect = useCallback(() => {
    if (wsRef.current) wsRef.current.close();
    connectWebSocket();
  }, [connectWebSocket]);

  // wsConnected = true only when at least one overlay (non-controller) client is actually connected
  const wsConnected = connectedClients > 0;

  // Build a real devices list from connected overlay count
  const devices = Array.from({ length: connectedClients }, (_, i) => ({
    id: `overlay-${i + 1}`,
    name: `Overlay ${i + 1}`,
    isHost: false,
    isOverlay: true,
  }));

  const ctx: SessionContextType = {
    wsConnected, connectionState, pushVerse, broadcastClear, forceReconnect,
    roomId: 'LOCAL', isHost: true, devices,
    myId: 'local', hostStatus: serverConnected ? 'online' : 'offline',
    remoteAccess: false, setRemoteAccess: () => {},
    discoveryEnabled: false, setDiscoveryEnabled: () => {},
    joinRequest: null, setJoinRequest: () => {},
    incomingRequest: null, setIncomingRequest: () => {},
    requestStatus: 'idle', setRequestStatus: () => {},
    nearbySessions: [], refreshDiscovery: async () => {}, isDiscovering: false,
    regenerateRoom: () => {}, pendingReset: false,
    confirmRegenerate: () => {}, cancelRegenerate: () => {},
    handleJoinRequest: async () => {}, handleResponse: async () => {},
    user: null, claimedRoomId: null, hasOnboarded: true, setHasOnboarded: () => {},
    retryCountdown: null, pingMs, consecutiveFailures: 0
  };

  return (
    <SessionContext.Provider value={ctx}>
      {children ? children : <Outlet />}
    </SessionContext.Provider>
  );
};
