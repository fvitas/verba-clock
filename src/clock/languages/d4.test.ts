import { describe, expect, it } from 'vitest';
import { germanD4 } from './d4';

function spell(hours: number, minutes: number): string {
  return [...germanD4.itIs, ...germanD4.phrase(hours, minutes)]
    .sort((a, b) => a.row - b.row || a.start - b.start)
    .map((w) => w.text)
    .join(' ');
}

describe('german D4 grid integrity', () => {
  it('is an 11x10 matrix', () => {
    expect(germanD4.rows).toHaveLength(10);
    for (const row of germanD4.rows) expect(row).toHaveLength(11);
  });

  it('every word coordinate spells its text in the grid', () => {
    for (const w of germanD4.words) {
      expect(germanD4.rows[w.row].slice(w.start, w.end + 1)).toBe(w.text);
    }
  });
});

describe('german D4 time phrases (East German variant)', () => {
  it.each([
    [10, 0, 'ES IST ZEHN UHR'],
    [10, 5, 'ES IST FÜNF NACH ZEHN'],
    [10, 10, 'ES IST ZEHN NACH ZEHN'],
    [10, 15, 'ES IST VIERTEL ELF'],
    [10, 20, 'ES IST ZEHN VOR HALB ELF'],
    [10, 25, 'ES IST FÜNF VOR HALB ELF'],
    [10, 30, 'ES IST HALB ELF'],
    [10, 35, 'ES IST FÜNF NACH HALB ELF'],
    [10, 40, 'ES IST ZEHN NACH HALB ELF'],
    [10, 45, 'ES IST DREIVIERTEL ELF'],
    [10, 50, 'ES IST ZEHN VOR ELF'],
    [10, 55, 'ES IST FÜNF VOR ELF'],
    [0, 0, 'ES IST ZWÖLF UHR'],
    [13, 0, 'ES IST EIN UHR'],
    [12, 15, 'ES IST VIERTEL EINS'],
    [12, 30, 'ES IST HALB EINS'],
  ])('%i:%i → "%s"', (hours, minutes, expected) => {
    expect(spell(hours, minutes)).toBe(expected);
  });
});
