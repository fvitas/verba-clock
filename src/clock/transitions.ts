import type { Transition } from '../settings/store';

// No change may still be arriving when the next minute lands
export const CEILING = 1_000;

type Spec = {
  // How long the whole face holds dark before the new words arrive. 0 = they just cross over.
  dark: number;
  // Fading out into that dark frame is never staggered — the face drops as one
  fade: number;
  duration: number;
  ease: string;
  // Per-cell stagger, compressed if the grid is too wide to fit the ceiling at this rate
  step: number;
};

export const SPECS: Record<Transition, Spec> = {
  instant: { dark: 0, fade: 0, duration: 0, ease: 'linear', step: 0 },
  crossfade: { dark: 0, fade: 600, duration: 600, ease: 'ease-in-out', step: 0 },
  typewriter: { dark: 0, fade: 180, duration: 180, ease: 'ease-out', step: 50 },
  offthenon: { dark: 360, fade: 220, duration: 320, ease: 'ease-in-out', step: 0 },
};

export type CellTiming = { duration: number; delay: number; ease: string };

/**
 * The transition for one cell of `count`, at reading-order index `index`. Every cell takes part,
 * not just the ones whose state changed: the sweep crosses the whole face, erasing the old words
 * and writing the new ones as it passes.
 */
export function cellTiming(transition: Transition, index: number, count: number, dark: boolean): CellTiming {
  const spec = SPECS[transition];
  if (dark) return { duration: spec.fade, delay: 0, ease: spec.ease };
  // A 50 ms/cell typewriter would take five seconds across 110 cells, so the rate gives way
  // to the ceiling rather than the change running late
  const step = count > 1 ? Math.min(spec.step, (CEILING - spec.duration) / (count - 1)) : spec.step;
  return { duration: spec.duration, delay: Math.round(index * step), ease: spec.ease };
}

export type TransitionContext = {
  setting: Transition;
  seconds: boolean;
  docked: boolean;
  reducedMotion: boolean;
  eink: boolean;
};

/**
 * An e-ink pixel flips and a docked clock shouldn't move at all; seconds digits repaint every
 * second, so a staggered sweep would still be arriving when the next one starts.
 */
export function resolveTransition({ setting, seconds, docked, reducedMotion, eink }: TransitionContext): Transition {
  if (eink || docked) return 'instant';
  if (seconds || reducedMotion) return 'crossfade';
  return setting;
}
