import { useEffect, useRef } from 'react';
import { App } from '@capacitor/app';
import { isNative } from './useNative';

// Registering a backButton listener replaces Capacitor's default (finish the activity), so
// anything the app doesn't consume has to exit by hand
export function useBackButton(onBack: () => boolean): void {
  const handler = useRef(onBack);
  handler.current = onBack;

  useEffect(() => {
    if (!isNative()) return;

    const listener = App.addListener('backButton', () => {
      if (!handler.current()) void App.exitApp();
    });
    return () => void listener.then((handle) => handle.remove());
  }, []);
}
