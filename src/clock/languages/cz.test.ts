import { describe, expect, it } from 'vitest';
import { czech } from './cz';

function spell(hours: number, minutes: number): string {
  return [...(czech.itIsFor?.(hours, minutes) ?? []), ...czech.phrase(hours, minutes)]
    .sort((a, b) => a.row - b.row || a.start - b.start)
    .map((w) => w.text)
    .join(' ');
}

describe('czech grid integrity', () => {
  it('is an 11x10 matrix', () => {
    expect(czech.rows).toHaveLength(10);
    for (const row of czech.rows) expect(row).toHaveLength(11);
  });

  it('every word coordinate spells its text in the grid', () => {
    for (const w of czech.words) {
      expect(czech.rows[w.row].slice(w.start, w.end + 1)).toBe(w.text);
    }
  });
});

describe('czech time phrases (digital style)', () => {
  it.each([
    [10, 0, 'JE DESET'],
    [10, 4, 'JE DESET'],
    [10, 5, 'JE DESET NULA PĚT'],
    [10, 10, 'JE DESET DESET'],
    [10, 15, 'JE DESET PATNÁCT'],
    [10, 20, 'JE DESET DVACET'],
    [10, 25, 'JE DESET DVACET PĚT'],
    [10, 30, 'JE DESET TŘICET'],
    [10, 35, 'JE DESET TŘICET PĚT'],
    [10, 40, 'JE DESET ČTYŘICET'],
    [10, 45, 'JE DESET ČTYŘICET PĚT'],
    [10, 50, 'JE DESET PADESÁT'],
    [10, 55, 'JE DESET PADESÁT PĚT'],
    [0, 0, 'JE DVANÁCT'],
    [13, 0, 'JE JEDNA'],
    [14, 0, 'JSOU DVĚ'],
    [15, 30, 'JSOU TŘI TŘICET'],
    [16, 0, 'JSOU ČTYŘI'],
    [17, 0, 'JE PĚT'],
  ])('%i:%i → "%s"', (hours, minutes, expected) => {
    expect(spell(hours, minutes)).toBe(expected);
  });
});
