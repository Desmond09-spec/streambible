import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface VersePayload {
  ref: string;
  en: string;
  yo: string;
  showEn: boolean;
  showYo: boolean;
}

const CHANNEL_NAME = 'streambible-sync';

/**
 * Publisher hook — used by ControllerPage to broadcast verse updates.
 */
export function useSyncPublisher() {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    const channel = supabase.channel(CHANNEL_NAME);
    channel.subscribe();
    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, []);

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
  onVerseUpdate: (payload: VersePayload) => void,
  onClear: () => void
) {
  useEffect(() => {
    const channel = supabase
      .channel(CHANNEL_NAME)
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
  }, [onVerseUpdate, onClear]);
}
