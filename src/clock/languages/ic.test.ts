import { describe, expect, it } from 'vitest';
import { icelandic } from './ic';

function spell(hours: number, minutes: number): string {
  return [...icelandic.itIs, ...icelandic.phrase(hours, minutes)].map((w) => w.text).join(' ');
}

describe('icelandic grid integrity', () => {
  it('is an 11x10 matrix', () => {
    expect(icelandic.rows).toHaveLength(10);
    for (const row of icelandic.rows) expect(row).toHaveLength(11);
  });

  it('every word coordinate spells its text in the grid', () => {
    for (const w of icelandic.words) {
      expect(icelandic.rows[w.row].slice(w.start, w.end + 1)).toBe(w.text);
    }
  });

  it('every phrase reads strictly top-left to bottom-right', () => {
    for (let hours = 0; hours < 24; hours++) {
      for (let minutes = 0; minutes < 60; minutes += 5) {
        const lit = [...icelandic.itIs, ...icelandic.phrase(hours, minutes)];
        for (let i = 1; i < lit.length; i++) {
          const prev = lit[i - 1];
          const cur = lit[i];
          expect(cur.row * 100 + cur.start).toBeGreaterThan(prev.row * 100 + prev.end);
        }
      }
    }
  });
});

describe('icelandic hours (:00, neuter numerals)', () => {
  it.each([
    [1, 'KLUKKAN ER EITT'],
    [2, 'KLUKKAN ER TVÖ'],
    [3, 'KLUKKAN ER ÞRJÚ'],
    [4, 'KLUKKAN ER FJÖGUR'],
    [5, 'KLUKKAN ER FIMM'],
    [6, 'KLUKKAN ER SEX'],
    [7, 'KLUKKAN ER SJÖ'],
    [8, 'KLUKKAN ER ÁTTA'],
    [9, 'KLUKKAN ER NÍU'],
    [10, 'KLUKKAN ER TÍU'],
    [11, 'KLUKKAN ER ELLEFU'],
    [12, 'KLUKKAN ER TÓLF'],
  ])('%i:00', (hours, expected) => {
    expect(spell(hours, 0)).toBe(expected);
  });
});

describe('icelandic time phrases', () => {
  it.each([
    [7, 5, 'KLUKKAN ER FIMM MÍNÚTUR YFIR SJÖ'],
    [7, 10, 'KLUKKAN ER TÍU MÍNÚTUR YFIR SJÖ'],
    // KORTER drops MÍNÚTUR
    [7, 15, 'KLUKKAN ER KORTER YFIR SJÖ'],
    [7, 20, 'KLUKKAN ER TUTTUGU MÍNÚTUR YFIR SJÖ'],
    // from :25 the next hour is named — fimm mínútur í hálf átta
    [7, 25, 'KLUKKAN ER FIMM MÍNÚTUR Í HÁLF ÁTTA'],
    [7, 30, 'KLUKKAN ER HÁLF ÁTTA'],
    [7, 35, 'KLUKKAN ER FIMM MÍNÚTUR YFIR HÁLF ÁTTA'],
    [7, 40, 'KLUKKAN ER TUTTUGU MÍNÚTUR Í ÁTTA'],
    [7, 45, 'KLUKKAN ER KORTER Í ÁTTA'],
    [7, 50, 'KLUKKAN ER TÍU MÍNÚTUR Í ÁTTA'],
    [7, 55, 'KLUKKAN ER FIMM MÍNÚTUR Í ÁTTA'],
    // rollovers
    [12, 30, 'KLUKKAN ER HÁLF EITT'],
    [1, 30, 'KLUKKAN ER HÁLF TVÖ'],
    [11, 45, 'KLUKKAN ER KORTER Í TÓLF'],
    [23, 55, 'KLUKKAN ER FIMM MÍNÚTUR Í TÓLF'],
    [0, 25, 'KLUKKAN ER FIMM MÍNÚTUR Í HÁLF EITT'],
    [15, 20, 'KLUKKAN ER TUTTUGU MÍNÚTUR YFIR ÞRJÚ'],
  ])('%i:%i', (hours, minutes, expected) => {
    expect(spell(hours, minutes)).toBe(expected);
  });

  it('rounds down to the last five-minute step', () => {
    expect(spell(7, 4)).toBe(spell(7, 0));
    expect(spell(7, 34)).toBe(spell(7, 30));
  });

  it('uses distinct FIMM and TÍU cells for minutes and hours', () => {
    expect(icelandic.phrase(5, 5)[0]).not.toEqual(icelandic.phrase(5, 0)[0]);
    expect(icelandic.phrase(10, 10)[0]).not.toEqual(icelandic.phrase(10, 0)[0]);
  });
});
