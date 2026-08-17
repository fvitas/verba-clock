import { describe, expect, it } from 'vitest';
import { serbian } from './sr';

function spell(hours: number, minutes: number): string {
  return [...serbian.itIs, ...serbian.phrase(hours, minutes)]
    .sort((a, b) => a.row - b.row || a.start - b.start)
    .map((w) => w.text)
    .join(' ');
}

describe('serbian grid integrity', () => {
  it('is an 11x10 matrix', () => {
    expect(serbian.rows).toHaveLength(10);
    for (const row of serbian.rows) expect(row).toHaveLength(11);
  });

  it('every word coordinate spells its text in the grid', () => {
    for (const w of serbian.words) {
      expect(serbian.rows[w.row].slice(w.start, w.end + 1)).toBe(w.text);
    }
  });
});

describe('serbian time phrases (user-verified 2026-08-16, row 0 reworked 2026-08-17)', () => {
  it.each([
    [10, 0, 'САДА ЈЕ ДЕСЕТ'],
    [10, 4, 'САДА ЈЕ ДЕСЕТ'],
    [10, 5, 'САДА ЈЕ ДЕСЕТ И ПЕТ'],
    [10, 10, 'САДА ЈЕ ДЕСЕТ И ДЕСЕТ'],
    [10, 15, 'САДА ЈЕ ДЕСЕТ И ПЕТНАЕСТ'],
    [10, 20, 'САДА ЈЕ ДЕСЕТ И ДВАДЕСЕТ'],
    [10, 25, 'САДА ЈЕ ДЕСЕТ И ДВАДЕСЕТ ПЕТ'],
    [10, 30, 'САДА ЈЕ ПОЛА ЈЕДАНАЕСТ'],
    [10, 35, 'САДА ЈЕ ДВАДЕСЕТ ПЕТ ДО ЈЕДАНАЕСТ'],
    [10, 40, 'САДА ЈЕ ДВАДЕСЕТ ДО ЈЕДАНАЕСТ'],
    [10, 45, 'САДА ЈЕ ПЕТНАЕСТ ДО ЈЕДАНАЕСТ'],
    [10, 50, 'САДА ЈЕ ДЕСЕТ ДО ЈЕДАНАЕСТ'],
    [10, 55, 'САДА ЈЕ ПЕТ ДО ЈЕДАНАЕСТ'],
    [0, 0, 'САДА ЈЕ ДВАНАЕСТ'],
    [13, 0, 'САДА ЈЕ ЈЕДАН'],
    [13, 5, 'САДА ЈЕ ЈЕДАН И ПЕТ'],
    [12, 30, 'САДА ЈЕ ПОЛА ЈЕДАН'],
    [21, 50, 'САДА ЈЕ ДЕСЕТ ДО ДЕСЕТ'],
  ])('%i:%i → "%s"', (hours, minutes, expected) => {
    expect(spell(hours, minutes)).toBe(expected);
  });
});
