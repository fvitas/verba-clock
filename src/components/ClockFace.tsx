import type * as React from 'react';
import { cellKey } from '../clock/engine';
import { cellTiming } from '../clock/transitions';
import { ditherImage, type Finish } from '../finishes/catalog';
import type { Transition } from '../settings/store';

type ClockFaceProps = {
  rows: string[];
  lit: ReadonlySet<string>;
  finish: Finish;
  transition?: Transition;
  dark?: boolean;
  cellOverrides?: Record<string, string>;
  layout?: 'word';
  dir?: 'rtl';
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
};

export function ClockFace({
  rows,
  lit,
  finish,
  transition = 'instant',
  dark = false,
  cellOverrides,
  layout,
  dir,
  onClick,
}: ClockFaceProps) {
  const cols = rows[0].length;
  const eink = finish.render === 'eink';
  const litClass = eink
    ? ''
    : finish.letter === 'light'
      ? 'text-white [text-shadow:0_0_0.4em_rgba(255,255,255,0.55)]'
      : 'text-[#181614] [text-shadow:0_0_0.07em_rgba(0,0,0,0.5),0_0_0.2em_rgba(0,0,0,0.3)]';
  const litStyle = eink ? { color: finish.ink } : undefined;
  // The unlit letter is the ink lattice showing through the glyph — clipped to the text, so the
  // dots live inside the letterform and the field around it stays bare
  const dimStyle: React.CSSProperties = eink
    ? {
        color: 'transparent',
        backgroundImage: ditherImage(finish.ink, finish.dither),
        backgroundSize: `${finish.dither.size}px ${finish.dither.size}px`,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
      }
    : {
        color:
          finish.letter === 'light'
            ? `rgba(255,255,255,${finish.stencilOpacity})`
            : `rgba(0,0,0,${finish.stencilOpacity})`,
      };
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
                  className={on ? litClass : ''}
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
      className={`grid w-[82cqmin] select-none font-medium ${dir === 'rtl' ? '' : 'tracking-widest'}`}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, fontSize: '4.2cqmin' }}
      onClick={onClick}
    >
      {rows.flatMap((row, r) =>
        [...row].map((ch, c) => {
          const on = lit.has(cellKey(r, c));
          return (
            <span
              key={cellKey(r, c)}
              className={`flex aspect-square items-center justify-center ${on ? litClass : ''}`}
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
