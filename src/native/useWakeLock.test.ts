import { renderHook } from '@testing-library/react';
import { vi, describe, expect, it, beforeEach, afterEach } from 'vitest';

const isNative = vi.fn();
vi.mock('./useNative', () => ({ isNative: () => isNative() }));

import { supportsWakeLock, useWakeLock } from './useWakeLock';

const release = vi.fn().mockResolvedValue(undefined);
const request = vi.fn().mockResolvedValue({ release });

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
  vi.clearAllMocks();
  isNative.mockReturnValue(false);
  Object.defineProperty(navigator, 'wakeLock', { value: { request }, configurable: true });
});

afterEach(() => {
  Reflect.deleteProperty(navigator, 'wakeLock');
});

describe('supportsWakeLock', () => {
  it('is true on web with the API present', () => {
    expect(supportsWakeLock()).toBe(true);
  });

  it('is false on native', () => {
    isNative.mockReturnValue(true);
    expect(supportsWakeLock()).toBe(false);
  });

  it('is false without the API', () => {
    Reflect.deleteProperty(navigator, 'wakeLock');
    expect(supportsWakeLock()).toBe(false);
  });
});

describe('useWakeLock', () => {
  it('requests a screen wake lock when enabled', async () => {
    renderHook(() => useWakeLock(true));
    await flush();
    expect(request).toHaveBeenCalledWith('screen');
  });

  it('does not request when disabled or on native', () => {
    renderHook(() => useWakeLock(false));
    isNative.mockReturnValue(true);
    renderHook(() => useWakeLock(true));
    expect(request).not.toHaveBeenCalled();
  });

  it('releases the lock on unmount', async () => {
    const { unmount } = renderHook(() => useWakeLock(true));
    await flush();
    unmount();
    expect(release).toHaveBeenCalled();
  });

  it('re-acquires when the tab becomes visible again', async () => {
    renderHook(() => useWakeLock(true));
    await flush();
    document.dispatchEvent(new Event('visibilitychange'));
    await flush();
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('survives a denied request', async () => {
    request.mockRejectedValueOnce(new Error('denied'));
    const { unmount } = renderHook(() => useWakeLock(true));
    await flush();
    unmount();
    expect(release).not.toHaveBeenCalled();
  });
});
