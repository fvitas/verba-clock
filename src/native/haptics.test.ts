import { beforeEach, describe, expect, it, vi } from 'vitest';

const isNativePlatform = vi.fn();
vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => isNativePlatform() } }));

const impact = vi.fn().mockResolvedValue(undefined);
const selectionStart = vi.fn().mockResolvedValue(undefined);
const selectionChanged = vi.fn().mockResolvedValue(undefined);
const selectionEnd = vi.fn().mockResolvedValue(undefined);
vi.mock('@capacitor/haptics', () => ({
  Haptics: {
    impact: (options: unknown) => impact(options),
    selectionStart: () => selectionStart(),
    selectionChanged: () => selectionChanged(),
    selectionEnd: () => selectionEnd(),
  },
  ImpactStyle: { Light: 'LIGHT', Medium: 'MEDIUM', Heavy: 'HEAVY' },
}));

import {
  endSelectionHaptic,
  selectionHaptic,
  setHapticsEnabled,
  startSelectionHaptic,
  supportsHaptics,
  tapHaptic,
} from './haptics';

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

function stubWeb({ vibrate, coarsePointer }: { vibrate: boolean; coarsePointer: boolean }): void {
  if (vibrate) vi.stubGlobal('navigator', { ...navigator, vibrate: () => true });
  vi.stubGlobal('matchMedia', (media: string) => ({ matches: coarsePointer, media }));
}

beforeEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  isNativePlatform.mockReturnValue(true);
  setHapticsEnabled(true);
});

describe('supportsHaptics', () => {
  it('is true on native even without the vibration API', () => {
    expect(navigator.vibrate).toBeUndefined();
    expect(supportsHaptics()).toBe(true);
  });

  it('is true on touch browsers that expose navigator.vibrate', () => {
    isNativePlatform.mockReturnValue(false);
    stubWeb({ vibrate: true, coarsePointer: true });
    expect(supportsHaptics()).toBe(true);
  });

  it('is false on desktop browsers, whose navigator.vibrate never buzzes', () => {
    isNativePlatform.mockReturnValue(false);
    stubWeb({ vibrate: true, coarsePointer: false });
    expect(supportsHaptics()).toBe(false);
  });

  it('is false on the web without vibration support', () => {
    isNativePlatform.mockReturnValue(false);
    expect(supportsHaptics()).toBe(false);
  });
});

describe('tapHaptic', () => {
  it('fires a light impact', () => {
    tapHaptic();
    expect(impact).toHaveBeenCalledWith({ style: 'LIGHT' });
  });

  it('stays silent when the setting is off', () => {
    setHapticsEnabled(false);
    tapHaptic();
    expect(impact).not.toHaveBeenCalled();
  });

  it('stays silent where haptics are unsupported', () => {
    isNativePlatform.mockReturnValue(false);
    tapHaptic();
    expect(impact).not.toHaveBeenCalled();
  });

  it('swallows plugin rejections so a failed buzz never breaks the tap', async () => {
    impact.mockRejectedValueOnce(new Error('unavailable'));
    expect(() => tapHaptic()).not.toThrow();
    await flush();
  });
});

describe('selection haptics', () => {
  it('brackets a drag with start, ticks and end', () => {
    startSelectionHaptic();
    selectionHaptic();
    selectionHaptic();
    endSelectionHaptic();
    expect(selectionStart).toHaveBeenCalledOnce();
    expect(selectionChanged).toHaveBeenCalledTimes(2);
    expect(selectionEnd).toHaveBeenCalledOnce();
  });

  it('stays silent when the setting is off', () => {
    setHapticsEnabled(false);
    startSelectionHaptic();
    selectionHaptic();
    endSelectionHaptic();
    expect(selectionStart).not.toHaveBeenCalled();
    expect(selectionChanged).not.toHaveBeenCalled();
    expect(selectionEnd).not.toHaveBeenCalled();
  });
});
