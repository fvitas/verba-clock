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

describe('serbian time phrases (user-verified 2026-08-16)', () => {
  it.each([
    [10, 0, 'САД ЈЕ ДЕСЕТ'],
    [10, 4, 'САД ЈЕ ДЕСЕТ'],
    [10, 5, 'САД ЈЕ ДЕСЕТ И ПЕТ'],
    [10, 10, 'САД ЈЕ ДЕСЕТ И ДЕСЕТ'],
    [10, 15, 'САД ЈЕ ДЕСЕТ И ПЕТНАЕСТ'],
    [10, 20, 'САД ЈЕ ДЕСЕТ И ДВАДЕСЕТ'],
    [10, 25, 'САД ЈЕ ДЕСЕТ И ДВАДЕСЕТ ПЕТ'],
    [10, 30, 'САД ЈЕ ПОЛА ЈЕДАНАЕСТ'],
    [10, 35, 'САД ЈЕ ДВАДЕСЕТ ПЕТ ДО ЈЕДАНАЕСТ'],
    [10, 40, 'САД ЈЕ ДВАДЕСЕТ ДО ЈЕДАНАЕСТ'],
    [10, 45, 'САД ЈЕ ПЕТНАЕСТ ДО ЈЕДАНАЕСТ'],
    [10, 50, 'САД ЈЕ ДЕСЕТ ДО ЈЕДАНАЕСТ'],
    [10, 55, 'САД ЈЕ ПЕТ ДО ЈЕДАНАЕСТ'],
    [0, 0, 'САД ЈЕ ДВАНАЕСТ'],
    [13, 0, 'САД ЈЕ ЈЕДАН'],
    [13, 5, 'САД ЈЕ ЈЕДАН И ПЕТ'],
    [12, 30, 'САД ЈЕ ПОЛА ЈЕДАН'],
    [21, 50, 'САД ЈЕ ДЕСЕТ ДО ДЕСЕТ'],
  ])('%i:%i → "%s"', (hours, minutes, expected) => {
    expect(spell(hours, minutes)).toBe(expected);
  });
});
