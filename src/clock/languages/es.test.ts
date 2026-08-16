import { describe, expect, it } from 'vitest';
import { spanish } from './es';

function spell(hours: number, minutes: number): string {
  return [...(spanish.itIsFor?.(hours, minutes) ?? []), ...spanish.phrase(hours, minutes)]
    .sort((a, b) => a.row - b.row || a.start - b.start)
    .map((w) => w.text)
    .join(' ');
}

describe('spanish grid integrity', () => {
  it('is an 11x10 matrix', () => {
    expect(spanish.rows).toHaveLength(10);
    for (const row of spanish.rows) expect(row).toHaveLength(11);
  });

  it('every word coordinate spells its text in the grid', () => {
    for (const w of spanish.words) {
      expect(spanish.rows[w.row].slice(w.start, w.end + 1)).toBe(w.text);
    }
  });
});

describe('spanish time phrases', () => {
  it.each([
    [10, 0, 'SON LAS DIEZ'],
    [10, 4, 'SON LAS DIEZ'],
    [10, 5, 'SON LAS DIEZ Y CINCO'],
    [10, 10, 'SON LAS DIEZ Y DIEZ'],
    [10, 15, 'SON LAS DIEZ Y CUARTO'],
    [10, 20, 'SON LAS DIEZ Y VEINTE'],
    [10, 25, 'SON LAS DIEZ Y VEINTICINCO'],
    [10, 30, 'SON LAS DIEZ Y MEDIA'],
    [10, 35, 'SON LAS ONCE MENOS VEINTICINCO'],
    [10, 40, 'SON LAS ONCE MENOS VEINTE'],
    [10, 45, 'SON LAS ONCE MENOS CUARTO'],
    [10, 50, 'SON LAS ONCE MENOS DIEZ'],
    [10, 55, 'SON LAS ONCE MENOS CINCO'],
    [0, 0, 'SON LAS DOCE'],
    [13, 0, 'ES LA UNA'],
    [13, 30, 'ES LA UNA Y MEDIA'],
    [12, 45, 'ES LA UNA MENOS CUARTO'],
    [12, 30, 'SON LAS DOCE Y MEDIA'],
  ])('%i:%i → "%s"', (hours, minutes, expected) => {
    expect(spell(hours, minutes)).toBe(expected);
  });
});
