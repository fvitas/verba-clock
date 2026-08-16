import { describe, expect, it } from 'vitest';
import { swissGerman } from './ch';

function spell(hours: number, minutes: number): string {
  return [...swissGerman.itIs, ...swissGerman.phrase(hours, minutes)]
    .sort((a, b) => a.row - b.row || a.start - b.start)
    .map((w) => w.text)
    .join(' ');
}

describe('swiss german grid integrity', () => {
  it('is an 11x10 matrix', () => {
    expect(swissGerman.rows).toHaveLength(10);
    for (const row of swissGerman.rows) expect(row).toHaveLength(11);
  });

  it('every word coordinate spells its text in the grid', () => {
    for (const w of swissGerman.words) {
      expect(swissGerman.rows[w.row].slice(w.start, w.end + 1)).toBe(w.text);
    }
  });
});

describe('swiss german time phrases', () => {
  it.each([
    [10, 0, 'ES ISCH ZÄNI'],
    [10, 4, 'ES ISCH ZÄNI'],
    [10, 5, 'ES ISCH FÜF AB ZÄNI'],
    [10, 10, 'ES ISCH ZÄÄ AB ZÄNI'],
    [10, 15, 'ES ISCH VIERTU AB ZÄNI'],
    [10, 20, 'ES ISCH ZWÄNZG AB ZÄNI'],
    [10, 25, 'ES ISCH FÜF VOR HAUBI EUFI'],
    [10, 30, 'ES ISCH HAUBI EUFI'],
    [10, 35, 'ES ISCH FÜF AB HAUBI EUFI'],
    [10, 40, 'ES ISCH ZWÄNZG VOR EUFI'],
    [10, 45, 'ES ISCH VIERTU VOR EUFI'],
    [10, 50, 'ES ISCH ZÄÄ VOR EUFI'],
    [10, 55, 'ES ISCH FÜF VOR EUFI'],
    [0, 0, 'ES ISCH ZWÖUFI'],
    [13, 0, 'ES ISCH EIS'],
    [12, 30, 'ES ISCH HAUBI EIS'],
  ])('%i:%i → "%s"', (hours, minutes, expected) => {
    expect(spell(hours, minutes)).toBe(expected);
  });
});
