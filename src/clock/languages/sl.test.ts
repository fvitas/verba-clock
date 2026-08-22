import { describe, expect, it } from 'vitest';
import { slovenian } from './sl';

// Words spell in fragments exactly as the face lights them: SEDMIH = SED + M + IH, TREH = TR + E + H
function spell(hours: number, minutes: number): string {
  return [...slovenian.itIs, ...slovenian.phrase(hours, minutes)].map((w) => w.text).join(' ');
}

describe('slovenian grid integrity', () => {
  it('is an 11x10 matrix', () => {
    expect(slovenian.rows).toHaveLength(10);
    for (const row of slovenian.rows) expect(row).toHaveLength(11);
  });

  it('every word coordinate spells its text in the grid', () => {
    for (const w of slovenian.words) {
      expect(slovenian.rows[w.row].slice(w.start, w.end + 1)).toBe(w.text);
    }
  });

  it('every phrase reads strictly top-left to bottom-right', () => {
    for (let hours = 0; hours < 24; hours++) {
      for (let minutes = 0; minutes < 60; minutes += 5) {
        const lit = [...slovenian.itIs, ...slovenian.phrase(hours, minutes)];
        for (let i = 1; i < lit.length; i++) {
          const prev = lit[i - 1];
          const cur = lit[i];
          expect(cur.row * 100 + cur.start).toBeGreaterThan(prev.row * 100 + prev.end);
        }
      }
    }
  });

  it('spells every genitive ending from the three cells on the last row', () => {
    for (const text of ['E', 'IH', 'H']) {
      const cells = slovenian.words.filter((w) => w.text === text && w.row === 9);
      expect(cells).toHaveLength(1);
    }
    expect(slovenian.rows[9].slice(8)).toBe('EIH');
  });

  it('gives PET and DESET a minute cell before ČEZ and an hour cell after DO', () => {
    const key = (w: { row: number; start: number }) => w.row * 100 + w.start;
    const chez = slovenian.words.find((w) => w.text === 'ČEZ')!;
    const to = slovenian.words.find((w) => w.text === 'DO')!;
    for (const text of ['PET', 'DESET']) {
      const cells = slovenian.words.filter((w) => w.text === text);
      expect(cells).toHaveLength(2);
      expect(key(cells[0])).toBeLessThan(key(chez));
      expect(key(cells[1])).toBeGreaterThan(to.row * 100 + to.end);
    }
  });
});

describe('slovenian hours (:00, nominative)', () => {
  it.each([
    [1, 'URA JE ENA'],
    [2, 'URA JE D VE'],
    [3, 'URA JE TRI'],
    [4, 'URA JE ŠTIRI'],
    [5, 'URA JE PET'],
    [6, 'URA JE ŠEST'],
    [7, 'URA JE SEDEM'],
    [8, 'URA JE OSEM'],
    [9, 'URA JE DEVET'],
    [10, 'URA JE DESET'],
    [11, 'URA JE ENAJST'],
    [12, 'URA JE DVANAJST'],
  ])('%i:00', (hours, expected) => {
    expect(spell(hours, 0)).toBe(expected);
  });

  it('reads the same on the 24h side of the clock', () => {
    expect(spell(19, 0)).toBe('URA JE SEDEM');
    expect(spell(0, 0)).toBe('URA JE DVANAJST');
  });
});

describe('slovenian genitive hours (pol)', () => {
  it.each([
    [0, 'URA JE POL EN IH'],
    [1, 'URA JE POL D VE H'],
    [2, 'URA JE POL TR E H'],
    [3, 'URA JE POL ŠTIRI H'],
    [4, 'URA JE POL PET IH'],
    [5, 'URA JE POL ŠEST IH'],
    [6, 'URA JE POL SED M IH'],
    [7, 'URA JE POL OS M IH'],
    [8, 'URA JE POL DEVET IH'],
    [9, 'URA JE POL DESET IH'],
    [10, 'URA JE POL ENAJST IH'],
    [11, 'URA JE POL DVANAJST IH'],
  ])('%i:30 names the next hour in the genitive', (hours, expected) => {
    expect(spell(hours, 30)).toBe(expected);
  });
});

describe('slovenian phrases', () => {
  it.each([
    [7, 0, 'URA JE SEDEM'],
    [7, 5, 'URA JE PET ČEZ SEDEM'],
    [7, 10, 'URA JE DESET ČEZ SEDEM'],
    [7, 15, 'URA JE PETNAJST ČEZ SEDEM'],
    [7, 20, 'URA JE DVAJSET ČEZ SEDEM'],
    [7, 25, 'URA JE PET IN DVAJSET ČEZ SEDEM'],
    [7, 30, 'URA JE POL OS M IH'],
    [7, 35, 'URA JE PET IN DVAJSET DO OS M IH'],
    [7, 40, 'URA JE DVAJSET DO OS M IH'],
    [7, 45, 'URA JE PETNAJST DO OS M IH'],
    [7, 50, 'URA JE DESET DO OS M IH'],
    [7, 55, 'URA JE PET DO OS M IH'],
  ])('%i:%i', (hours, minutes, expected) => {
    expect(spell(hours, minutes)).toBe(expected);
  });

  it('uses the accusative ENO after ČEZ but the nominative ENA on the hour', () => {
    expect(spell(1, 0)).toBe('URA JE ENA');
    expect(spell(1, 5)).toBe('URA JE PET ČEZ EN O');
    expect(spell(1, 25)).toBe('URA JE PET IN DVAJSET ČEZ EN O');
    expect(spell(12, 30)).toBe('URA JE POL EN IH');
    expect(spell(12, 55)).toBe('URA JE PET DO EN IH');
  });

  it('rolls the hour over from the half hour onwards', () => {
    expect(spell(11, 25)).toBe('URA JE PET IN DVAJSET ČEZ ENAJST');
    expect(spell(11, 30)).toBe('URA JE POL DVANAJST IH');
    expect(spell(23, 45)).toBe('URA JE PETNAJST DO DVANAJST IH');
  });

  it('rounds down to the five-minute step', () => {
    for (let minutes = 15; minutes < 20; minutes++) {
      expect(spell(3, minutes)).toBe('URA JE PETNAJST ČEZ TRI');
    }
  });
});
