import { describe, expect, it } from 'vitest';
import { FINISHES, getFinish } from '../finishes/catalog';
import {
  fallbackName,
  luminance,
  resolveCustom,
  resolveTheme,
  type CustomTheme,
} from './model';

const custom = (patch: Partial<CustomTheme> = {}): CustomTheme => ({
  id: 'custom-1',
  name: 'Test',
  background: { kind: 'solid', color: '#0a0a0c' },
  ledColor: '#ffffff',
  dimOpacity: 0.15,
  glow: 0.55,
  ...patch,
});

describe('built-in resolution', () => {
  it('resolves every finish to a builtin theme with its surface', () => {
    for (const finish of FINISHES) {
      const theme = resolveTheme(finish.id, []);
      expect(theme.builtin).toBe(true);
      expect(theme.surface).toBe(finish.surface);
      expect(theme.letter).toBe(finish.letter);
    }
  });

  it('keeps the light-letter treatment pixel-identical to the shipped finishes', () => {
    const theme = resolveTheme('deep-black', []);
    expect(theme.lit).toEqual({ color: '#ffffff', textShadow: '0 0 0.4em rgba(255,255,255,0.55)' });
    expect(theme.dim).toBe('rgba(255,255,255,0.15)');
  });

  it('keeps the dark-letter treatment pixel-identical to the shipped finishes', () => {
    const theme = resolveTheme('gold', []);
    expect(theme.lit.color).toBe('#181614');
    expect(theme.dim).toBe('rgba(0,0,0,0.28)');
  });

  it('resolves e-ink finishes with their ink and dither', () => {
    const theme = resolveTheme('paper', []);
    expect(theme.eink?.ink).toBe('#16171a');
    expect(theme.eink?.dither).toBe(getFinish('paper').render === 'eink' && getFinish('paper').dither);
    expect(theme.lit.textShadow).toBe('none');
  });

  it('falls back to deep black for unknown ids', () => {
    expect(resolveTheme('nope', []).id).toBe('deep-black');
  });
});

describe('custom resolution', () => {
  it('lights letters in the LED color on a dark background', () => {
    const theme = resolveCustom(custom({ ledColor: '#ffb347' }));
    expect(theme.letter).toBe('light');
    expect(theme.lit.color).toBe('#ffb347');
    expect(theme.lit.textShadow).toBe('0 0 0.39em rgba(255, 179, 71, 0.55)');
    expect(theme.dim).toBe('rgba(255, 179, 71, 0.15)');
  });

  it('shades the LED hue to a deep tone on a light background', () => {
    const theme = resolveCustom(custom({ background: { kind: 'solid', color: '#e8e2d5' }, ledColor: '#ff4b3a' }));
    expect(theme.letter).toBe('dark');
    expect(theme.lit.color).toBe('rgb(41, 12, 9)');
    expect(theme.lit.textShadow).toBe('none');
    expect(theme.dim).toBe('rgba(20, 18, 14, 0.24)');
  });

  it('drops the glow entirely at zero', () => {
    const theme = resolveCustom(custom({ glow: 0 }));
    expect(theme.lit.textShadow).toBe('none');
  });

  it('takes polarity from the finish when the background is a finish surface', () => {
    const theme = resolveCustom(custom({ background: { kind: 'finish', finishId: 'white-pepper' } }));
    expect(theme.letter).toBe('dark');
    expect(theme.surface).toBe(getFinish('white-pepper').surface);
  });

  it('takes polarity from the stored luminance for photos', () => {
    const dark = resolveCustom(custom({ background: { kind: 'photo', luminance: 0.06 } }), 'data:image/jpeg;base64,x');
    expect(dark.letter).toBe('light');
    expect(dark.surface).toBe('url("data:image/jpeg;base64,x") center / cover no-repeat, #0a0a0c');
    const bright = resolveCustom(custom({ background: { kind: 'photo', luminance: 0.75 } }), null);
    expect(bright.letter).toBe('dark');
    expect(bright.surface).toBe('#0a0a0c');
  });

  it('resolves a stored custom theme by id', () => {
    const theme = resolveTheme('custom-1', [custom()]);
    expect(theme.builtin).toBe(false);
  });
});

describe('helpers', () => {
  it('computes relative luminance', () => {
    expect(luminance('#000000')).toBe(0);
    expect(luminance('#ffffff')).toBeCloseTo(1);
    expect(luminance('#e8e2d5')).toBeGreaterThan(0.5);
  });

  it('picks the first free fallback name', () => {
    expect(fallbackName([])).toBe('Custom Theme');
    expect(fallbackName([custom({ name: 'Custom Theme' })])).toBe('Custom Theme 2');
    expect(
      fallbackName([custom({ name: 'Custom Theme' }), custom({ id: 'c2', name: 'Custom Theme 2' })]),
    ).toBe('Custom Theme 3');
  });
});
