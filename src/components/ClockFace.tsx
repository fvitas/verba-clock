import type * as React from 'react';
import { cellKey } from '../clock/engine';
import { ditherImage, type Finish } from '../finishes/catalog';

type ClockFaceProps = {
  rows: string[];
  lit: ReadonlySet<string>;
  finish: Finish;
  cellOverrides?: Record<string, string>;
  layout?: 'word';
  dir?: 'rtl';
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
};

export function ClockFace({ rows, lit, finish, cellOverrides, layout, dir, onClick }: ClockFaceProps) {
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
  // An e-ink pixel flips, it never fades
  const transition = eink ? '' : 'transition-colors duration-[600ms]';

  if (layout === 'word') {
    // Rows are whole words in slot order; height matches the letter grid's 10/11 footprint
    // so the minute-dot offsets hold. No tracking — letter-spacing breaks cursive joining.
    return (
      <div
        dir={dir}
        className="flex h-[74.5cqmin] w-[82cqmin] select-none flex-col justify-between font-medium"
        style={{ fontSize: '4.2cqmin' }}
        onClick={onClick}
      >
        {rows.map((row, r) => (
          <div key={r} className="flex items-center justify-between">
            {row.split(' ').map((w, c) => {
              const on = lit.has(cellKey(r, c));
              return (
                <span
                  key={cellKey(r, c)}
                  className={`${transition} ${on ? litClass : ''}`}
                  style={on ? litStyle : dimStyle}
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
              className={`flex aspect-square items-center justify-center ${transition} ${on ? litClass : ''}`}
              style={on ? litStyle : dimStyle}
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
