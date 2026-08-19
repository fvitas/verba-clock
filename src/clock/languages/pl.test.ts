import { describe, expect, it } from 'vitest';
import { polish } from './pl';
import type { WordCoord } from '../types';

// Spell using display text (cellOverrides expand ligature cells like PI/DZI/JE)
function display(w: WordCoord): string {
  let out = '';
  for (let col = w.start; col <= w.end; col++) {
    out += polish.cellOverrides?.[`${w.row}:${col}`] ?? polish.rows[w.row][col];
  }
  return out;
}

function spell(hours: number, minutes: number): string {
  return polish
    .phrase(hours, minutes)
    .sort((a, b) => a.row - b.row || a.start - b.start)
    .map(display)
    .join(' ');
}

describe('polish grid integrity', () => {
  it('is an 11x10 matrix', () => {
    expect(polish.rows).toHaveLength(10);
    for (const row of polish.rows) expect(row).toHaveLength(11);
  });

  it('every word coordinate spells its cell text in the grid', () => {
    for (const w of polish.words) {
      expect(polish.rows[w.row].slice(w.start, w.end + 1)).toBe(w.text);
    }
  });

  it('every phrase reads strictly top-left to bottom-right', () => {
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 5) {
        const coords = polish.phrase(h, m);
        for (let i = 1; i < coords.length; i++) {
          const prev = coords[i - 1];
          const cur = coords[i];
          expect(cur.row * 100 + cur.start).toBeGreaterThan(prev.row * 100 + prev.end);
        }
      }
    }
  });
});

describe('polish time phrases', () => {
  it('matches the 7:30 reference photo: WPÓŁ DO ÓSM+EJ with the A of ÓSMA unlit', () => {
    expect(spell(7, 30)).toBe('WPÓŁ DO ÓSM EJ');
  });

  it('matches the 7:50 reference photo: ZA DZIESIĘĆ ÓSMA (nominative)', () => {
    expect(spell(7, 50)).toBe('ZA DZIESIĘĆ ÓSMA');
  });

  it.each([
    [7, 0, 'SIÓDMA'],
    [8, 0, 'ÓSMA'],
    [7, 5, 'PIĘĆ PO SIÓDM EJ'],
    [7, 10, 'DZIESIĘĆ PO SIÓDM EJ'],
    [7, 15, 'KWADRANS PO SIÓDM EJ'],
    [7, 20, 'DWADZIEŚCIA PO SIÓDM EJ'],
    [7, 25, 'DWADZIEŚCIA PIĘĆ PO SIÓDM EJ'],
    [7, 35, 'ZA DWADZIEŚCIA PIĘĆ ÓSMA'],
    [7, 40, 'ZA DWADZIEŚCIA ÓSMA'],
    [7, 45, 'ZA KWADRANS ÓSMA'],
    [7, 55, 'ZA PIĘĆ ÓSMA'],
    [1, 0, 'PIERWSZA'],
    [1, 5, 'PIĘĆ PO PIERWSZ EJ'],
    [1, 30, 'WPÓŁ DO DRUG I EJ'],
    [2, 0, 'DRUGA'],
    [2, 30, 'WPÓŁ DO TRZECI EJ'],
    [9, 0, 'DZIE W IĄTA'],
    [10, 0, 'DZIE S IĄTA'],
    [8, 30, 'WPÓŁ DO DZIE W IĄT EJ'],
    [9, 30, 'WPÓŁ DO DZIE S IĄT EJ'],
    [11, 0, 'JEDENASTA'],
    [10, 30, 'WPÓŁ DO JEDENAST EJ'],
    [12, 0, 'DWU NASTA'],
    [11, 45, 'ZA KWADRANS DWU NASTA'],
    [11, 30, 'WPÓŁ DO DWU NAST EJ'],
    [12, 30, 'WPÓŁ DO PIERWSZ EJ'],
    [23, 50, 'ZA DZIESIĘĆ DWU NASTA'],
    [0, 0, 'DWU NASTA'],
  ])('%i:%i → "%s"', (hours, minutes, expected) => {
    expect(spell(hours, minutes)).toBe(expected);
  });

  it('DZIEWIĄTA skips the S cell and DZIESIĄTA skips the W cell', () => {
    const nine = polish.phrase(9, 0);
    const ten = polish.phrase(10, 0);
    expect(nine.some((w) => w.text === 'W' && w.start === 5)).toBe(true);
    expect(nine.some((w) => w.text === 'S')).toBe(false);
    expect(ten.some((w) => w.text === 'S' && w.start === 6)).toBe(true);
    expect(ten.some((w) => w.text === 'W' && w.start === 5)).toBe(false);
  });
});
