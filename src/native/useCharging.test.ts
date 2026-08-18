import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, expect, it, beforeEach, afterEach } from 'vitest';

const isNative = vi.fn();
vi.mock('./useNative', () => ({ isNative: () => isNative() }));

const getBatteryInfo = vi.fn();
vi.mock('@capacitor/device', () => ({ Device: { getBatteryInfo: () => getBatteryInfo() } }));

import { supportsCharging, useCharging } from './useCharging';

type Listener = () => void;

function stubBattery(charging: boolean) {
  const listeners = new Set<Listener>();
  const manager = {
    charging,
    addEventListener: (_: string, listener: Listener) => listeners.add(listener),
    removeEventListener: (_: string, listener: Listener) => listeners.delete(listener),
  };
  Object.defineProperty(navigator, 'getBattery', {
    value: () => Promise.resolve(manager),
    configurable: true,
  });
  return {
    manager,
    setCharging(next: boolean) {
      manager.charging = next;
      listeners.forEach((listener) => listener());
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  isNative.mockReturnValue(false);
});

afterEach(() => {
  Reflect.deleteProperty(navigator, 'getBattery');
});

describe('supportsCharging', () => {
  it('is true on native', () => {
    isNative.mockReturnValue(true);
    expect(supportsCharging()).toBe(true);
  });

  it('is true on web with the Battery API', () => {
    stubBattery(false);
    expect(supportsCharging()).toBe(true);
  });

  it('is false on web without the Battery API', () => {
    expect(supportsCharging()).toBe(false);
  });
});

describe('useCharging', () => {
  it('is false without the Battery API', () => {
    const { result } = renderHook(() => useCharging());
    expect(result.current).toBe(false);
  });

  it('reads the initial charging state', async () => {
    stubBattery(true);
    const { result } = renderHook(() => useCharging());
    await waitFor(() => expect(result.current).toBe(true));
  });

  it('follows chargingchange events', async () => {
    const battery = stubBattery(false);
    const { result } = renderHook(() => useCharging());
    await waitFor(() => expect(result.current).toBe(false));
    act(() => battery.setCharging(true));
    await waitFor(() => expect(result.current).toBe(true));
  });

  it('polls the device battery on native', async () => {
    isNative.mockReturnValue(true);
    getBatteryInfo.mockResolvedValue({ isCharging: true });
    const { result } = renderHook(() => useCharging());
    await waitFor(() => expect(result.current).toBe(true));
  });
});
