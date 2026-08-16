import { cellKey } from '../clock/engine';

type ClockFaceProps = {
  rows: string[];
  lit: ReadonlySet<string>;
};

export function ClockFace({ rows, lit }: ClockFaceProps) {
  const cols = rows[0].length;
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
              className={`flex aspect-square items-center justify-center transition-colors duration-[600ms] ${
                on ? 'text-white [text-shadow:0_0_0.4em_rgba(255,255,255,0.55)]' : 'text-white/15'
              }`}
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
