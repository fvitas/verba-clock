import { describe, expect, it } from 'vitest';
import { germanD2 } from './d2';

function spell(hours: number, minutes: number): string {
  return [...germanD2.itIs, ...germanD2.phrase(hours, minutes)]
    .sort((a, b) => a.row - b.row || a.start - b.start)
    .map((w) => w.text)
    .join(' ');
}

describe('german D2 grid integrity', () => {
  it('is an 11x10 matrix', () => {
    expect(germanD2.rows).toHaveLength(10);
    for (const row of germanD2.rows) expect(row).toHaveLength(11);
  });

  it('every word coordinate spells its text in the grid', () => {
    for (const w of germanD2.words) {
      expect(germanD2.rows[w.row].slice(w.start, w.end + 1)).toBe(w.text);
    }
  });
});

describe('german D2 time phrases (Dreiviertel variant)', () => {
  it.each([
    [10, 0, 'ES IST ZEHN UHR'],
    [10, 5, 'ES IST FÜNF NACH ZEHN'],
    [10, 10, 'ES IST ZEHN NACH ZEHN'],
    [10, 15, 'ES IST VIERTEL NACH ZEHN'],
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
    [12, 30, 'ES IST HALB EINS'],
  ])('%i:%i → "%s"', (hours, minutes, expected) => {
    expect(spell(hours, minutes)).toBe(expected);
  });
});
