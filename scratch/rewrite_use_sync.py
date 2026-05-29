import re

def main():
    file_path = "src/hooks/useSync.ts"
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Define the new hook
    new_code = """
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
  const hostConnRef = useRef<DataConnection | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const [devices, setDevices] = useState<DevicePresence[]>([]);
  const [hostStatus, setHostStatus] = useState<HostStatus>('offline');
  const [isReady, setIsReady] = useState(false);

  const [wsState, setWsState] = useState<ConnectionState>('disconnected');
  const [peerState, setPeerState] = useState<ConnectionState>('disconnected');
  const [retryCountdown, setRetryCountdown] = useState<number | null>(null);
  
  const retryCount = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const pushVerse = useCallback((payload: VersePayload) => {
    const data = { type: 'broadcast', event: 'PUSH_VERSE', payload };
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
    tempConn.on('open', () => {
      setTimeout(() => tempConn.close(), 2000);
    });
  }, [myId]);

  const respondToJoinRequest = useCallback((targetDeviceId: string, accepted: boolean, newRoomId: string) => {
    if (isHost) {
      const data = {
        type: 'broadcast',
        event: 'JOIN_RESPONSE',
        payload: { targetDeviceId, accepted, newRoomId }
      };
      connsRef.current.forEach(conn => conn.send(data));
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
            }
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
            callbacksRef.current?.onJoinRequest?.({
              fromRoom: '', deviceId: meta.deviceId, name: meta.name
            });
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
             const currentDevices = Array.from(connsRef.current.values()).map(c => ({
               id: c.metadata?.deviceId, name: c.metadata?.name, isHost: false, isOverlay: c.metadata?.isOverlay
             }));
             const allDevs = [{ id: myId, name: myName, isHost: true, isOverlay: false }, ...currentDevices];
             connsRef.current.forEach(c => c.send({ type: 'system', event: 'PRESENCE_UPDATE', payload: allDevs }));
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
          setDevices(prev => prev.filter(d => d.id !== conn.metadata?.deviceId));
          const currentDevices = Array.from(connsRef.current.values()).map(c => ({
            id: c.metadata?.deviceId, name: c.metadata?.name, isHost: false, isOverlay: c.metadata?.isOverlay
          }));
          const allDevs = [{ id: myId, name: myName, isHost: true, isOverlay: false }, ...currentDevices];
          connsRef.current.forEach(c => c.send({ type: 'system', event: 'PRESENCE_UPDATE', payload: allDevs }));
        });
      });

      peer.on('error', (err) => {
        console.error("PeerJS Host Error:", err);
        setPeerState('disconnected');
      });

      const pingInterval = setInterval(() => {
        const now = Date.now();
        connsRef.current.forEach((c, peerId) => {
          const deviceId = c.metadata?.deviceId;
          const lastPong = lastPongRef.current.get(deviceId) || now;
          if (now - lastPong > 15000) {
            c.close();
            connsRef.current.delete(peerId);
            lastPongRef.current.delete(deviceId);
            setDevices(prev => prev.filter(d => d.id !== deviceId));
            const currentDevices = Array.from(connsRef.current.values()).map(conn => ({
              id: conn.metadata?.deviceId, name: conn.metadata?.name, isHost: false, isOverlay: conn.metadata?.isOverlay
            }));
            const allDevs = [{ id: myId, name: myName, isHost: true, isOverlay: false }, ...currentDevices];
            connsRef.current.forEach(conn => conn.send({ type: 'system', event: 'PRESENCE_UPDATE', payload: allDevs }));
          } else {
            c.send({ type: 'system', event: 'PING' });
          }
        });
      }, 5000);

      peerRef.current = peer;

      // Make sure we attach pingInterval cleanup properly
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
    }
  }, [roomId, isHost, myId, myName, isOverlay, pushVerse, clearScreen]);

  useEffect(() => {
    connect();
    return () => {
      peerRef.current?.destroy();
      socketRef.current?.close();
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      if (tickTimerRef.current) clearInterval(tickTimerRef.current);
    };
  }, [connect]);

  // Robust Retry Mechanism
  useEffect(() => {
    // If we're fully connected on at least one, reset retry count
    if (wsState === 'connected' || peerState === 'connected') {
      retryCount.current = 0;
      setRetryCountdown(null);
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      if (tickTimerRef.current) clearInterval(tickTimerRef.current);
      retryTimerRef.current = null;
      tickTimerRef.current = null;
      return;
    }

    // If both are disconnected and we aren't already counting down
    if (wsState === 'disconnected' && peerState === 'disconnected' && !retryTimerRef.current) {
      let retries = retryCount.current;
      retryCount.current = retries + 1;
      
      // Exponential backoff: 2s, 4s, 8s, 16s, 30s
      let delayMs = Math.min(1000 * Math.pow(2, retries + 1), 30000);
      let seconds = Math.ceil(delayMs / 1000);
      
      setRetryCountdown(seconds);
      
      tickTimerRef.current = setInterval(() => {
        seconds -= 1;
        if (seconds <= 0) {
          if (tickTimerRef.current) clearInterval(tickTimerRef.current);
        } else {
          setRetryCountdown(seconds);
        }
      }, 1000);

      retryTimerRef.current = setTimeout(() => {
        if (tickTimerRef.current) clearInterval(tickTimerRef.current);
        setRetryCountdown(null);
        retryTimerRef.current = null;
        
        // Ensure UI transitions to 'reconnecting' immediately
        setWsState('reconnecting');
        setPeerState('reconnecting');
        
        connect();
      }, delayMs);
    }
  }, [wsState, peerState, connect]);

  const forceReconnect = useCallback(() => {
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    if (tickTimerRef.current) clearInterval(tickTimerRef.current);
    retryTimerRef.current = null;
    tickTimerRef.current = null;
    setRetryCountdown(null);
    setWsState('reconnecting');
    setPeerState('reconnecting');
    retryCount.current = 0;
    connect();
  }, [connect]);

  // Unified connection state for UI
  const connectionState = (wsState === 'connected' || peerState === 'connected') 
    ? 'connected' 
    : (wsState === 'reconnecting' || peerState === 'reconnecting') 
      ? 'reconnecting' 
      : 'disconnected';

  return {
    devices,
    myId,
    hostStatus,
    isReady,
    pushVerse,
    clearScreen,
    broadcastReset,
    sendJoinRequest,
    respondToJoinRequest,
    connectionState,
    retryCountdown,
    forceReconnect
  };
}
"""

    start_idx = content.find("export function useWebRTCNode(")
    end_idx = content.find("/**\n * Discovery Hooks")

    if start_idx == -1 or end_idx == -1:
        print("Could not find start or end index.")
        return

    new_content = content[:start_idx] + new_code + "\n" + content[end_idx:]

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(new_content)

    print("Updated useSync.ts successfully.")

if __name__ == "__main__":
    main()
