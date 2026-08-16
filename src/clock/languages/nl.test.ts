import { describe, expect, it } from 'vitest';
import { dutch } from './nl';

function spell(hours: number, minutes: number): string {
  return [...dutch.itIs, ...dutch.phrase(hours, minutes)]
    .sort((a, b) => a.row - b.row || a.start - b.start)
    .map((w) => w.text)
    .join(' ');
}

describe('dutch grid integrity', () => {
  it('is an 11x10 matrix', () => {
    expect(dutch.rows).toHaveLength(10);
    for (const row of dutch.rows) expect(row).toHaveLength(11);
  });

  it('every word coordinate spells its text in the grid', () => {
    for (const w of dutch.words) {
      expect(dutch.rows[w.row].slice(w.start, w.end + 1)).toBe(w.text);
    }
  });
});

describe('dutch time phrases', () => {
  it.each([
    [10, 0, 'HET IS TIEN UUR'],
    [10, 4, 'HET IS TIEN UUR'],
    [10, 5, 'HET IS VIJF OVER TIEN'],
    [10, 10, 'HET IS TIEN OVER TIEN'],
    [10, 15, 'HET IS KWART OVER TIEN'],
    [10, 20, 'HET IS TIEN VOOR HALF ELF'],
    [10, 25, 'HET IS VIJF VOOR HALF ELF'],
    [10, 30, 'HET IS HALF ELF'],
    [10, 35, 'HET IS VIJF OVER HALF ELF'],
    [10, 40, 'HET IS TIEN OVER HALF ELF'],
    [10, 45, 'HET IS KWART VOOR ELF'],
    [10, 50, 'HET IS TIEN VOOR ELF'],
    [10, 55, 'HET IS VIJF VOOR ELF'],
    [0, 0, 'HET IS TWAALF UUR'],
    [13, 0, 'HET IS ÉÉN UUR'],
    [12, 30, 'HET IS HALF ÉÉN'],
    [12, 45, 'HET IS KWART VOOR ÉÉN'],
  ])('%i:%i → "%s"', (hours, minutes, expected) => {
    expect(spell(hours, minutes)).toBe(expected);
  });
});
