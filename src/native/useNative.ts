import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';
import { KeepAwake } from '@capacitor-community/keep-awake';

export const isNative = (): boolean => Capacitor.isNativePlatform();

export function useNative(keepAwake: boolean): void {
  useEffect(() => {
    if (!isNative()) return;
    void StatusBar.hide();
  }, []);

  useEffect(() => {
    if (!isNative()) return;
    if (keepAwake) void KeepAwake.keepAwake();
    else void KeepAwake.allowSleep();
  }, [keepAwake]);
}
