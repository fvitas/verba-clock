import { describe, expect, it } from 'vitest';
import { danish } from './dk';

function spell(hours: number, minutes: number): string {
  return [...danish.itIs, ...danish.phrase(hours, minutes)]
    .sort((a, b) => a.row - b.row || a.start - b.start)
    .map((w) => w.text)
    .join(' ');
}

describe('danish grid integrity', () => {
  it('is an 11x10 matrix', () => {
    expect(danish.rows).toHaveLength(10);
    for (const row of danish.rows) expect(row).toHaveLength(11);
  });

  it('every word coordinate spells its text in the grid', () => {
    for (const w of danish.words) {
      expect(danish.rows[w.row].slice(w.start, w.end + 1)).toBe(w.text);
    }
  });
});

describe('danish time phrases', () => {
  it.each([
    [10, 0, 'KLOKKEN ER TI'],
    [10, 4, 'KLOKKEN ER TI'],
    [10, 5, 'KLOKKEN ER FEM MINUTTER OVER TI'],
    [10, 10, 'KLOKKEN ER TI MINUTTER OVER TI'],
    [10, 15, 'KLOKKEN ER KVART OVER TI'],
    [10, 20, 'KLOKKEN ER TYVE MINUTTER OVER TI'],
    [10, 25, 'KLOKKEN ER FEM MINUTTER I HALV ELLEVE'],
    [10, 30, 'KLOKKEN ER HALV ELLEVE'],
    [10, 35, 'KLOKKEN ER FEM MINUTTER OVER HALV ELLEVE'],
    [10, 40, 'KLOKKEN ER TYVE MINUTTER I ELLEVE'],
    [10, 45, 'KLOKKEN ER KVART I ELLEVE'],
    [10, 50, 'KLOKKEN ER TI MINUTTER I ELLEVE'],
    [10, 55, 'KLOKKEN ER FEM MINUTTER I ELLEVE'],
    [0, 0, 'KLOKKEN ER TOLV'],
    [13, 0, 'KLOKKEN ER ET'],
    [12, 30, 'KLOKKEN ER HALV ET'],
  ])('%i:%i → "%s"', (hours, minutes, expected) => {
    expect(spell(hours, minutes)).toBe(expected);
  });
});
