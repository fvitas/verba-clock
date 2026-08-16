import { describe, expect, it } from 'vitest';
import { norwegian } from './no';

function spell(hours: number, minutes: number): string {
  return [...norwegian.itIs, ...norwegian.phrase(hours, minutes)]
    .sort((a, b) => a.row - b.row || a.start - b.start)
    .map((w) => w.text)
    .join(' ');
}

describe('norwegian grid integrity', () => {
  it('is an 11x10 matrix', () => {
    expect(norwegian.rows).toHaveLength(10);
    for (const row of norwegian.rows) expect(row).toHaveLength(11);
  });

  it('every word coordinate spells its text in the grid', () => {
    for (const w of norwegian.words) {
      expect(norwegian.rows[w.row].slice(w.start, w.end + 1)).toBe(w.text);
    }
  });
});

describe('norwegian time phrases', () => {
  it.each([
    [10, 0, 'KLOKKEN ER TI'],
    [10, 4, 'KLOKKEN ER TI'],
    [10, 5, 'KLOKKEN ER FEM OVER TI'],
    [10, 10, 'KLOKKEN ER TI OVER TI'],
    [10, 15, 'KLOKKEN ER KVART OVER TI'],
    [10, 20, 'KLOKKEN ER TI PÅ HALV ELLEVE'],
    [10, 25, 'KLOKKEN ER FEM PÅ HALV ELLEVE'],
    [10, 30, 'KLOKKEN ER HALV ELLEVE'],
    [10, 35, 'KLOKKEN ER FEM OVER HALV ELLEVE'],
    [10, 40, 'KLOKKEN ER TI OVER HALV ELLEVE'],
    [10, 45, 'KLOKKEN ER KVART PÅ ELLEVE'],
    [10, 50, 'KLOKKEN ER TI PÅ ELLEVE'],
    [10, 55, 'KLOKKEN ER FEM PÅ ELLEVE'],
    [0, 0, 'KLOKKEN ER TOLV'],
    [13, 0, 'KLOKKEN ER ETT'],
    [12, 30, 'KLOKKEN ER HALV ETT'],
  ])('%i:%i → "%s"', (hours, minutes, expected) => {
    expect(spell(hours, minutes)).toBe(expected);
  });
});
