import type * as React from 'react';
import { cellKey } from '../clock/engine';
import type { Finish } from '../finishes/catalog';

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
  const litClass =
    finish.letter === 'light'
      ? 'text-white [text-shadow:0_0_0.4em_rgba(255,255,255,0.55)]'
      : 'text-[#181614] [text-shadow:0_0_0.07em_rgba(0,0,0,0.5),0_0_0.2em_rgba(0,0,0,0.3)]';
  const stencilColor =
    finish.letter === 'light'
      ? `rgba(255,255,255,${finish.stencilOpacity})`
      : `rgba(0,0,0,${finish.stencilOpacity})`;

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
                  className={`transition-colors duration-[600ms] ${on ? litClass : ''}`}
                  style={on ? undefined : { color: stencilColor }}
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
      className="grid w-[82cqmin] select-none font-medium tracking-widest"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, fontSize: '4.2cqmin' }}
      onClick={onClick}
    >
      {rows.flatMap((row, r) =>
        [...row].map((ch, c) => {
          const on = lit.has(cellKey(r, c));
          return (
            <span
              key={cellKey(r, c)}
              className={`flex aspect-square items-center justify-center transition-colors duration-[600ms] ${on ? litClass : ''}`}
              style={on ? undefined : { color: stencilColor }}
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
