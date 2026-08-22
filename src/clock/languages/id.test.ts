import { describe, expect, it } from 'vitest';
import { indonesian } from './id';

// Words spell in fragments exactly as the face lights them: SEPULUH = SE + PULUH, SEBELAS = SE + BELAS
function spell(hours: number, minutes: number): string {
  return [...indonesian.itIs, ...indonesian.phrase(hours, minutes)].map((w) => w.text).join(' ');
}

describe('indonesian grid integrity', () => {
  it('is an 11x10 matrix', () => {
    expect(indonesian.rows).toHaveLength(10);
    for (const row of indonesian.rows) expect(row).toHaveLength(11);
  });

  it('every word coordinate spells its text in the grid', () => {
    for (const w of indonesian.words) {
      expect(indonesian.rows[w.row].slice(w.start, w.end + 1)).toBe(w.text);
    }
  });

  it('every phrase reads strictly top-left to bottom-right', () => {
    for (let hours = 0; hours < 24; hours++) {
      for (let minutes = 0; minutes < 60; minutes += 5) {
        const lit = [...indonesian.itIs, ...indonesian.phrase(hours, minutes)];
        for (let i = 1; i < lit.length; i++) {
          const prev = lit[i - 1];
          const cur = lit[i];
          expect(cur.row * 100 + cur.start).toBeGreaterThan(prev.row * 100 + prev.end);
        }
      }
    }
  });

  it('gives LIMA, PULUH and SE separate cells above and below the LEBIH/KURANG row', () => {
    for (const text of ['LIMA', 'PULUH', 'SE']) {
      const cells = indonesian.words.filter((w) => w.text === text);
      expect(cells).toHaveLength(2);
      expect(cells[0].row).toBeLessThan(7);
      expect(cells[1].row).toBeGreaterThan(7);
    }
  });
});

describe('indonesian hours (:00)', () => {
  it.each([
    [1, 'JAM SATU'],
    [2, 'JAM DUA'],
    [3, 'JAM TIGA'],
    [4, 'JAM EMPAT'],
    [5, 'JAM LIMA'],
    [6, 'JAM ENAM'],
    [7, 'JAM TUJUH'],
    [8, 'JAM DELAPAN'],
    [9, 'JAM SEMBILAN'],
    [10, 'JAM SE PULUH'],
    [11, 'JAM SE BELAS'],
    [12, 'JAM DUA BELAS'],
  ])('%i:00', (hours, expected) => {
    expect(spell(hours, 0)).toBe(expected);
  });

  it('reads the same on the 24h side of the clock', () => {
    expect(spell(19, 0)).toBe('JAM TUJUH');
    expect(spell(0, 0)).toBe('JAM DUA BELAS');
  });
});

describe('indonesian phrases', () => {
  it.each([
    [7, 0, 'JAM TUJUH'],
    [7, 5, 'JAM TUJUH LEBIH LIMA'],
    [7, 10, 'JAM TUJUH LEBIH SE PULUH'],
    [7, 15, 'JAM TUJUH LEBIH LIMABELAS'],
    [7, 20, 'JAM TUJUH LEBIH DUA PULUH'],
    [7, 25, 'JAM TUJUH LEBIH DUA PULUH LIMA'],
    [7, 30, 'JAM SETENGAH DELAPAN'],
    [7, 35, 'JAM DELAPAN KURANG DUA PULUH LIMA'],
    [7, 40, 'JAM DELAPAN KURANG DUA PULUH'],
    [7, 45, 'JAM DELAPAN KURANG LIMABELAS'],
    [7, 50, 'JAM DELAPAN KURANG SE PULUH'],
    [7, 55, 'JAM DELAPAN KURANG LIMA'],
  ])('%i:%i', (hours, minutes, expected) => {
    expect(spell(hours, minutes)).toBe(expected);
  });

  it('rolls the hour over from the half hour onwards', () => {
    expect(spell(11, 25)).toBe('JAM SE BELAS LEBIH DUA PULUH LIMA');
    expect(spell(11, 30)).toBe('JAM SETENGAH DUA BELAS');
    expect(spell(12, 30)).toBe('JAM SETENGAH SATU');
    expect(spell(12, 55)).toBe('JAM SATU KURANG LIMA');
    expect(spell(23, 45)).toBe('JAM DUA BELAS KURANG LIMABELAS');
  });

  it('rounds down to the five-minute step', () => {
    for (let minutes = 15; minutes < 20; minutes++) {
      expect(spell(3, minutes)).toBe('JAM TIGA LEBIH LIMABELAS');
    }
  });
});
