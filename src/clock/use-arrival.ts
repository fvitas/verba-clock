import { useEffect, useRef, useState } from 'react';

export type Face = { lit: ReadonlySet<string>; dots: number };

const DARK: Face = { lit: new Set(), dots: 0 };

// resolveTime walks the language's words in a fixed order, so equal times give equal strings
const signature = (face: Face): string => `${[...face.lit].join('|')}/${face.dots}`;

export type Arrival = { face: Face; dark: boolean };

/**
 * The face to paint, which lags the real one whenever the letters have to go dark first.
 * `darkMs` is how long that dark frame is held: Off-then-on needs a real pause, because a cell
 * that stays lit still has to drop out, and no per-cell transition can express that.
 */
export function useArrival(next: Face, animate: boolean, darkMs: number): Arrival {
  const target = useRef(next);
  target.current = next;
  const [painted, setPainted] = useState<Face>(DARK);
  const arrived = useRef(false);
  const key = signature(next);

  useEffect(() => {
    if (!animate) {
      arrived.current = true;
      setPainted(target.current);
      return;
    }
    if (!arrived.current) {
      // CSS won't transition an element that mounted at its final colour, so the grid arrives
      // one frame ahead of its words: the clock lights up on open instead of just being on.
      const frame = requestAnimationFrame(() => {
        arrived.current = true;
        setPainted(target.current);
      });
      return () => cancelAnimationFrame(frame);
    }
    if (!darkMs) {
      setPainted(target.current);
      return;
    }
    setPainted(DARK);
    const timer = setTimeout(() => setPainted(target.current), darkMs);
    return () => clearTimeout(timer);
  }, [key, animate, darkMs]);

  // Before the first frame there is nothing to fade from, so an unanimated face paints straight through
  if (!animate) return { face: next, dark: false };
  return { face: painted, dark: painted === DARK };
}
