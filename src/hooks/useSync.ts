import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface VersePayload {
  ref: string;
  en: string;
  yo: string;
  showEn: boolean;
  showYo: boolean;
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

  return { pushVerse, clearScreen };
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
  const myId = getDeviceId();

  useEffect(() => {
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

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const connectedDevices: DevicePresence[] = [];
        let hostFound = false;
        let accessGranted = true;
        
        for (const [key, presences] of Object.entries(state)) {
           if (presences.length > 0) {
              const p = presences[0] as any;
              const device = {
                 id: key,
                 name: p.name || 'Unknown Device',
                 isHost: p.isHost || false,
                 isOverlay: p.isOverlay || false
              };
              connectedDevices.push(device);

              if (device.isHost) {
                hostFound = true;
                if (p.remoteAccess === false) {
                  accessGranted = false;
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
          await channel.track({
            name: getFriendlyDeviceName(),
            isHost,
            isOverlay,
            remoteAccess: isHost ? remoteAccess : true // Only the host's remoteAccess value matters
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [roomId, isOverlay, remoteAccess]);

  return { devices, myId, hostStatus };
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
      const { supabaseUrl, supabaseAnonKey } = (supabase as any);
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
export function useDiscovery() {
  const [nearbySessions, setNearbySessions] = useState<ActiveSession[]>([]);

  const refresh = useCallback(async () => {
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
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 15000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { nearbySessions, refresh };
}
