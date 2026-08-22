export const GRID_COLS = 11;
export const GRID_ROWS = 10;
export const CELL_COUNT = GRID_COLS * GRID_ROWS;

export const clamp = (v: number, a = 0, b = 1): number => (v < a ? a : v > b ? b : v);

export const smooth = (x: number): number => {
  const u = clamp(x);
  return u * u * (3 - 2 * u);
};

const idx = (r: number, c: number): number => r * GRID_COLS + c;

// Sub-cell plotting: brightness falls off with distance from the nearest cell centre
const plot = (out: Float32Array, r: number, c: number, v: number): void => {
  const r0 = Math.round(r);
  const c0 = Math.round(c);
  if (r0 < 0 || r0 >= GRID_ROWS || c0 < 0 || c0 >= GRID_COLS) return;
  const falloff = 1 - 0.55 * Math.hypot(r - r0, c - c0);
  const i = idx(r0, c0);
  out[i] = Math.max(out[i], v * falloff);
};

export type EffectId =
  | 'ripple'
  | 'rain'
  | 'plasma'
  | 'interference'
  | 'sonar'
  | 'pendulum'
  | 'spiralwave'
  | 'phyllotaxis'
  | 'moire'
  | 'rose';

export type LightPlaySetting = EffectId | 'off';

type Drop = { col: number; t0: number; speed: number };

export type EffectState = { drops: Drop[] } | null;

// The press point in lattice units; null means no press (preview) — effects fall back
// to their scripted paths
export type EffectContext = { px: number | null; py: number | null };

export type Effect = {
  id: EffectId;
  label: string;
  dur: number;
  init: () => EffectState;
  run: (t: number, out: Float32Array, st: EffectState, ctx: EffectContext) => void;
};

const RIPPLE_DUR = 2_100;
const RAIN_DUR = 4_200;
const PLASMA_DUR = 4_200;
const SONAR_DUR = 4_200;
const PENDULUM_DUR = 4_800;
const SPIRAL_DUR = 4_200;
const PHYLLO_DUR = 4_600;
const MOIRE_DUR = 4_400;
const ROSE_DUR = 4_400;

/* Ported verbatim from the judged board (mockups/eggs-final.html). No effect fades itself
   out — the engine blends every living field into the lit time over the last 650 ms, so
   each run must still be alive at its end. */
export const EFFECTS: Effect[] = [
  {
    id: 'ripple',
    label: 'Ripple',
    dur: RIPPLE_DUR,
    init: () => null,
    run(t, out, _st, ctx) {
      const px = ctx.px ?? 5;
      const py = ctx.py ?? 4.5;
      for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
          const d = Math.hypot(c - px, r - py);
          let v = 0;
          // Rings keep coming — the blend exit is the closure, not a self-fade
          for (let k = 0; ; k++) {
            const front = ((t - k * 520) / RIPPLE_DUR) * 11;
            if (front <= 0) break;
            if (front < 12.5) v = Math.max(v, 1 - Math.abs(d - front) / 0.95);
          }
          const i = idx(r, c);
          if (v > out[i]) out[i] = clamp(v);
        }
      }
    },
  },
  {
    id: 'rain',
    label: 'Rain',
    dur: RAIN_DUR,
    // Drops spawn across the whole run, so it is still raining when the words emerge
    init: () => ({
      drops: Array.from({ length: 46 }, () => ({
        col: (Math.random() * GRID_COLS) | 0,
        t0: Math.random() * 3_800,
        speed: 58 + Math.random() * 34,
      })),
    }),
    run(t, out, st) {
      if (!st) return;
      for (const d of st.drops) {
        const dt = t - d.t0;
        if (dt < 0) continue;
        const row = dt / d.speed;
        if (row < GRID_ROWS) {
          plot(out, row, d.col, 1);
          plot(out, row - 1, d.col, 0.45);
          plot(out, row - 2, d.col, 0.18);
        } else {
          const age = (row - GRID_ROWS) * d.speed;
          const v = 1 - clamp(age / 320);
          if (v <= 0) continue;
          plot(out, GRID_ROWS - 1, d.col, v);
          plot(out, GRID_ROWS - 1, d.col - 1, v * 0.6);
          plot(out, GRID_ROWS - 1, d.col + 1, v * 0.6);
          plot(out, GRID_ROWS - 2, d.col, v * 0.35);
        }
      }
    },
  },
  {
    id: 'plasma',
    label: 'Plasma',
    dur: PLASMA_DUR,
    init: () => null,
    run(t, out) {
      const s = t / 1_000;
      for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
          const v =
            Math.sin(c * 0.62 + s * 1.7) +
            Math.sin(r * 0.83 - s * 1.3) +
            Math.sin((c + r) * 0.48 + s * 0.9) +
            Math.sin(Math.hypot(c - 5, r - 4.5) * 0.95 - s * 2.1);
          // smooth() doubles as contrast here, or the blobs read as grey mush
          out[idx(r, c)] = smooth(0.5 + v / 4.4);
        }
      }
    },
  },
  {
    id: 'interference',
    label: 'Interference',
    dur: PLASMA_DUR,
    init: () => null,
    run(t, out, _st, ctx) {
      const bx = ctx.px ?? 7.6 + 1.8 * Math.sin(t / 900);
      const by = ctx.py ?? 6.6;
      const env = smooth(t / 260);
      for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
          const d1 = Math.hypot(c - 2.4, r - 2.4);
          const d2 = Math.hypot(c - bx, r - by);
          const w = Math.sin(d1 * 2.1 - t / 150) + Math.sin(d2 * 2.1 - t / 150);
          out[idx(r, c)] = clamp(Math.abs(w) * 0.62) * env;
        }
      }
    },
  },
  {
    id: 'sonar',
    label: 'Sonar sweep',
    dur: SONAR_DUR,
    init: () => null,
    run(t, out) {
      const PERIOD = 1_400;
      const DECAY = 1_150;
      const arm = (t / PERIOD) * Math.PI * 2;
      for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
          const a = Math.atan2((r - 4.5) * 0.9, c - 5);
          // Closed form for "when did the arm last cross this bearing" — no history buffer
          const back = (((arm - a) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
          const since = (back / (Math.PI * 2)) * PERIOD;
          if (t < since) continue;
          const v = clamp(1 - since / DECAY);
          out[idx(r, c)] = v * v;
        }
      }
    },
  },
  {
    id: 'pendulum',
    label: 'Pendulum wave',
    dur: PENDULUM_DUR,
    init: () => null,
    run(t, out) {
      for (let c = 0; c < GRID_COLS; c++) {
        const w = 0.0026 + c * 0.000135;
        const row = 4.5 + 4.3 * Math.sin(t * w);
        plot(out, row, c, 1);
        plot(out, row - Math.sign(Math.cos(t * w)) * 0.9, c, 0.3);
      }
    },
  },
  {
    id: 'spiralwave',
    label: 'Spiral wave',
    dur: SPIRAL_DUR,
    init: () => null,
    run(t, out) {
      const env = smooth(t / 400);
      for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
          const a = Math.atan2((r - 4.5) * 0.92, c - 5);
          const d = Math.hypot(c - 5, (r - 4.5) * 0.92);
          const s = Math.sin(a - d * 0.92 + t / 200);
          out[idx(r, c)] = clamp((s - 0.28) / 0.62) * env;
        }
      }
    },
  },
  {
    id: 'phyllotaxis',
    label: 'Phyllotaxis',
    dur: PHYLLO_DUR,
    init: () => null,
    run(t, out) {
      const GOLD = 2.39996;
      for (let i = 0; i < 74; i++) {
        const grow = smooth((t - i * 34) / 620);
        if (grow <= 0) continue;
        const rad = Math.sqrt(i) * 0.72 * grow;
        const ang = i * GOLD + t / 1_300;
        plot(out, 4.5 + Math.sin(ang) * rad * 0.92, 5 + Math.cos(ang) * rad, 0.32 + 0.68 * grow);
      }
    },
  },
  {
    id: 'moire',
    label: 'Moiré',
    dur: MOIRE_DUR,
    init: () => null,
    run(t, out) {
      const a1 = t / 1_900;
      const a2 = 0.7 - t / 2_700;
      const c1 = Math.cos(a1);
      const s1 = Math.sin(a1);
      const c2 = Math.cos(a2);
      const s2 = Math.sin(a2);
      for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
          const g1 = 0.5 + 0.5 * Math.cos((c * c1 + r * s1) * 1.34);
          const g2 = 0.5 + 0.5 * Math.cos((c * c2 + r * s2) * 1.52);
          out[idx(r, c)] = smooth(g1 * g2 * 1.7 - 0.1);
        }
      }
    },
  },
  {
    id: 'rose',
    label: 'Rose curve',
    dur: ROSE_DUR,
    init: () => null,
    run(t, out) {
      const k = 2 + 1.6 * (1 + Math.sin(t / 1_500));
      const spin = t / 950;
      const env = smooth(t / 350);
      for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
          const a = Math.atan2((r - 4.5) * 0.92, c - 5) + spin;
          const d = Math.hypot(c - 5, (r - 4.5) * 0.92);
          const petal = 4.7 * Math.abs(Math.cos(k * a));
          out[idx(r, c)] = clamp(1 - Math.abs(d - petal) / 1.1) * env;
        }
      }
    },
  },
];

export const getEffect = (id: LightPlaySetting): Effect | undefined => EFFECTS.find((effect) => effect.id === id);
