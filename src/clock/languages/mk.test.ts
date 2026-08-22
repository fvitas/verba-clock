import { describe, expect, it } from 'vitest';
import { macedonian } from './mk';

// Words spell in fragments exactly as the face lights them: ДЕСЕТ = Д + ЕСЕТ, ТРИ = Т + РИ
function spell(hours: number, minutes: number): string {
  return [...macedonian.itIs, ...macedonian.phrase(hours, minutes)].map((w) => w.text).join(' ');
}

describe('macedonian grid integrity', () => {
  it('is an 11x10 matrix', () => {
    expect(macedonian.rows).toHaveLength(10);
    for (const row of macedonian.rows) expect(row).toHaveLength(11);
  });

  it('every word coordinate spells its text in the grid', () => {
    for (const w of macedonian.words) {
      expect(macedonian.rows[w.row].slice(w.start, w.end + 1)).toBe(w.text);
    }
  });

  it('every phrase reads strictly top-left to bottom-right', () => {
    for (let hours = 0; hours < 24; hours++) {
      for (let minutes = 0; minutes < 60; minutes += 5) {
        const lit = [...macedonian.itIs, ...macedonian.phrase(hours, minutes)];
        for (let i = 1; i < lit.length; i++) {
          const prev = lit[i - 1];
          const cur = lit[i];
          expect(cur.row * 100 + cur.start).toBeGreaterThan(prev.row * 100 + prev.end);
        }
      }
    }
  });
});

describe('macedonian hours (:00)', () => {
  it.each([
    [1, 'ЧАСОТ Е ЕДЕН'],
    [2, 'ЧАСОТ Е ДВА'],
    [3, 'ЧАСОТ Е Т РИ'],
    [4, 'ЧАСОТ Е ЧЕТИРИ'],
    [5, 'ЧАСОТ Е ПЕТ'],
    [6, 'ЧАСОТ Е ШЕСТ'],
    [7, 'ЧАСОТ Е СЕДУМ'],
    [8, 'ЧАСОТ Е ОСУМ'],
    [9, 'ЧАСОТ Е ДЕВЕТ'],
    [10, 'ЧАСОТ Е Д ЕСЕТ'],
    [11, 'ЧАСОТ Е ЕДИНАЕСЕТ'],
    [12, 'ЧАСОТ Е ДВАНАЕСЕТ'],
  ])('%i:00', (hours, expected) => {
    expect(spell(hours, 0)).toBe(expected);
  });
});

describe('macedonian time phrases', () => {
  it.each([
    [7, 5, 'ЧАСОТ Е СЕДУМ И ПЕТ'],
    [7, 10, 'ЧАСОТ Е СЕДУМ И Д ЕСЕТ'],
    [7, 15, 'ЧАСОТ Е СЕДУМ И ПЕТНАЕСЕТ'],
    [7, 20, 'ЧАСОТ Е СЕДУМ И ДВАЕСЕТ'],
    [7, 25, 'ЧАСОТ Е СЕДУМ И ДВАЕСЕТ И ПЕТ'],
    [7, 30, 'ЧАСОТ Е СЕДУМ И ПОЛ'],
    // from :35 the next hour is named — осум без дваесет и пет
    [7, 35, 'ЧАСОТ Е ОСУМ БЕЗ ДВАЕСЕТ И ПЕТ'],
    [7, 40, 'ЧАСОТ Е ОСУМ БЕЗ ДВАЕСЕТ'],
    [7, 45, 'ЧАСОТ Е ОСУМ БЕЗ ПЕТНАЕСЕТ'],
    [7, 50, 'ЧАСОТ Е ОСУМ БЕЗ Д ЕСЕТ'],
    [7, 55, 'ЧАСОТ Е ОСУМ БЕЗ ПЕТ'],
    // rollovers land on the shared-cell hours
    [11, 40, 'ЧАСОТ Е ДВАНАЕСЕТ БЕЗ ДВАЕСЕТ'],
    [12, 45, 'ЧАСОТ Е ЕДЕН БЕЗ ПЕТНАЕСЕТ'],
    [2, 50, 'ЧАСОТ Е Т РИ БЕЗ Д ЕСЕТ'],
    [9, 35, 'ЧАСОТ Е Д ЕСЕТ БЕЗ ДВАЕСЕТ И ПЕТ'],
    [23, 55, 'ЧАСОТ Е ДВАНАЕСЕТ БЕЗ ПЕТ'],
    [0, 30, 'ЧАСОТ Е ДВАНАЕСЕТ И ПОЛ'],
    [13, 15, 'ЧАСОТ Е ЕДЕН И ПЕТНАЕСЕТ'],
  ])('%i:%i', (hours, minutes, expected) => {
    expect(spell(hours, minutes)).toBe(expected);
  });

  it('rounds down to the last five-minute step', () => {
    expect(spell(7, 4)).toBe(spell(7, 0));
    expect(spell(7, 34)).toBe(spell(7, 30));
  });
});
