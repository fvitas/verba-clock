import { describe, expect, it } from 'vitest';
import { french } from './fr';

function spell(hours: number, minutes: number): string {
  return [...french.itIs, ...french.phrase(hours, minutes)]
    .sort((a, b) => a.row - b.row || a.start - b.start)
    .map((w) => w.text)
    .join(' ');
}

describe('french grid integrity', () => {
  it('is an 11x10 matrix', () => {
    expect(french.rows).toHaveLength(10);
    for (const row of french.rows) expect(row).toHaveLength(11);
  });

  it('every word coordinate spells its text in the grid', () => {
    for (const w of french.words) {
      expect(french.rows[w.row].slice(w.start, w.end + 1)).toBe(w.text);
    }
  });
});

describe('french time phrases', () => {
  it.each([
    [10, 0, 'IL EST DIX HEURES'],
    [10, 4, 'IL EST DIX HEURES'],
    [10, 5, 'IL EST DIX HEURES CINQ'],
    [10, 10, 'IL EST DIX HEURES DIX'],
    [10, 15, 'IL EST DIX HEURES ET QUART'],
    [10, 20, 'IL EST DIX HEURES VINGT'],
    [10, 25, 'IL EST DIX HEURES VINGT-CINQ'],
    [10, 30, 'IL EST DIX HEURES ET DEMIE'],
    [10, 35, 'IL EST ONZE HEURES MOINS VINGT-CINQ'],
    [10, 40, 'IL EST ONZE HEURES MOINS VINGT'],
    [10, 45, 'IL EST ONZE HEURES MOINS LE QUART'],
    [10, 50, 'IL EST ONZE HEURES MOINS DIX'],
    [10, 55, 'IL EST ONZE HEURES MOINS CINQ'],
    [0, 0, 'IL EST MINUIT'],
    [12, 0, 'IL EST MIDI'],
    [13, 0, 'IL EST UNE HEURE'],
    [13, 15, 'IL EST UNE HEURE ET QUART'],
    [11, 35, 'IL EST MIDI MOINS VINGT-CINQ'],
    [23, 45, 'IL EST MINUIT MOINS LE QUART'],
    [12, 30, 'IL EST MIDI ET DEMIE'],
  ])('%i:%i → "%s"', (hours, minutes, expected) => {
    expect(spell(hours, minutes)).toBe(expected);
  });
});
