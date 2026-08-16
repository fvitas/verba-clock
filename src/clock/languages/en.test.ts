import { describe, expect, it } from 'vitest';
import { english } from './en';

function spell(hours: number, minutes: number): string {
  return [...english.itIs, ...english.phrase(hours, minutes)]
    .sort((a, b) => a.row - b.row || a.start - b.start)
    .map((w) => w.text)
    .join(' ');
}

describe('english grid integrity', () => {
  it('is an 11x10 matrix', () => {
    expect(english.rows).toHaveLength(10);
    for (const row of english.rows) expect(row).toHaveLength(11);
  });

  it('every word coordinate spells its text in the grid', () => {
    for (const w of english.words) {
      expect(english.rows[w.row].slice(w.start, w.end + 1)).toBe(w.text);
    }
  });
});

describe('english time phrases', () => {
  it.each([
    [10, 0, 'IT IS TEN OCLOCK'],
    [10, 4, 'IT IS TEN OCLOCK'],
    [10, 5, 'IT IS FIVE PAST TEN'],
    [10, 10, 'IT IS TEN PAST TEN'],
    [10, 17, 'IT IS A QUARTER PAST TEN'],
    [10, 20, 'IT IS TWENTY PAST TEN'],
    [10, 25, 'IT IS TWENTY FIVE PAST TEN'],
    [9, 30, 'IT IS HALF PAST NINE'],
    [10, 35, 'IT IS TWENTY FIVE TO ELEVEN'],
    [10, 40, 'IT IS TWENTY TO ELEVEN'],
    [10, 45, 'IT IS A QUARTER TO ELEVEN'],
    [23, 50, 'IT IS TEN TO TWELVE'],
    [12, 55, 'IT IS FIVE TO ONE'],
    [0, 0, 'IT IS TWELVE OCLOCK'],
    [12, 0, 'IT IS TWELVE OCLOCK'],
    [0, 59, 'IT IS FIVE TO ONE'],
  ])('%i:%i → "%s"', (hours, minutes, expected) => {
    expect(spell(hours, minutes)).toBe(expected);
  });
});
