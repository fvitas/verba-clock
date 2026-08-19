import { describe, expect, it } from 'vitest';
import { bulgarian } from './bg';

function spell(hours: number, minutes: number): string {
  return [...bulgarian.itIs, ...bulgarian.phrase(hours, minutes)]
    .sort((a, b) => a.row - b.row || a.start - b.start)
    .map((w) => w.text)
    .join(' ');
}

describe('bulgarian grid integrity', () => {
  it('is an 11x10 matrix', () => {
    expect(bulgarian.rows).toHaveLength(10);
    for (const row of bulgarian.rows) expect(row).toHaveLength(11);
  });

  it('every word coordinate spells its text in the grid', () => {
    for (const w of bulgarian.words) {
      expect(bulgarian.rows[w.row].slice(w.start, w.end + 1)).toBe(w.text);
    }
  });

  it('every phrase reads strictly top-left to bottom-right', () => {
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 5) {
        const coords = bulgarian.phrase(h, m);
        for (let i = 1; i < coords.length; i++) {
          const prev = coords[i - 1];
          const cur = coords[i];
          expect(cur.row * 100 + cur.start).toBeGreaterThan(prev.row * 100 + prev.end);
        }
      }
    }
  });
});

describe('bulgarian time phrases', () => {
  it.each([
    [7, 0, 'ЧАСЪТ Е СЕДЕМ'],
    [7, 5, 'ЧАСЪТ Е СЕДЕМ И ПЕТ'],
    [7, 10, 'ЧАСЪТ Е СЕДЕМ И ДЕСЕТ'],
    [7, 15, 'ЧАСЪТ Е СЕДЕМ И ПЕТНАДЕСЕТ'],
    [7, 20, 'ЧАСЪТ Е СЕДЕМ И ДВАДЕСЕТ'],
    [7, 25, 'ЧАСЪТ Е СЕДЕМ И ДВАДЕСЕТ И ПЕТ'],
    [7, 30, 'ЧАСЪТ Е СЕДЕМ И ПОЛОВИНА'],
    [7, 35, 'ЧАСЪТ Е ОСЕМ БЕЗ ДВАДЕСЕТ И ПЕТ'],
    [7, 40, 'ЧАСЪТ Е ОСЕМ БЕЗ ДВАДЕСЕТ'],
    [7, 45, 'ЧАСЪТ Е ОСЕМ БЕЗ ПЕТНАДЕСЕТ'],
    [7, 50, 'ЧАСЪТ Е ОСЕМ БЕЗ ДЕСЕТ'],
    [7, 55, 'ЧАСЪТ Е ОСЕМ БЕЗ ПЕТ'],
    [0, 0, 'ЧАСЪТ Е ДВАНАДЕСЕТ'],
    [12, 0, 'ЧАСЪТ Е ДВАНАДЕСЕТ'],
    [13, 0, 'ЧАСЪТ Е ЕДИН'],
    [13, 30, 'ЧАСЪТ Е ЕДИН И ПОЛОВИНА'],
    [12, 50, 'ЧАСЪТ Е ЕДИН БЕЗ ДЕСЕТ'],
    [23, 45, 'ЧАСЪТ Е ДВАНАДЕСЕТ БЕЗ ПЕТНАДЕСЕТ'],
    [10, 30, 'ЧАСЪТ Е ДЕСЕТ И ПОЛОВИНА'],
    [10, 10, 'ЧАСЪТ Е ДЕСЕТ И ДЕСЕТ'],
    [22, 0, 'ЧАСЪТ Е ДЕСЕТ'],
    [11, 0, 'ЧАСЪТ Е ЕДИНАДЕСЕТ'],
  ])('%i:%i → "%s"', (hours, minutes, expected) => {
    expect(spell(hours, minutes)).toBe(expected);
  });

  it('hour-ДЕСЕТ (inside ЕДИНАДЕСЕТ) and minute-ДЕСЕТ are distinct cells', () => {
    const coords = bulgarian.phrase(10, 10);
    const tens = coords.filter((w) => w.text === 'ДЕСЕТ');
    expect(tens).toHaveLength(2);
    expect(tens[0].row).not.toBe(tens[1].row);
  });
});
