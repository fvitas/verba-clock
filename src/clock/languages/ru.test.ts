import { describe, expect, it } from 'vitest';
import { russian } from './ru';

// Words spell in fragments exactly as the face lights them (ЧЕ ТЫ РЕ = ЧЕТЫРЕ)
function spell(hours: number, minutes: number): string {
  return russian
    .phrase(hours, minutes)
    .sort((a, b) => a.row - b.row || a.start - b.start)
    .map((w) => w.text)
    .join(' ');
}

describe('russian grid integrity', () => {
  it('is an 11x10 matrix', () => {
    expect(russian.rows).toHaveLength(10);
    for (const row of russian.rows) expect(row).toHaveLength(11);
  });

  it('every word coordinate spells its text in the grid', () => {
    for (const w of russian.words) {
      expect(russian.rows[w.row].slice(w.start, w.end + 1)).toBe(w.text);
    }
  });
});

describe('russian time phrases (digital style, fragment words)', () => {
  it.each([
    [13, 0, 'ОДИН ЧАС'],
    [14, 0, 'ДВА ЧАСА'],
    [15, 0, 'ТРИ ЧАСА'],
    [16, 0, 'ЧЕ ТЫ РЕ ЧАСА'],
    [17, 0, 'ПЯТЬ ЧАСОВ'],
    [18, 0, 'ШЕСТЬ ЧАСОВ'],
    [19, 0, 'СЕМЬ ЧАСОВ'],
    [20, 0, 'ВО СЕМЬ ЧАСОВ'],
    [21, 0, 'ДЕ ВЯТЬ ЧАСОВ'],
    [22, 0, 'ДЕ СЯТЬ ЧАСОВ'],
    [23, 0, 'ОДИН НАДЦАТЬ ЧАСОВ'],
    [0, 0, 'ДВЕ НАДЦАТЬ ЧАСОВ'],
    [10, 4, 'ДЕ СЯТЬ ЧАСОВ'],
    [10, 5, 'ДЕ СЯТЬ ЧАСОВ ПЯТЬ МИНУТ'],
    [10, 10, 'ДЕ СЯТЬ ЧАСОВ ДЕ СЯТЬ МИНУТ'],
    [10, 15, 'ДЕ СЯТЬ ЧАСОВ ПЯТНАД ЦАТЬ МИНУТ'],
    [10, 20, 'ДЕ СЯТЬ ЧАСОВ ДВАД ЦАТЬ МИНУТ'],
    [10, 25, 'ДЕ СЯТЬ ЧАСОВ ДВАД ЦАТЬ ПЯТЬ МИНУТ'],
    [10, 30, 'ДЕ СЯТЬ ЧАСОВ ТРИД ЦАТЬ МИНУТ'],
    [10, 35, 'ДЕ СЯТЬ ЧАСОВ ТРИД ЦАТЬ ПЯТЬ МИНУТ'],
    [10, 40, 'ДЕ СЯТЬ ЧАСОВ СОРОК МИНУТ'],
    [10, 45, 'ДЕ СЯТЬ ЧАСОВ СОРОК ПЯТЬ МИНУТ'],
    [10, 50, 'ДЕ СЯТЬ ЧАСОВ ПЯТЬ ДЕСЯТ МИНУТ'],
    [10, 55, 'ДЕ СЯТЬ ЧАСОВ ПЯТЬ ДЕСЯТ ПЯТЬ МИНУТ'],
  ])('%i:%i → "%s"', (hours, minutes, expected) => {
    expect(spell(hours, minutes)).toBe(expected);
  });
});
