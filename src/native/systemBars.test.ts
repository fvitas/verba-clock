import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Theme } from '../themes/model';

const getPlatform = vi.fn();
const setGlyphs = vi.fn().mockResolvedValue(undefined);
vi.mock('@capacitor/core', () => ({
  Capacitor: { getPlatform: () => getPlatform() },
  registerPlugin: () => ({ setGlyphs: (options: unknown) => setGlyphs(options) }),
}));

import { syncSystemBarGlyphs } from './systemBars';

const themeWith = (letter: 'light' | 'dark') => ({ letter }) as Theme;

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
  vi.clearAllMocks();
  getPlatform.mockReturnValue('android');
});

describe('syncSystemBarGlyphs', () => {
  it('asks for dark glyphs on a light front', () => {
    syncSystemBarGlyphs(themeWith('dark'));
    expect(setGlyphs).toHaveBeenCalledWith({ dark: true });
  });

  it('asks for white glyphs on a dark front', () => {
    syncSystemBarGlyphs(themeWith('light'));
    expect(setGlyphs).toHaveBeenCalledWith({ dark: false });
  });

  it('stays out of it off Android', () => {
    getPlatform.mockReturnValue('ios');
    syncSystemBarGlyphs(themeWith('dark'));
    getPlatform.mockReturnValue('web');
    syncSystemBarGlyphs(themeWith('dark'));
    expect(setGlyphs).not.toHaveBeenCalled();
  });

  it('swallows a missing plugin so an outdated shell keeps working', async () => {
    setGlyphs.mockRejectedValueOnce(new Error('not implemented'));
    expect(() => syncSystemBarGlyphs(themeWith('dark'))).not.toThrow();
    await flush();
  });
});
