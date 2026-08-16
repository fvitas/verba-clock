import { describe, expect, it } from 'vitest';
import { swedish } from './se';

function spell(hours: number, minutes: number): string {
  return [...swedish.itIs, ...swedish.phrase(hours, minutes)]
    .sort((a, b) => a.row - b.row || a.start - b.start)
    .map((w) => w.text)
    .join(' ');
}

describe('swedish grid integrity', () => {
  it('is an 11x10 matrix', () => {
    expect(swedish.rows).toHaveLength(10);
    for (const row of swedish.rows) expect(row).toHaveLength(11);
  });

  it('every word coordinate spells its text in the grid', () => {
    for (const w of swedish.words) {
      expect(swedish.rows[w.row].slice(w.start, w.end + 1)).toBe(w.text);
    }
  });
});

describe('swedish time phrases', () => {
  it.each([
    [10, 0, 'KLOCKAN ÄR TIO'],
    [10, 4, 'KLOCKAN ÄR TIO'],
    [10, 5, 'KLOCKAN ÄR FEM ÖVER TIO'],
    [10, 10, 'KLOCKAN ÄR TIO ÖVER TIO'],
    [10, 15, 'KLOCKAN ÄR KVART ÖVER TIO'],
    [10, 20, 'KLOCKAN ÄR TJUGO ÖVER TIO'],
    [10, 25, 'KLOCKAN ÄR FEM I HALV ELVA'],
    [10, 30, 'KLOCKAN ÄR HALV ELVA'],
    [10, 35, 'KLOCKAN ÄR FEM ÖVER HALV ELVA'],
    [10, 40, 'KLOCKAN ÄR TJUGO I ELVA'],
    [10, 45, 'KLOCKAN ÄR KVART I ELVA'],
    [10, 50, 'KLOCKAN ÄR TIO I ELVA'],
    [10, 55, 'KLOCKAN ÄR FEM I ELVA'],
    [0, 0, 'KLOCKAN ÄR TOLV'],
    [13, 0, 'KLOCKAN ÄR ETT'],
    [12, 30, 'KLOCKAN ÄR HALV ETT'],
  ])('%i:%i → "%s"', (hours, minutes, expected) => {
    expect(spell(hours, minutes)).toBe(expected);
  });
});
