import { describe, expect, it } from 'vitest';
import { italian } from './it';

// L'UNA occupies the four grid cells LUNA (apostrophe is a printed mark, not a cell)
function spell(hours: number, minutes: number): string {
  return [...(italian.itIsFor?.(hours, minutes) ?? []), ...italian.phrase(hours, minutes)]
    .sort((a, b) => a.row - b.row || a.start - b.start)
    .map((w) => w.text)
    .join(' ');
}

describe('italian grid integrity', () => {
  it('is an 11x10 matrix', () => {
    expect(italian.rows).toHaveLength(10);
    for (const row of italian.rows) expect(row).toHaveLength(11);
  });

  it('every word coordinate spells its text in the grid', () => {
    for (const w of italian.words) {
      expect(italian.rows[w.row].slice(w.start, w.end + 1)).toBe(w.text);
    }
  });
});

describe('italian time phrases', () => {
  it.each([
    [10, 0, 'SONO LE DIECI'],
    [10, 4, 'SONO LE DIECI'],
    [10, 5, 'SONO LE DIECI E CINQUE'],
    [10, 10, 'SONO LE DIECI E DIECI'],
    [10, 15, 'SONO LE DIECI E UN QUARTO'],
    [10, 20, 'SONO LE DIECI E VENTI'],
    [10, 25, 'SONO LE DIECI E VENTICINQUE'],
    [10, 30, 'SONO LE DIECI E MEZZA'],
    [10, 35, 'SONO LE UNDICI MENO VENTICINQUE'],
    [10, 40, 'SONO LE UNDICI MENO VENTI'],
    [10, 45, 'SONO LE UNDICI MENO UN QUARTO'],
    [10, 50, 'SONO LE UNDICI MENO DIECI'],
    [10, 55, 'SONO LE UNDICI MENO CINQUE'],
    [0, 0, 'SONO LE DODICI'],
    [13, 0, 'È LUNA'],
    [13, 30, 'È LUNA E MEZZA'],
    [12, 45, 'È LUNA MENO UN QUARTO'],
    [12, 30, 'SONO LE DODICI E MEZZA'],
  ])('%i:%i → "%s"', (hours, minutes, expected) => {
    expect(spell(hours, minutes)).toBe(expected);
  });
});
