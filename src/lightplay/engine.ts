import { cellKey } from '../clock/engine';
import { CELL_COUNT, GRID_COLS, GRID_ROWS, smooth, type Effect, type EffectContext, type EffectState } from './effects';

export const EXIT_FADE = 650;
export const LONG_PRESS_MS = 600;

// The lit set as an intensity field, in the same row-major order the effects write
export function fieldFromLit(lit: ReadonlySet<string>): Float32Array {
  const field = new Float32Array(CELL_COUNT);
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      if (lit.has(cellKey(r, c))) field[r * GRID_COLS + c] = 1;
    }
  }
  return field;
}

// One frame of a run: the effect's field, crossfaded into the live time over the last
// EXIT_FADE ms so the words condense out of the effect instead of fading up from black
export function composeFrame(
  effect: Effect,
  t: number,
  st: EffectState,
  ctx: EffectContext,
  out: Float32Array,
  target: Float32Array,
): void {
  out.fill(0);
  effect.run(Math.min(t, effect.dur), out, st, ctx);
  const from = effect.dur - EXIT_FADE;
  if (t > from) {
    const u = smooth((t - from) / EXIT_FADE);
    for (let i = 0; i < CELL_COUNT; i++) out[i] = out[i] * (1 - u) + target[i] * u;
  }
}
