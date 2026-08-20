import { describe, expect, it } from 'vitest';
import { arabic } from './ar';
import type { WordCoord } from '../types';

const pos = (w: WordCoord): number => w.row * 100 + w.start;

function spell(hours: number, minutes: number): string {
  return arabic
    .phrase(hours, minutes)
    .sort((a, b) => pos(a) - pos(b))
    .map((w) => w.text)
    .join(' ');
}

describe('arabic grid integrity', () => {
  it('is a 10-row word grid', () => {
    expect(arabic.rows).toHaveLength(10);
    expect(arabic.layout).toBe('word');
    expect(arabic.dir).toBe('rtl');
  });

  it('every word coordinate matches its slot text in the grid', () => {
    for (const w of arabic.words) {
      expect(w.start).toBe(w.end);
      expect(arabic.rows[w.row].split(' ')[w.start]).toBe(w.text);
    }
  });

  it('every phrase reads strictly in RTL row order (top-right to bottom-left)', () => {
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 5) {
        const coords = arabic.phrase(h, m);
        expect(coords.length).toBeGreaterThan(0);
        for (let i = 1; i < coords.length; i++) {
          expect(pos(coords[i])).toBeGreaterThan(pos(coords[i - 1]));
        }
      }
    }
  });

  it('prefixes الساعة الآن as the "it is" words', () => {
    expect(arabic.itIs.map((w) => w.text)).toEqual(['الساعة', 'الآن']);
    expect(arabic.itIs.map((w) => [w.row, w.start])).toEqual([
      [0, 0],
      [0, 1],
    ]);
  });
});

describe('arabic time phrases', () => {
  it('matches the 7:30 reference photos: السابعة والنصف with the row-3 hour copy lit', () => {
    const coords = arabic.phrase(7, 30);
    expect(spell(7, 30)).toBe('السابعة والنصف');
    const hour = coords.find((w) => w.text === 'السابعة');
    expect(hour?.row).toBe(3);
    expect(hour?.start).toBe(3);
  });

  it.each([
    [7, 0, 'السابعة'],
    [7, 5, 'السابعة وخمس دقائق'],
    [7, 10, 'السابعة وعشر دقائق'],
    [7, 15, 'السابعة والربع'],
    [7, 20, 'السابعة والثلث'],
    [7, 25, 'السابعة والنصف الا خمس دقائق'],
    [7, 35, 'السابعة والنصف وخمس دقائق'],
    [7, 40, 'الثامنة الا الثلث'],
    [7, 45, 'الثامنة الا الربع'],
    [7, 50, 'الثامنة الا عشر دقائق'],
    [7, 55, 'الثامنة الا خمس دقائق'],
    [9, 0, 'التاسعة'],
    [9, 5, 'التاسعة وخمس دقائق'],
    [8, 45, 'التاسعة الا الربع'],
    [11, 0, 'الحادية عشر'],
    [11, 30, 'الحادية عشر والنصف'],
    [10, 40, 'الحادية عشر الا الثلث'],
    [0, 0, 'الثانية عشر'],
    [12, 30, 'الثانية عشر والنصف'],
    [23, 45, 'الثانية عشر الا الربع'],
    [1, 40, 'الثانية الا الثلث'],
    [12, 45, 'الواحدة الا الربع'],
  ])('%i:%i → "%s"', (hours, minutes, expected) => {
    expect(spell(hours, minutes)).toBe(expected);
  });

  it('advances to the next hour only from :40', () => {
    expect(spell(7, 35)).toContain('السابعة');
    expect(spell(7, 40)).toContain('الثامنة');
  });

  it('picks the latest hour copy that still precedes the minute words', () => {
    // 1:40 → hour 2 has a copy in row 6 right before الا الثلث
    const coords = arabic.phrase(1, 40);
    const hour = coords.find((w) => w.text === 'الثانية');
    expect(hour?.row).toBe(6);
    expect(hour?.start).toBe(0);
  });
});
