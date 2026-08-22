import * as React from 'react';
import { cellKey } from '../clock/engine';
import type { Finish } from '../finishes/catalog';
import { tapHaptic } from '../native/haptics';
import { CELL_COUNT, clamp, getEffect, GRID_COLS, GRID_ROWS, type Effect, type LightPlaySetting } from './effects';
import { composeFrame, fieldFromLit, SWIPE_FRACTION, TAP_SLOP_PX } from './engine';

export const EMPTY_LIT: ReadonlySet<string> = new Set();

type Swipe = {
  x: number;
  y: number;
  // Where the finger landed, in lattice units — the effect's origin
  point?: { px: number; py: number };
  reach: number;
  canPlay: boolean;
};

type GestureProps = {
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerLeave: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerCancel: (event: React.PointerEvent<HTMLDivElement>) => void;
};

type UseLightPlayOptions = {
  // Context gate (dock, e-ink, word layout) — the picker's Off gates the trigger instead,
  // so a settings preview can play the effect being selected before the store commits
  enabled: boolean;
  effectId: LightPlaySetting;
  liveLit: ReadonlySet<string>;
  rows: string[];
  finish: Finish;
  dir?: 'rtl';
  cellOverrides?: Record<string, string>;
};

type LightPlay = {
  // True from the moment it starts through the settle commit — the face renders instant while this holds
  active: boolean;
  // True only while the effect owns the lattice — the face renders as a ghost grid
  takeover: boolean;
  overlay: React.ReactNode;
  play: (id: LightPlaySetting, seed?: { px: number; py: number }) => void;
  gestureProps: GestureProps;
  // Swallows the click that ends a swipe (or lands mid-run) so it can't toggle seconds
  consumeClick: () => boolean;
};

export function useLightPlay({
  enabled,
  effectId,
  liveLit,
  rows,
  finish,
  dir,
  cellOverrides,
}: UseLightPlayOptions): LightPlay {
  // Wrapped, not bare: a fresh object every time is what lets the effect already playing restart
  const [run, setRun] = React.useState<{ effect: Effect } | null>(null);
  const [settling, setSettling] = React.useState(false);
  const cells = React.useRef<(HTMLSpanElement | null)[]>([]);
  const target = React.useRef(fieldFromLit(liveLit));
  const seed = React.useRef<{ px: number | null; py: number | null }>({ px: null, py: null });
  const swipe = React.useRef<Swipe | null>(null);
  const suppressClick = React.useRef(false);

  // The blend lands on whatever the face currently shows — words or live seconds digits
  React.useEffect(() => {
    target.current = fieldFromLit(liveLit);
  }, [liveLit]);

  React.useEffect(() => {
    if (!run) return;
    const { effect } = run;
    const st = effect.init();
    const ctx = seed.current;
    const out = new Float32Array(CELL_COUNT);
    const last = new Float32Array(CELL_COUNT).fill(-1);
    const t0 = performance.now();
    let raf = requestAnimationFrame(function frame(now) {
      const t = now - t0;
      if (t >= effect.dur) {
        setRun(null);
        setSettling(true);
        return;
      }
      composeFrame(effect, t, st, ctx, out, target.current);
      for (let i = 0; i < CELL_COUNT; i++) {
        const v = Math.round(clamp(out[i]) * 100) / 100;
        if (v === last[i]) continue;
        last[i] = v;
        const cell = cells.current[i];
        if (cell) cell.style.opacity = String(v);
      }
      raf = requestAnimationFrame(frame);
    });
    // Backgrounding stops the frame clock mid-effect. Drop the run rather than come back to a
    // ghosted face waiting for a frame that only arrives once the app is visible again.
    const onVisibility = () => {
      if (document.hidden) setRun(null);
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [run]);

  // The overlay's last frame equals the lit time, so it holds for one more frame while the
  // real face restores underneath with no transition — then unmounts over identical pixels
  React.useEffect(() => {
    if (!settling) return;
    const raf = requestAnimationFrame(() => setSettling(false));
    return () => cancelAnimationFrame(raf);
  }, [settling]);

  const active = run !== null || settling;

  // Picking in the settings list plays straight away: whatever is running is cut off mid-frame
  const play = (id: LightPlaySetting, point?: { px: number; py: number }) => {
    if (!enabled) return;
    const effect = getEffect(id);
    if (!effect) return;
    seed.current = { px: point?.px ?? null, py: point?.py ?? null };
    // An overlay still on screen keeps its cell refs; only a fresh mount has to collect them again
    if (!active) cells.current = [];
    setRun({ effect });
  };

  const endSwipe = () => {
    swipe.current = null;
  };

  const gestureProps: GestureProps = {
    onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => {
      // Every gesture starts clean, and the click it ends with is the one that reads the flag
      suppressClick.current = false;
      swipe.current = null;
      const rect = event.currentTarget.getBoundingClientRect();
      // A grid with no measured box has nothing to swipe across, and would seed the origin at infinity
      if (!rect.width || !rect.height) return;
      const u = (event.clientX - rect.left) / rect.width;
      const v = (event.clientY - rect.top) / rect.height;
      // Cell centres run 0..cols-1; RTL grids flip the visual axis back to logical columns
      const px = (dir === 'rtl' ? 1 - u : u) * GRID_COLS - 0.5;
      const py = v * GRID_ROWS - 0.5;
      const short = Math.min(rect.width, rect.height);
      swipe.current = {
        x: event.clientX,
        y: event.clientY,
        // An unplaceable touch seeds nothing rather than seeding the origin at infinity
        point: Number.isFinite(px) && Number.isFinite(py) ? { px, py } : undefined,
        reach: short * SWIPE_FRACTION,
        canPlay: enabled && !active && effectId !== 'off',
      };
    },
    // Plays the moment the finger has travelled far enough, so the light chases the hand
    onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => {
      const from = swipe.current;
      if (!from) return;
      const travelled = Math.hypot(event.clientX - from.x, event.clientY - from.y);
      // A move with no usable coordinates measures nothing, so it can neither play nor cancel a tap
      if (!Number.isFinite(travelled)) return;
      if (travelled > TAP_SLOP_PX) suppressClick.current = true;
      if (!from.canPlay || travelled < from.reach) return;
      swipe.current = null;
      tapHaptic();
      play(effectId, from.point);
    },
    onPointerUp: endSwipe,
    onPointerLeave: endSwipe,
    onPointerCancel: endSwipe,
  };

  const consumeClick = () => {
    const suppress = suppressClick.current || active;
    suppressClick.current = false;
    return suppress;
  };

  const overlay = active ? (
    <LightPlayOverlay rows={rows} finish={finish} dir={dir} cellOverrides={cellOverrides} cells={cells} />
  ) : null;

  return { active, takeover: run !== null, overlay, play, gestureProps, consumeClick };
}

type LightPlayOverlayProps = {
  rows: string[];
  finish: Finish;
  dir?: 'rtl';
  cellOverrides?: Record<string, string>;
  cells: React.RefObject<(HTMLSpanElement | null)[]>;
};

// A second grid with identical geometry stacked over the ghosted face: every glyph in the
// finish's lit style, opacity written imperatively per frame — the mockup board's renderer
function LightPlayOverlay({ rows, finish, dir, cellOverrides, cells }: LightPlayOverlayProps) {
  const cols = rows[0].length;
  const litClass =
    finish.letter === 'light'
      ? 'text-white [text-shadow:0_0_0.4em_rgba(255,255,255,0.55)]'
      : 'text-[#181614] [text-shadow:0_0_0.07em_rgba(0,0,0,0.5),0_0_0.2em_rgba(0,0,0,0.3)]';
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div
        dir={dir}
        className={`grid w-[82cqmin] select-none font-medium ${dir === 'rtl' ? '' : 'tracking-widest'}`}
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, fontSize: '4.2cqmin' }}
      >
        {rows.flatMap((row, r) =>
          [...row].map((ch, c) => (
            <span
              key={cellKey(r, c)}
              className={`flex aspect-square items-center justify-center ${litClass}`}
              style={{ opacity: 0 }}
              ref={(el) => {
                cells.current[r * cols + c] = el;
              }}
            >
              {cellOverrides?.[cellKey(r, c)] ?? ch}
            </span>
          )),
        )}
      </div>
    </div>
  );
}
