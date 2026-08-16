import { cellKey } from '../clock/engine';
import type { Finish } from '../finishes/catalog';

type ClockFaceProps = {
  rows: string[];
  lit: ReadonlySet<string>;
  finish: Finish;
};

export function ClockFace({ rows, lit, finish }: ClockFaceProps) {
  const cols = rows[0].length;
  const litClass =
    finish.letter === 'light'
      ? 'text-white [text-shadow:0_0_0.4em_rgba(255,255,255,0.55)]'
      : 'text-[#181614] [text-shadow:0_0_0.3em_rgba(0,0,0,0.3)]';
  const stencilColor =
    finish.letter === 'light'
      ? `rgba(255,255,255,${finish.stencilOpacity})`
      : `rgba(0,0,0,${finish.stencilOpacity})`;

  return (
    <div
      className="grid w-[min(82vw,82vh)] select-none font-medium tracking-widest"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, fontSize: 'min(4.2vw, 4.2vh)' }}
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
              {ch}
            </span>
          );
        }),
      )}
    </div>
  );
}
