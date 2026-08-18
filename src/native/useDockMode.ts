import { useEffect, useState } from 'react';
import { supportsCharging, useCharging } from './useCharging';
import { isNative } from './useNative';

const LANDSCAPE = '(orientation: landscape)';

// Web dock is touch-devices only: desktop Chromium reports plugged-in machines as "charging"
export const supportsDock = (): boolean =>
  isNative() || (supportsCharging() && window.matchMedia('(pointer: coarse)').matches);

function useLandscape(): boolean {
  const [landscape, setLandscape] = useState(() => window.matchMedia(LANDSCAPE).matches);

  useEffect(() => {
    const query = window.matchMedia(LANDSCAPE);
    const onChange = (event: MediaQueryListEvent) => setLandscape(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return landscape;
}

// Charging + landscape → night-clock takeover (StandBy-style)
export function useDockMode(enabled: boolean): boolean {
  const charging = useCharging();
  const landscape = useLandscape();
  return enabled && supportsDock() && charging && landscape;
}
