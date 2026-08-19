import { describe, expect, it } from 'vitest';
import { hungarian } from './hu';

function spell(hours: number, minutes: number): string {
  return [...hungarian.itIs, ...hungarian.phrase(hours, minutes)]
    .sort((a, b) => a.row - b.row || a.start - b.start)
    .map((w) => w.text)
    .join(' ');
}

describe('hungarian grid integrity', () => {
  it('is an 11x10 matrix', () => {
    expect(hungarian.rows).toHaveLength(10);
    for (const row of hungarian.rows) expect(row).toHaveLength(11);
  });

  it('every word coordinate spells its text in the grid', () => {
    for (const w of hungarian.words) {
      expect(hungarian.rows[w.row].slice(w.start, w.end + 1)).toBe(w.text);
    }
  });

  it('every phrase reads strictly top-left to bottom-right', () => {
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 5) {
        const coords = hungarian.phrase(h, m);
        for (let i = 1; i < coords.length; i++) {
          const prev = coords[i - 1];
          const cur = coords[i];
          expect(cur.row * 100 + cur.start).toBeGreaterThan(prev.row * 100 + prev.end);
        }
      }
    }
  });
});

describe('hungarian time phrases', () => {
  it.each([
    [7, 0, 'MOST HÉT ÓRA VAN'],
    [7, 5, 'MOST ÖT PERCCEL MÚLT HÉT'],
    [7, 10, 'MOST TÍZ PERCCEL MÚLT HÉT'],
    [7, 15, 'MOST NEGYED NYOLC VAN'],
    [7, 20, 'MOST ÖT PERCCEL MÚLT NEGYED NYOLC'],
    [7, 25, 'MOST ÖT PERC MÚLVA FÉL NYOLC'],
    [7, 30, 'MOST FÉL NYOLC VAN'],
    [7, 35, 'MOST ÖT PERCCEL MÚLT FÉL NYOLC'],
    [7, 40, 'MOST ÖT PERC MÚLVA HÁROMNEGYED NYOLC'],
    [7, 45, 'MOST HÁROMNEGYED NYOLC VAN'],
    [7, 50, 'MOST TÍZ PERC MÚLVA NYOLC'],
    [7, 55, 'MOST ÖT PERC MÚLVA NYOLC'],
    [2, 0, 'MOST KÉT ÓRA VAN'],
    [14, 0, 'MOST KÉT ÓRA VAN'],
    [1, 30, 'MOST FÉL KETTŐ VAN'],
    [2, 5, 'MOST ÖT PERCCEL MÚLT KETTŐ'],
    [12, 15, 'MOST NEGYED EGY VAN'],
    [12, 30, 'MOST FÉL EGY VAN'],
    [0, 0, 'MOST TIZENKETTŐ ÓRA VAN'],
    [11, 0, 'MOST TIZENEGY ÓRA VAN'],
    [9, 50, 'MOST TÍZ PERC MÚLVA TÍZ'],
    [10, 0, 'MOST TÍZ ÓRA VAN'],
    [4, 55, 'MOST ÖT PERC MÚLVA ÖT'],
    [11, 45, 'MOST HÁROMNEGYED TIZENKETTŐ VAN'],
  ])('%i:%i → "%s"', (hours, minutes, expected) => {
    expect(spell(hours, minutes)).toBe(expected);
  });

  it('minute-TÍZ and hour-TÍZ are distinct cells at 9:50', () => {
    const tens = hungarian.phrase(9, 50).filter((w) => w.text === 'TÍZ');
    expect(tens).toHaveLength(2);
    expect(tens[0].row).not.toBe(tens[1].row);
  });
});
