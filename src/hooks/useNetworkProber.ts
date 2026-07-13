import { useState } from 'react';

export function useNetworkProber() {
  // OFFLINE VERSION: Disabled network probing to prevent firewall errors
  const [pingMs] = useState<number | null>(null);
  const [trueInternetActive] = useState<boolean>(false); // Always false for offline
  const [consecutiveFailures] = useState<number>(0);
  
  return { pingMs, trueInternetActive, consecutiveFailures };
}
