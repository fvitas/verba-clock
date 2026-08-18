import { useEffect } from 'react';
import { isNative } from './useNative';

// Native uses @capacitor-community/keep-awake; this covers browsers only
export const supportsWakeLock = (): boolean => !isNative() && 'wakeLock' in navigator;

export function useWakeLock(enabled: boolean): void {
  useEffect(() => {
    if (!enabled || !supportsWakeLock()) return;

    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    const acquire = async () => {
      try {
        const lock = await navigator.wakeLock.request('screen');
        if (cancelled) await lock.release();
        else sentinel = lock;
      } catch {
        // Request can be denied (battery saver, permissions policy) — clock still runs
      }
    };

    // Browsers release the lock whenever the tab is hidden — re-acquire on return
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') void acquire();
    };

    void acquire();
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibilityChange);
      void sentinel?.release();
    };
  }, [enabled]);
}
