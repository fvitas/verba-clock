import { describe, expect, it } from 'vitest';
import { cellKey } from '../clock/engine';
import { CELL_COUNT, EFFECTS, getEffect, GRID_COLS } from './effects';
import { composeFrame, EXIT_FADE, fieldFromLit } from './engine';

const FRAME = 33;
const CENTRE = { px: 5, py: 4.5 };

// Every frame an effect would ever be asked for, at a press point and on its scripted path
const sample = (effect: (typeof EFFECTS)[number], ctx: { px: number | null; py: number | null }) => {
  const st = effect.init();
  const out = new Float32Array(CELL_COUNT);
  const frames: Float32Array[] = [];
  for (let t = 0; t <= effect.dur; t += FRAME) {
    out.fill(0);
    effect.run(Math.min(t, effect.dur), out, st, ctx);
    frames.push(Float32Array.from(out));
  }
  return frames;
};

describe('EFFECTS', () => {
  it('holds the ten keepers, each with a distinct id and a sane duration', () => {
    expect(EFFECTS.map((effect) => effect.id)).toEqual([
      'ripple',
      'rain',
      'plasma',
      'interference',
      'sonar',
      'pendulum',
      'spiralwave',
      'phyllotaxis',
      'moire',
      'rose',
    ]);
    for (const effect of EFFECTS) {
      expect(effect.label.length).toBeGreaterThan(0);
      expect(effect.dur).toBeGreaterThan(EXIT_FADE * 2);
      expect(effect.dur).toBeLessThanOrEqual(5_000);
    }
  });

  it('resolves ids and refuses the off setting', () => {
    expect(getEffect('moire')?.label).toBe('Moiré');
    expect(getEffect('off')).toBeUndefined();
  });

  for (const effect of EFFECTS) {
    describe(effect.id, () => {
      it('writes finite intensities and reaches full brightness', () => {
        for (const ctx of [CENTRE, { px: null, py: null }]) {
          const frames = sample(effect, ctx);
          let peak = 0;
          for (const frame of frames) {
            for (const v of frame) {
              expect(Number.isFinite(v)).toBe(true);
              if (v > peak) peak = v;
            }
          }
          expect(peak).toBeGreaterThan(0.9);
        }
      });

      // The engine owns the exit, so no effect may fade itself out before the blend starts —
      // it would crossfade a dead field and the words would fade up out of nothing
      it('still has a living field when the blend starts', () => {
        const st = effect.init();
        const out = new Float32Array(CELL_COUNT);
        effect.run(effect.dur - EXIT_FADE, out, st, CENTRE);
        const alive = [...out].filter((v) => v > 0.25).length;
        expect(alive).toBeGreaterThan(10);
      });
    });
  }
});

describe('fieldFromLit', () => {
  it('lays the lit set out row-major', () => {
    const field = fieldFromLit(new Set([cellKey(0, 0), cellKey(3, 7)]));
    expect(field.length).toBe(CELL_COUNT);
    expect(field[0]).toBe(1);
    expect(field[3 * GRID_COLS + 7]).toBe(1);
    expect([...field].filter((v) => v === 1).length).toBe(2);
  });
});

describe('composeFrame', () => {
  const effect = EFFECTS[0];
  const target = fieldFromLit(new Set([cellKey(2, 2), cellKey(2, 3)]));

  it('leaves the effect untouched until the blend window opens', () => {
    const st = effect.init();
    const plain = new Float32Array(CELL_COUNT);
    effect.run(effect.dur - EXIT_FADE, plain, st, CENTRE);
    const blended = new Float32Array(CELL_COUNT);
    composeFrame(effect, effect.dur - EXIT_FADE, effect.init(), CENTRE, blended, target);
    expect([...blended]).toEqual([...plain]);
  });

  it('lands exactly on the lit time when the run ends', () => {
    const out = new Float32Array(CELL_COUNT);
    composeFrame(effect, effect.dur, effect.init(), CENTRE, out, target);
    expect([...out]).toEqual([...target]);
  });

  it('separates the words from the field mid-blend', () => {
    const out = new Float32Array(CELL_COUNT);
    composeFrame(effect, effect.dur - EXIT_FADE / 2, effect.init(), CENTRE, out, target);
    const lit = target.map((v, i) => (v === 1 ? out[i] : 0));
    expect(Math.min(...[...lit].filter((v) => v > 0))).toBeGreaterThan(0.4);
  });
});
