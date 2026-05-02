import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface VersePayload {
  ref: string;
  primaryText: string;
  primaryVersion: string;
  secondaryText: string;
  secondaryVersion: string;
  showPrimary: boolean;
  showSecondary: boolean;
  source: 'youversion' | 'biblebrain' | 'local';
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

function getDeviceId() {
  let id = localStorage.getItem('streambible-device-id');
  if (!id) {
    id = Math.random().toString(36).substring(2, 10);
    localStorage.setItem('streambible-device-id', id);
  }
  return id;
}

function getFriendlyDeviceName() {
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

/**
 * Publisher hook — used by ControllerPage to broadcast verse updates.
 */
export function useSyncPublisher(roomId: string) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!roomId) return;
    const channelName = `streambible-sync-${roomId}`;
    const channel = supabase.channel(channelName);
    channel.subscribe();
    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [roomId]);

  const pushVerse = useCallback((payload: VersePayload) => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'PUSH_VERSE',
      payload,
    });
  }, []);

  const clearScreen = useCallback(() => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'CLEAR_SCREEN',
      payload: {},
    });
  }, []);

  const broadcastReset = useCallback(() => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'ROOM_RESET',
      payload: {},
    });
  }, []);

  return { pushVerse, clearScreen, broadcastReset };
}

/**
 * Subscriber hook — used by OverlayPage and FullScreenPage to receive updates.
 */
export function useSyncSubscriber(
  roomId: string | null,
  onVerseUpdate: (payload: VersePayload) => void,
  onClear: () => void
) {
  useEffect(() => {
    if (!roomId) return;
    const channelName = `streambible-sync-${roomId}`;
    const channel = supabase
      .channel(channelName)
      .on('broadcast', { event: 'PUSH_VERSE' }, ({ payload }) => {
        onVerseUpdate(payload as VersePayload);
      })
      .on('broadcast', { event: 'CLEAR_SCREEN' }, () => {
        onClear();
      })
      .on('broadcast', { event: 'ROOM_RESET' }, () => {
        window.location.reload();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [roomId, onVerseUpdate, onClear]);
}

/**
 * Presence hook — tracks connected devices in a room.
 */
export function usePresence(roomId: string, isOverlay: boolean = false, remoteAccess: boolean = true) {
  const [devices, setDevices] = useState<DevicePresence[]>([]);
  const [hostStatus, setHostStatus] = useState<'online' | 'offline' | 'denied'>('online');
  const [isReady, setIsReady] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const remoteAccessRef = useRef(remoteAccess);
  const myId = getDeviceId();

  useEffect(() => {
    remoteAccessRef.current = remoteAccess;
  }, [remoteAccess]);

  useEffect(() => {
    Promise.resolve().then(() => setIsReady(false));
    if (!roomId) return;
    const channelName = `streambible-presence-${roomId}`;
    const isHost = localStorage.getItem(`streambible-host-${roomId}`) === 'true';

    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: myId,
        },
      },
    });
    
    channelRef.current = channel;

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const connectedDevices: DevicePresence[] = [];
        let hostFound = false;
        let accessGranted = false;
        let latestHostUpdate = 0;
        
        for (const [key, presences] of Object.entries(state)) {
           for (const p of presences as { name?: string; isHost?: boolean; isOverlay?: boolean; updatedAt?: number; remoteAccess?: boolean }[]) {
              const device = {
                 id: key,
                 name: p.name || 'Unknown Device',
                 isHost: p.isHost || false,
                 isOverlay: p.isOverlay || false
              };
              
              if (!connectedDevices.find(d => d.id === key)) {
                connectedDevices.push(device);
              }

              if (device.isHost) {
                hostFound = true;
                // Use the most recently updated host presence to determine access (ignores stale ghost connections)
                const updateTime = p.updatedAt || 0;
                if (updateTime >= latestHostUpdate) {
                  latestHostUpdate = updateTime;
                  accessGranted = p.remoteAccess !== false;
                }
              }
           }
        }
        
        setDevices(connectedDevices);
        
        // Host management logic for guests/overlays
        if (!isHost) {
          if (!hostFound) {
            setHostStatus('offline');
          } else if (!accessGranted) {
            setHostStatus('denied');
          } else {
            setHostStatus('online');
          }
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsReady(true);
          await channel.track({
            name: getFriendlyDeviceName(),
            isHost,
            isOverlay,
            remoteAccess: isHost ? remoteAccessRef.current : true,
            updatedAt: Date.now()
          });
        }
      });

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [roomId, isOverlay, myId]);

  // Update presence dynamically without dropping the connection
  useEffect(() => {
    if (channelRef.current) {
      const isHost = localStorage.getItem(`streambible-host-${roomId}`) === 'true';
      // channel.track automatically broadcasts the updated state to clients
      channelRef.current.track({
        name: getFriendlyDeviceName(),
        isHost,
        isOverlay,
        remoteAccess: isHost ? remoteAccess : true,
        updatedAt: Date.now()
      }).catch((e: unknown) => console.log('Track update failed, might not be subscribed yet', e));
    }
  }, [remoteAccess, roomId, isOverlay]);

  return { devices, myId, hostStatus, isReady };
}

/**
 * Heartbeat hook — keeps a session active in the global discovery table.
 */
export function useHeartbeat(roomId: string, isHost: boolean, isDiscoverable: boolean) {
  useEffect(() => {
    if (!roomId || !isHost) return;

    const sendHeartbeat = async () => {
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const { ip } = await ipRes.json();
        console.log('Heartbeat IP:', ip);

        const { error } = await supabase
          .from('active_sessions')
          .upsert({
            room_id: roomId,
            host_device_id: getDeviceId(),
            public_ip: ip,
            is_discoverable: isDiscoverable,
            last_seen: new Date().toISOString()
          }, { onConflict: 'room_id' });
        
        if (error) console.error('Supabase Heartbeat Error:', error);
      } catch (e) {
        console.error('Heartbeat failed', e);
      }
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 20000);

    const cleanup = () => {
      // Use navigator.sendBeacon if possible for more reliable tab-close cleanup
      // But for simple projects, a basic delete works fairly well if the tab is still closing
      const { supabaseUrl, supabaseAnonKey } = (supabase as unknown as Record<string, string>);
      if (supabaseUrl && supabaseAnonKey) {
        const url = `${supabaseUrl}/rest/v1/active_sessions?room_id=eq.${roomId}`;
        const headers = {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json'
        };
        fetch(url, { method: 'DELETE', headers, keepalive: true });
      }
    };

    window.addEventListener('beforeunload', cleanup);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', cleanup);
      cleanup();
    };
  }, [roomId, isHost, isDiscoverable]);
}

/**
 * Discovery hook — finds sessions on the same public IP.
 */
export function useDiscovery(enabled: boolean) {
  const [nearbySessions, setNearbySessions] = useState<ActiveSession[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    
    setIsDiscovering(true);
    try {
      const ipRes = await fetch('https://api.ipify.org?format=json');
      const { ip } = await ipRes.json();
      console.log('Discovery IP:', ip);

      const { data, error } = await supabase
        .from('active_sessions')
        .select('*')
        .eq('public_ip', ip)
        .eq('is_discoverable', true)
        .gt('last_seen', new Date(Date.now() - 60000).toISOString()); // filter stale
      
      if (error) console.error('Supabase Discovery Error:', error);
      setNearbySessions(data || []);
    } catch (e) {
      console.error('Discovery failed', e);
    } finally {
      setIsDiscovering(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (enabled) {
      Promise.resolve().then(() => refresh());
      const interval = setInterval(refresh, 15000);
      return () => clearInterval(interval);
    } else {
      Promise.resolve().then(() => {
        setNearbySessions([]);
        setIsDiscovering(false);
      });
    }
  }, [enabled, refresh]);

  return { nearbySessions, refresh, isDiscovering };
}
