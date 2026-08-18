import { useEffect, useState } from 'react';
import { Device } from '@capacitor/device';
import { isNative } from './useNative';

type BatteryManagerLike = {
  charging: boolean;
  addEventListener(type: 'chargingchange', listener: () => void): void;
  removeEventListener(type: 'chargingchange', listener: () => void): void;
};

type NavigatorWithBattery = Navigator & { getBattery(): Promise<BatteryManagerLike> };

// Battery Status API is Chromium-only on web; native always knows
export const supportsCharging = (): boolean => isNative() || 'getBattery' in navigator;

export function useCharging(): boolean {
  const [charging, setCharging] = useState(false);

  useEffect(() => {
    let disposed = false;

    if (isNative()) {
      // @capacitor/device has no charging event — poll
      const poll = async () => {
        const info = await Device.getBatteryInfo();
        if (!disposed) setCharging(info.isCharging ?? false);
      };
      void poll();
      const id = setInterval(() => void poll(), 10_000);
      return () => {
        disposed = true;
        clearInterval(id);
      };
    }

    if (!('getBattery' in navigator)) return;
    let battery: BatteryManagerLike | null = null;
    const onChange = () => {
      if (battery) setCharging(battery.charging);
    };
    void (navigator as NavigatorWithBattery).getBattery().then((manager) => {
      if (disposed) return;
      battery = manager;
      setCharging(manager.charging);
      manager.addEventListener('chargingchange', onChange);
    });
    return () => {
      disposed = true;
      battery?.removeEventListener('chargingchange', onChange);
    };
  }, []);

  return charging;
}
