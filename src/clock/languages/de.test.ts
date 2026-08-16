import { describe, expect, it } from 'vitest';
import { german } from './de';

function spell(hours: number, minutes: number): string {
  return [...german.itIs, ...german.phrase(hours, minutes)]
    .sort((a, b) => a.row - b.row || a.start - b.start)
    .map((w) => w.text)
    .join(' ');
}

describe('german grid integrity', () => {
  it('is an 11x10 matrix', () => {
    expect(german.rows).toHaveLength(10);
    for (const row of german.rows) expect(row).toHaveLength(11);
  });

  it('every word coordinate spells its text in the grid', () => {
    for (const w of german.words) {
      expect(german.rows[w.row].slice(w.start, w.end + 1)).toBe(w.text);
    }
  });
});

describe('german time phrases', () => {
  it.each([
    [10, 0, 'ES IST ZEHN UHR'],
    [10, 4, 'ES IST ZEHN UHR'],
    [10, 5, 'ES IST FÜNF NACH ZEHN'],
    [10, 10, 'ES IST ZEHN NACH ZEHN'],
    [10, 15, 'ES IST VIERTEL NACH ZEHN'],
    [10, 20, 'ES IST ZWANZIG NACH ZEHN'],
    [10, 25, 'ES IST FÜNF VOR HALB ELF'],
    [10, 30, 'ES IST HALB ELF'],
    [10, 35, 'ES IST FÜNF NACH HALB ELF'],
    [10, 40, 'ES IST ZWANZIG VOR ELF'],
    [10, 45, 'ES IST VIERTEL VOR ELF'],
    [10, 50, 'ES IST ZEHN VOR ELF'],
    [10, 55, 'ES IST FÜNF VOR ELF'],
    [0, 0, 'ES IST ZWÖLF UHR'],
    [13, 0, 'ES IST EIN UHR'],
    [13, 5, 'ES IST FÜNF NACH EINS'],
    [12, 30, 'ES IST HALB EINS'],
  ])('%i:%i → "%s"', (hours, minutes, expected) => {
    expect(spell(hours, minutes)).toBe(expected);
  });
});
