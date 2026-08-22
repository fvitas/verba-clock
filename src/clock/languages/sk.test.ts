import { describe, expect, it } from 'vitest';
import { slovak } from './sk';

// Words spell in fragments exactly as the face lights them (DVA D SAŤ = DVADSAŤ)
function spell(hours: number, minutes: number): string {
  const itIs = slovak.itIsFor?.(hours, minutes) ?? slovak.itIs;
  return [...itIs, ...slovak.phrase(hours, minutes)]
    .sort((a, b) => a.row - b.row || a.start - b.start)
    .map((w) => w.text)
    .join(' ');
}

describe('slovak grid integrity', () => {
  it('is an 11x10 matrix', () => {
    expect(slovak.rows).toHaveLength(10);
    for (const row of slovak.rows) expect(row).toHaveLength(11);
  });

  it('every word coordinate spells its text in the grid', () => {
    for (const w of slovak.words) {
      expect(slovak.rows[w.row].slice(w.start, w.end + 1)).toBe(w.text);
    }
  });

  it('every phrase reads strictly top-left to bottom-right', () => {
    for (let hours = 0; hours < 24; hours++) {
      for (let minutes = 0; minutes < 60; minutes += 5) {
        const itIs = slovak.itIsFor?.(hours, minutes) ?? slovak.itIs;
        const lit = [...itIs, ...slovak.phrase(hours, minutes)];
        for (let i = 1; i < lit.length; i++) {
          const prev = lit[i - 1];
          const cur = lit[i];
          expect(cur.row * 100 + cur.start).toBeGreaterThan(prev.row * 100 + prev.end);
        }
      }
    }
  });
});

describe('slovak copula agreement', () => {
  it.each([
    [1, 'JE JEDNA'],
    [2, 'SÚ DVE'],
    [3, 'SÚ TRI'],
    [4, 'SÚ ŠTYRI'],
    [5, 'JE PÄŤ'],
    [6, 'JE ŠESŤ'],
    [7, 'JE SEDEM'],
    [8, 'JE OSEM'],
    [9, 'JE DEVÄŤ'],
    [10, 'JE DESAŤ'],
    [11, 'JE JEDE NÁSŤ'],
    [12, 'JE DVA NÁSŤ'],
  ])('%i:00', (hours, expected) => {
    expect(spell(hours, 0)).toBe(expected);
  });
});

describe('slovak time phrases (digital readout, hour never rolls over)', () => {
  it.each([
    [7, 5, 'JE SEDEM NULA PÄŤ'],
    [7, 10, 'JE SEDEM DESAŤ'],
    [7, 15, 'JE SEDEM PÄTNÁSŤ'],
    [7, 20, 'JE SEDEM DVA D SAŤ'],
    [7, 25, 'JE SEDEM DVA D SAŤ PÄŤ'],
    [7, 30, 'JE SEDEM TRI D SAŤ'],
    [7, 35, 'JE SEDEM TRI D SAŤ PÄŤ'],
    [7, 40, 'JE SEDEM ŠTYRI D SAŤ'],
    [7, 45, 'JE SEDEM ŠTYRI D SAŤ PÄŤ'],
    [7, 50, 'JE SEDEM PÄŤDESIAT'],
    [7, 55, 'JE SEDEM PÄŤDESIAT PÄŤ'],
    // 24h clock reads as its 12h twin, and the copula follows the hour word
    [14, 30, 'SÚ DVE TRI D SAŤ'],
    [16, 40, 'SÚ ŠTYRI ŠTYRI D SAŤ'],
    [23, 45, 'JE JEDE NÁSŤ ŠTYRI D SAŤ PÄŤ'],
    [0, 5, 'JE DVA NÁSŤ NULA PÄŤ'],
    [22, 15, 'JE DESAŤ PÄTNÁSŤ'],
  ])('%i:%i', (hours, minutes, expected) => {
    expect(spell(hours, minutes)).toBe(expected);
  });

  it('rounds down to the last five-minute step', () => {
    expect(spell(7, 4)).toBe('JE SEDEM');
    expect(spell(7, 34)).toBe(spell(7, 30));
  });
});
