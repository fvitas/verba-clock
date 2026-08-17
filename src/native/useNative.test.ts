import { renderHook } from '@testing-library/react';
import { vi, describe, expect, it, beforeEach } from 'vitest';

const isNativePlatform = vi.fn();
const keepAwake = vi.fn();
const allowSleep = vi.fn();
const hide = vi.fn();

vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => isNativePlatform() } }));
vi.mock('@capacitor-community/keep-awake', () => ({
  KeepAwake: { keepAwake: () => keepAwake(), allowSleep: () => allowSleep() },
}));
vi.mock('@capacitor/status-bar', () => ({ StatusBar: { hide: () => hide() } }));

import { useNative } from './useNative';

beforeEach(() => vi.clearAllMocks());

describe('useNative', () => {
  it('does nothing on web', () => {
    isNativePlatform.mockReturnValue(false);
    renderHook(() => useNative(true));
    expect(hide).not.toHaveBeenCalled();
    expect(keepAwake).not.toHaveBeenCalled();
  });

  it('hides status bar and keeps awake on native', () => {
    isNativePlatform.mockReturnValue(true);
    renderHook(() => useNative(true));
    expect(hide).toHaveBeenCalled();
    expect(keepAwake).toHaveBeenCalled();
  });

  it('allows sleep when keepAwake is off', () => {
    isNativePlatform.mockReturnValue(true);
    renderHook(() => useNative(false));
    expect(allowSleep).toHaveBeenCalled();
  });
});
