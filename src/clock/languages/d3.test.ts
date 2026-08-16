import { describe, expect, it } from 'vitest';
import { swabian } from './d3';

function spell(hours: number, minutes: number): string {
  return [...swabian.itIs, ...swabian.phrase(hours, minutes)]
    .sort((a, b) => a.row - b.row || a.start - b.start)
    .map((w) => w.text)
    .join(' ');
}

describe('swabian grid integrity', () => {
  it('is an 11x10 matrix', () => {
    expect(swabian.rows).toHaveLength(10);
    for (const row of swabian.rows) expect(row).toHaveLength(11);
  });

  it('every word coordinate spells its text in the grid', () => {
    for (const w of swabian.words) {
      expect(swabian.rows[w.row].slice(w.start, w.end + 1)).toBe(w.text);
    }
  });
});

describe('swabian time phrases', () => {
  it.each([
    [10, 0, 'ES ISCH ZEHNE'],
    [10, 5, 'ES ISCH FÜNF NACH ZEHNE'],
    [10, 10, 'ES ISCH ZEHN NACH ZEHNE'],
    [10, 15, 'ES ISCH VIERTL ELFE'],
    [10, 20, 'ES ISCH ZEHN VOR HALB ELFE'],
    [10, 25, 'ES ISCH FÜNF VOR HALB ELFE'],
    [10, 30, 'ES ISCH HALB ELFE'],
    [10, 35, 'ES ISCH FÜNF NACH HALB ELFE'],
    [10, 40, 'ES ISCH ZEHN NACH HALB ELFE'],
    [10, 45, 'ES ISCH DREIVIERTL ELFE'],
    [10, 50, 'ES ISCH ZEHN VOR ELFE'],
    [10, 55, 'ES ISCH FÜNF VOR ELFE'],
    [0, 0, 'ES ISCH ZWÖLFE'],
    [13, 0, 'ES ISCH OISE'],
    [12, 30, 'ES ISCH HALB OISE'],
  ])('%i:%i → "%s"', (hours, minutes, expected) => {
    expect(spell(hours, minutes)).toBe(expected);
  });
});
