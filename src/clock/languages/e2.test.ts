import { describe, expect, it } from 'vitest';
import { englishE2 } from './e2';

function spell(hours: number, minutes: number): string {
  return [...englishE2.itIs, ...englishE2.phrase(hours, minutes)]
    .sort((a, b) => a.row - b.row || a.start - b.start)
    .map((w) => w.text)
    .join(' ');
}

describe('english E2 grid integrity', () => {
  it('is an 11x10 matrix', () => {
    expect(englishE2.rows).toHaveLength(10);
    for (const row of englishE2.rows) expect(row).toHaveLength(11);
  });

  it('every word coordinate spells its text in the grid', () => {
    for (const w of englishE2.words) {
      expect(englishE2.rows[w.row].slice(w.start, w.end + 1)).toBe(w.text);
    }
  });
});

describe('english E2 time phrases', () => {
  it.each([
    [10, 0, 'IT IS TEN O CLOCK'],
    [10, 4, 'IT IS TEN O CLOCK'],
    [10, 5, 'IT IS FIVE PAST TEN'],
    [10, 10, 'IT IS TEN PAST TEN'],
    [10, 15, 'IT IS QUARTER PAST TEN'],
    [10, 20, 'IT IS TWENTY PAST TEN'],
    [10, 25, 'IT IS TWENTY FIVE PAST TEN'],
    [10, 30, 'IT IS HALF PAST TEN'],
    [10, 35, 'IT IS TWENTY FIVE TO ELEVEN'],
    [10, 40, 'IT IS TWENTY TO ELEVEN'],
    [10, 45, 'IT IS QUARTER TO ELEVEN'],
    [10, 50, 'IT IS TEN TO ELEVEN'],
    [10, 55, 'IT IS FIVE TO ELEVEN'],
    [0, 0, 'IT IS TWELVE O CLOCK'],
    [13, 0, 'IT IS ONE O CLOCK'],
  ])('%i:%i → "%s"', (hours, minutes, expected) => {
    expect(spell(hours, minutes)).toBe(expected);
  });
});
