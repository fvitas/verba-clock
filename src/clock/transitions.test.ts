import { describe, expect, it } from 'vitest';
import { CEILING, cellTiming, resolveTransition } from './transitions';

const GRID = 110;

describe('cellTiming', () => {
  it('gives instant no transition at all', () => {
    expect(cellTiming('instant', 0, GRID, false)).toEqual({ duration: 0, delay: 0, ease: 'linear' });
  });

  it('crossfades every cell on the same clock', () => {
    const first = cellTiming('crossfade', 0, GRID, false);
    const last = cellTiming('crossfade', GRID - 1, GRID, false);
    expect(first).toEqual({ duration: 600, delay: 0, ease: 'ease-in-out' });
    expect(last).toEqual(first);
  });

  it('staggers the typewriter at its natural rate on a short grid', () => {
    expect([0, 1, 2].map((i) => cellTiming('typewriter', i, 3, false).delay)).toEqual([0, 50, 100]);
  });

  it('compresses the typewriter so the full grid still lands on the ceiling', () => {
    const last = cellTiming('typewriter', GRID - 1, GRID, false);
    expect(last.delay + last.duration).toBe(CEILING);
    // 50ms/cell across 110 cells would run five seconds — the rate gives way, not the deadline
    expect(cellTiming('typewriter', 1, GRID, false).delay).toBe(8);
  });

  it('drops the whole face at once on the way out', () => {
    const first = cellTiming('typewriter', 0, GRID, true);
    const last = cellTiming('typewriter', GRID - 1, GRID, true);
    expect(first).toEqual({ duration: 180, delay: 0, ease: 'ease-out' });
    expect(last).toEqual(first);
  });

  it('fades out faster than it comes back for off-then-on', () => {
    expect(cellTiming('offthenon', 0, GRID, true).duration).toBe(220);
    expect(cellTiming('offthenon', 0, GRID, false)).toEqual({
      duration: 320,
      delay: 0,
      ease: 'ease-in-out',
    });
  });

  it('never staggers a lone cell', () => {
    expect(cellTiming('typewriter', 0, 1, false).delay).toBe(0);
  });
});

const context = {
  setting: 'typewriter' as const,
  seconds: false,
  docked: false,
  reducedMotion: false,
  eink: false,
};

describe('resolveTransition', () => {
  it('uses the chosen effect on a normal words face', () => {
    expect(resolveTransition(context)).toBe('typewriter');
  });

  it('flips e-ink instantly — a panel pixel never fades, not even in seconds mode', () => {
    expect(resolveTransition({ ...context, eink: true })).toBe('instant');
    expect(resolveTransition({ ...context, eink: true, seconds: true })).toBe('instant');
  });

  it('holds a docked clock still', () => {
    expect(resolveTransition({ ...context, docked: true })).toBe('instant');
  });

  it('falls back to a plain crossfade for seconds digits and reduced motion', () => {
    expect(resolveTransition({ ...context, seconds: true })).toBe('crossfade');
    expect(resolveTransition({ ...context, reducedMotion: true })).toBe('crossfade');
  });

  it('keeps instant instant when the user asked for it', () => {
    expect(resolveTransition({ ...context, setting: 'instant' })).toBe('instant');
  });
});
