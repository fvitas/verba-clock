import type { LanguageDef } from './types';

export type ClockDisplay = {
  lit: ReadonlySet<string>;
  dots: number;
};

export const cellKey = (row: number, col: number): string => `${row}:${col}`;

export function resolveTime(
  hours: number,
  minutes: number,
  lang: LanguageDef,
  showItIs: boolean,
): ClockDisplay {
  const words = [...(showItIs ? lang.itIs : []), ...lang.phrase(hours, minutes)];
  const lit = new Set<string>();
  for (const w of words) {
    for (let col = w.start; col <= w.end; col++) lit.add(cellKey(w.row, col));
  }
  return { lit, dots: minutes % 5 };
}
