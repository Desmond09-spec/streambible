import { useState, useEffect, useRef } from 'react';

export function useNetworkProber() {
  const [pingMs, setPingMs] = useState<number | null>(null);
  const [trueInternetActive, setTrueInternetActive] = useState<boolean>(true);
  const [consecutiveFailures, setConsecutiveFailures] = useState<number>(0);
  
  const pingHistoryRef = useRef<number[]>([]);
  const PING_INTERVAL = 2000; // 2 seconds
  const WINDOW_SIZE = 10;
  
  useEffect(() => {
    let isActive = true;

    const probeNetwork = async () => {
      if (!isActive) return;
      
      let success = false;
      let latency = -1;
      const start = performance.now();
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5s hard timeout
        
        const res = await fetch('https://dns.google/resolve?name=google.com', {
          method: 'GET',
          cache: 'no-store',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (res.ok) {
          const json = await res.json();
          // Status 0 means NOERROR in DNS resolution
          if (json && json.Status === 0) {
            success = true;
          }
        }
      } catch (e) {
        // Fetch failed, timeout, or captive portal intercepted and returned non-JSON
        success = false;
      }
      
      const end = performance.now();
      if (success) {
        latency = Math.round(end - start);
      }

      if (!isActive) return;

      const history = pingHistoryRef.current;
      history.push(latency);
      if (history.length > WINDOW_SIZE) {
        history.shift();
      }

      const successfulPings = history.filter(h => h >= 0);
      if (!success || successfulPings.length === 0) {
        setPingMs(null);
      } else {
        // Average of last few successful pings
        const avg = Math.round(successfulPings.reduce((a, b) => a + b, 0) / successfulPings.length);
        setPingMs(avg);
      }
      
      setConsecutiveFailures(prev => {
        const newCount = success ? 0 : prev + 1;
        // If we hit 3 consecutive failures, network is dead. 
        // If we get 1 success, network is instantly restored.
        if (newCount >= 3) {
          setTrueInternetActive(false);
        } else if (success) {
          setTrueInternetActive(true);
        }
        return newCount;
      });
    };

    // Initial probe
    probeNetwork();

    const intervalId = setInterval(probeNetwork, PING_INTERVAL);

    return () => {
      isActive = false;
      clearInterval(intervalId);
    };
  }, []);

  return { pingMs, trueInternetActive, consecutiveFailures };
}
