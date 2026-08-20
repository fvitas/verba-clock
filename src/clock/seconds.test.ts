import { describe, expect, it } from 'vitest';
import { DIGITS, mirrorCols, resolveSeconds } from './seconds';

describe('digit patterns', () => {
  it('defines 0-9 as 7x5 bitmaps', () => {
    for (const digit of '0123456789') {
      const rows = DIGITS[digit];
      expect(rows).toHaveLength(7);
      for (const row of rows) expect(row).toMatch(/^[01]{5}$/);
    }
  });

  it('all ten patterns are distinct', () => {
    expect(new Set(Object.values(DIGITS).map((rows) => rows.join(''))).size).toBe(10);
  });
});

describe('resolveSeconds', () => {
  it('renders 00 as two zeros with 19 cells each', () => {
    const lit = resolveSeconds(0);
    expect(lit.size).toBe(38);
    expect(lit.has('1:1')).toBe(true);   // top bar of left zero
    expect(lit.has('1:0')).toBe(false);
    expect(lit.has('1:7')).toBe(true);   // top bar of right zero
  });

  it('places tens digit left, ones digit right', () => {
    const lit = resolveSeconds(42);
    expect(lit.has('1:3')).toBe(true);   // '4' top row 00010 at col offset 0
    expect(lit.has('1:8')).toBe(true);   // '2' top row 01110 at col offset 6
  });

  it('pads single digits with a leading zero', () => {
    expect(resolveSeconds(7).has('1:1')).toBe(true); // leading zero top bar on the left
  });
});

describe('mirrorCols', () => {
  it('flips columns so RTL faces still read left to right', () => {
    const lit = mirrorCols(resolveSeconds(42));
    expect(lit.size).toBe(resolveSeconds(42).size);
    expect(lit.has('1:7')).toBe(true);  // '4' top row, col 3 mirrored to 10-3
    expect(lit.has('1:2')).toBe(true);  // '2' top row, col 8 mirrored to 10-8
  });

  it('is its own inverse', () => {
    const lit = resolveSeconds(19);
    expect([...mirrorCols(mirrorCols(lit))].sort()).toEqual([...lit].sort());
  });
});
