import { describe, expect, it } from 'vitest';
import { hebrew } from './he';
import type { WordCoord } from '../types';

// Spell using display text (the cellOverride expands שתיים's double-yod cell)
function display(w: WordCoord): string {
  let out = '';
  for (let col = w.start; col <= w.end; col++) {
    out += hebrew.cellOverrides?.[`${w.row}:${col}`] ?? hebrew.rows[w.row][col];
  }
  return out;
}

function spell(hours: number, minutes: number): string {
  return hebrew
    .phrase(hours, minutes)
    .sort((a, b) => a.row - b.row || a.start - b.start)
    .map(display)
    .join(' ');
}

describe('hebrew grid integrity', () => {
  it('is an 11x10 RTL letter matrix', () => {
    expect(hebrew.rows).toHaveLength(10);
    for (const row of hebrew.rows) expect(row).toHaveLength(11);
    expect(hebrew.dir).toBe('rtl');
    expect(hebrew.layout).toBeUndefined();
  });

  it('every word coordinate spells its cell text in the grid', () => {
    for (const w of hebrew.words) {
      expect(hebrew.rows[w.row].slice(w.start, w.end + 1)).toBe(w.text);
    }
  });

  it('prints both yods of שתיים in one cell', () => {
    expect(hebrew.cellOverrides).toEqual({ '1:4': 'יי' });
    expect(hebrew.rows[1][4]).toBe('י');
  });

  it('every phrase reads strictly top-right to bottom-left', () => {
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 5) {
        const coords = hebrew.phrase(h, m);
        expect(coords.length).toBeGreaterThan(0);
        for (let i = 1; i < coords.length; i++) {
          expect(coords[i].row * 100 + coords[i].start).toBeGreaterThan(
            coords[i - 1].row * 100 + coords[i - 1].end,
          );
        }
      }
    }
  });

  it('never lights two overlapping words at once (חמש/שש/שבע share cells)', () => {
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 5) {
        const coords = [...hebrew.itIs, ...hebrew.phrase(h, m)];
        const cells = new Set(coords.flatMap((w) => Array.from({ length: w.end - w.start + 1 }, (_, i) => `${w.row}:${w.start + i}`)));
        expect(cells.size).toBe(coords.reduce((sum, w) => sum + (w.end - w.start + 1), 0));
      }
    }
  });

  it('prefixes השעה as the "it is" words', () => {
    expect(hebrew.itIs.map((w) => w.text)).toEqual(['השעה']);
    expect(hebrew.itIs.map((w) => [w.row, w.start])).toEqual([[0, 0]]);
  });
});

describe('hebrew time phrases', () => {
  it('matches the 7:30 reference photos: שבע וחצי', () => {
    expect(spell(7, 30)).toBe('שבע וחצי');
    const coords = hebrew.phrase(7, 30);
    expect(coords.map((w) => [w.row, w.start])).toEqual([
      [3, 3],
      [8, 7],
    ]);
  });

  it.each([
    [7, 0, 'שבע'],
    [7, 5, 'שבע וחמישה'],
    [7, 10, 'שבע ועשרה'],
    [7, 15, 'שבע ורבע'],
    [7, 20, 'שבע ועשרים'],
    [7, 25, 'שבע ועשרים וחמש'],
    [7, 35, 'שבע שלושים וחמש'],
    [7, 40, 'שבע וארבעים'],
    [7, 45, 'שבע וארבעים וחמש'],
    [7, 50, 'שבע וחמישים'],
    [7, 55, 'שבע וחמישים וחמש'],
    [1, 0, 'אחת'],
    [2, 0, 'שתיים'],
    [3, 15, 'שלוש ורבע'],
    [4, 30, 'ארבע וחצי'],
    [5, 0, 'חמש'],
    [6, 5, 'שש וחמישה'],
    [8, 20, 'שמונה ועשרים'],
    [9, 5, 'תשע וחמישה'],
    [10, 30, 'עשר וחצי'],
    [11, 0, 'אחת עשרה'],
    [11, 30, 'אחת עשרה וחצי'],
    [12, 0, 'שתיים עשרה'],
    [0, 0, 'שתיים עשרה'],
    [0, 45, 'שתיים עשרה וארבעים וחמש'],
    [23, 10, 'אחת עשרה ועשרה'],
    [13, 30, 'אחת וחצי'],
  ])('%i:%i → "%s"', (hours, minutes, expected) => {
    expect(spell(hours, minutes)).toBe(expected);
  });

  it('keeps the current hour all the way to :55 (the face has no "to" word)', () => {
    expect(spell(7, 55)).toContain('שבע');
    expect(spell(7, 59)).toBe(spell(7, 55));
  });
});
