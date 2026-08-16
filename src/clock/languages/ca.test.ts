import { describe, expect, it } from 'vitest';
import { catalan } from './ca';

// D' occupies one cell (rendered via cellOverrides); its word text is the bare grid letter D
function spell(hours: number, minutes: number): string {
  return [...(catalan.itIsFor?.(hours, minutes) ?? []), ...catalan.phrase(hours, minutes)]
    .sort((a, b) => a.row - b.row || a.start - b.start)
    .map((w) => w.text)
    .join(' ');
}

describe('catalan grid integrity', () => {
  it('is an 11x10 matrix', () => {
    expect(catalan.rows).toHaveLength(10);
    for (const row of catalan.rows) expect(row).toHaveLength(11);
  });

  it('every word coordinate spells its text in the grid', () => {
    for (const w of catalan.words) {
      expect(catalan.rows[w.row].slice(w.start, w.end + 1)).toBe(w.text);
    }
  });
});

describe('catalan time phrases (bell-quart system)', () => {
  it.each([
    [13, 0, 'ÉS LA UNA'],
    [13, 5, 'ÉS LA UNA I CINC'],
    [13, 10, 'ÉS UN QUART MENYS CINC DE DUES'],
    [13, 15, 'ÉS UN QUART DE DUES'],
    [13, 20, 'ÉS UN QUART I CINC DE DUES'],
    [13, 25, 'SÓN DOS QUARTS MENYS CINC DE DUES'],
    [13, 30, 'SÓN DOS QUARTS DE DUES'],
    [13, 35, 'SÓN DOS QUARTS I CINC DE DUES'],
    [13, 40, 'SÓN TRES QUARTS MENYS CINC DE DUES'],
    [13, 45, 'SÓN TRES QUARTS DE DUES'],
    [13, 50, 'SÓN TRES QUARTS I CINC DE DUES'],
    [13, 55, 'SÓN LES DUES MENYS CINC'],
    [15, 0, 'SÓN LES TRES'],
    [12, 15, 'ÉS UN QUART D UNA'],
    [10, 15, 'ÉS UN QUART D ONZE'],
    [4, 35, 'SÓN DOS QUARTS I CINC DE CINC'],
    [17, 5, 'SÓN LES CINC I CINC'],
    [16, 55, 'SÓN LES CINC MENYS CINC'],
    [0, 0, 'SÓN LES DOTZE'],
    [19, 30, 'SÓN DOS QUARTS DE VUIT'],
  ])('%i:%i → "%s"', (hours, minutes, expected) => {
    expect(spell(hours, minutes)).toBe(expected);
  });
});
