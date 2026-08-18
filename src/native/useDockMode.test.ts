import { renderHook, act } from '@testing-library/react';
import { vi, describe, expect, it, beforeEach } from 'vitest';

const charging = vi.fn();
const supportsChargingMock = vi.fn();
vi.mock('./useCharging', () => ({
  useCharging: () => charging(),
  supportsCharging: () => supportsChargingMock(),
}));

const isNative = vi.fn();
vi.mock('./useNative', () => ({ isNative: () => isNative() }));

import { supportsDock, useDockMode } from './useDockMode';

type ChangeListener = (event: MediaQueryListEvent) => void;

let landscape = false;
let coarsePointer = true;
const listeners = new Set<ChangeListener>();

function setLandscape(next: boolean) {
  landscape = next;
  listeners.forEach((listener) => listener({ matches: next } as MediaQueryListEvent));
}

beforeEach(() => {
  vi.clearAllMocks();
  charging.mockReturnValue(true);
  supportsChargingMock.mockReturnValue(true);
  isNative.mockReturnValue(false);
  landscape = true;
  coarsePointer = true;
  listeners.clear();
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    get matches() {
      return query.includes('pointer') ? coarsePointer : landscape;
    },
    addEventListener: (_: string, listener: ChangeListener) => listeners.add(listener),
    removeEventListener: (_: string, listener: ChangeListener) => listeners.delete(listener),
  }));
});

describe('supportsDock', () => {
  it('is true on native regardless of pointer', () => {
    isNative.mockReturnValue(true);
    coarsePointer = false;
    expect(supportsDock()).toBe(true);
  });

  it('is false on web with a fine pointer (desktop)', () => {
    coarsePointer = false;
    expect(supportsDock()).toBe(false);
  });

  it('is true on web touch devices with the Battery API', () => {
    expect(supportsDock()).toBe(true);
  });
});

describe('useDockMode', () => {
  it('docks when enabled, charging and landscape', () => {
    const { result } = renderHook(() => useDockMode(true));
    expect(result.current).toBe(true);
  });

  it('stays undocked when the setting is off', () => {
    const { result } = renderHook(() => useDockMode(false));
    expect(result.current).toBe(false);
  });

  it('stays undocked while not charging', () => {
    charging.mockReturnValue(false);
    const { result } = renderHook(() => useDockMode(true));
    expect(result.current).toBe(false);
  });

  it('stays undocked in portrait', () => {
    landscape = false;
    const { result } = renderHook(() => useDockMode(true));
    expect(result.current).toBe(false);
  });

  it('stays undocked on desktop web (fine pointer)', () => {
    coarsePointer = false;
    const { result } = renderHook(() => useDockMode(true));
    expect(result.current).toBe(false);
  });

  it('follows orientation changes', () => {
    const { result } = renderHook(() => useDockMode(true));
    expect(result.current).toBe(true);
    act(() => setLandscape(false));
    expect(result.current).toBe(false);
    act(() => setLandscape(true));
    expect(result.current).toBe(true);
  });
});
