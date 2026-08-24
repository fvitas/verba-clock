import type * as React from 'react';
import { cellKey } from '../clock/engine';
import { cellTiming } from '../clock/transitions';
import { ditherImage } from '../finishes/catalog';
import type { Theme } from '../themes/model';
import type { Transition } from '../settings/store';

type ClockFaceProps = {
  rows: string[];
  lit: ReadonlySet<string>;
  theme: Theme;
  transition?: Transition;
  dark?: boolean;
  cellOverrides?: Record<string, string>;
  layout?: 'word';
  dir?: 'rtl';
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  // The light-play swipe listens on the letter grid itself, not the whole screen
  onPointerDown?: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove?: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp?: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerLeave?: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerCancel?: (event: React.PointerEvent<HTMLDivElement>) => void;
};

export function ClockFace({
  rows,
  lit,
  theme,
  transition = 'instant',
  dark = false,
  cellOverrides,
  layout,
  dir,
  onClick,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerLeave,
  onPointerCancel,
}: ClockFaceProps) {
  const cols = rows[0].length;
  const litStyle: React.CSSProperties = { color: theme.lit.color, textShadow: theme.lit.textShadow };
  // The unlit e-ink letter is the ink lattice showing through the glyph — clipped to the text,
  // so the dots live inside the letterform and the field around it stays bare
  const dimStyle: React.CSSProperties = theme.eink
    ? {
        color: 'transparent',
        backgroundImage: ditherImage(theme.eink.ink, theme.eink.dither),
        backgroundSize: `${theme.eink.dither.size}px ${theme.eink.dither.size}px`,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
      }
    : { color: theme.dim };
  // Every cell takes part in the sweep, not only the ones whose state changed: the effect's
  // geometry is the whole face, so a stagger erases the old words on its way to the new ones.
  const timing = (index: number, count: number): React.CSSProperties => {
    const { duration, delay, ease } = cellTiming(transition, index, count, dark);
    if (!duration) return {};
    const step = `${duration}ms ${ease} ${delay}ms`;
    // The glow rides the same clock as the colour, or it would land before its letter
    return { transition: `color ${step}, text-shadow ${step}` };
  };

  if (layout === 'word') {
    const wordRows = rows.map((row) => row.split(' '));
    const rowStart = wordRows.map((_, r) => wordRows.slice(0, r).reduce((n, words) => n + words.length, 0));
    const wordCount = rowStart[rowStart.length - 1] + wordRows[wordRows.length - 1].length;
    // Rows are whole words in slot order; height matches the letter grid's 10/11 footprint
    // so the minute-dot offsets hold. No tracking — letter-spacing breaks cursive joining.
    return (
      <div
        dir={dir}
        className="flex h-[74.5cqmin] w-[82cqmin] select-none flex-col justify-between font-medium"
        style={{ fontSize: '4.2cqmin' }}
        onClick={onClick}
      >
        {wordRows.map((words, r) => (
          <div key={r} className="flex items-center justify-between">
            {words.map((w, c) => {
              const on = lit.has(cellKey(r, c));
              return (
                <span
                  key={cellKey(r, c)}
                  style={{ ...(on ? litStyle : dimStyle), ...timing(rowStart[r] + c, wordCount) }}
                  data-lit={on}
                >
                  {w}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      // dir="rtl" flips the grid so column 0 lands on the right (Hebrew); tracking would
      // then pad the wrong side of each cell, so RTL faces rely on the grid gaps alone
      dir={dir}
      // touch-none: the swipe needs the browser's pointer moves, not a page pan or a zoom gesture
      className={`grid w-[82cqmin] touch-none select-none font-medium ${dir === 'rtl' ? '' : 'tracking-widest'}`}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, fontSize: '4.2cqmin' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
      onPointerCancel={onPointerCancel}
      onClick={onClick}
    >
      {rows.flatMap((row, r) =>
        [...row].map((ch, c) => {
          const on = lit.has(cellKey(r, c));
          return (
            <span
              key={cellKey(r, c)}
              className="flex aspect-square items-center justify-center"
              style={{ ...(on ? litStyle : dimStyle), ...timing(r * cols + c, rows.length * cols) }}
              data-lit={on}
            >
              {cellOverrides?.[cellKey(r, c)] ?? ch}
            </span>
          );
        }),
      )}
    </div>
  );
}
