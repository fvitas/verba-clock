import { describe, expect, it } from 'vitest';
import { finnish } from './fi';

// Words spell in fragments exactly as the face lights them (VII SI = VIISI, KYM MENEN = KYMMENEN)
function spell(hours: number, minutes: number): string {
  return [...finnish.itIs, ...finnish.phrase(hours, minutes)]
    .sort((a, b) => a.row - b.row || a.start - b.start)
    .map((w) => w.text)
    .join(' ');
}

describe('finnish grid integrity', () => {
  it('is an 11x10 matrix', () => {
    expect(finnish.rows).toHaveLength(10);
    for (const row of finnish.rows) expect(row).toHaveLength(11);
  });

  it('every word coordinate spells its text in the grid', () => {
    for (const w of finnish.words) {
      expect(finnish.rows[w.row].slice(w.start, w.end + 1)).toBe(w.text);
    }
  });

  it('every phrase reads strictly top-left to bottom-right', () => {
    for (let hours = 0; hours < 24; hours++) {
      for (let minutes = 0; minutes < 60; minutes += 5) {
        const lit = [...finnish.itIs, ...finnish.phrase(hours, minutes)];
        for (let i = 1; i < lit.length; i++) {
          const prev = lit[i - 1];
          const cur = lit[i];
          expect(cur.row * 100 + cur.start).toBeGreaterThan(prev.row * 100 + prev.end);
        }
      }
    }
  });
});

describe('finnish time phrases (puoli-relative)', () => {
  it.each([
    [7, 0, 'KELLO ON SEITSEM Ä N'],
    [1, 0, 'KELLO ON Y KSI'],
    [2, 0, 'KELLO ON KA KSI'],
    [3, 0, 'KELLO ON KOLME'],
    [4, 0, 'KELLO ON NELJÄ'],
    [5, 0, 'KELLO ON VII SI'],
    [6, 0, 'KELLO ON KUU SI'],
    [8, 0, 'KELLO ON KA H DEKS A N'],
    [9, 0, 'KELLO ON Y H DEKS Ä N'],
    [10, 0, 'KELLO ON KYMMENEN'],
    [11, 0, 'KELLO ON Y KSI TOISTA'],
    [12, 0, 'KELLO ON KA KSI TOISTA'],
    // viisi yli seitsemän
    [7, 5, 'KELLO ON VII SI YLI SEITSEM Ä N'],
    // kymmenen yli seitsemän
    [7, 10, 'KELLO ON KYM MENEN YLI SEITSEM Ä N'],
    // vartin yli seitsemän
    [7, 15, 'KELLO ON VART IN YLI SEITSEM Ä N'],
    // kymmentä vaille puoli kahdeksan
    [7, 20, 'KELLO ON KYM MEN TÄ VAILLE PUOLI KA H DEKS A N'],
    // viittä vaille puoli kahdeksan
    [7, 25, 'KELLO ON VII TTÄ VAILLE PUOLI KA H DEKS A N'],
    // puoli kahdeksan
    [7, 30, 'KELLO ON PUOLI KA H DEKS A N'],
    // viisi yli puoli kahdeksan
    [7, 35, 'KELLO ON VII SI YLI PUOLI KA H DEKS A N'],
    // kymmenen yli puoli kahdeksan
    [7, 40, 'KELLO ON KYM MENEN YLI PUOLI KA H DEKS A N'],
    // varttia vaille kahdeksan
    [7, 45, 'KELLO ON VART TIA VAILLE KA H DEKS A N'],
    // kymmentä vaille kahdeksan
    [7, 50, 'KELLO ON KYM MEN TÄ VAILLE KA H DEKS A N'],
    // viittä vaille kahdeksan
    [7, 55, 'KELLO ON VII TTÄ VAILLE KA H DEKS A N'],
    // rollovers
    [11, 50, 'KELLO ON KYM MEN TÄ VAILLE KA KSI TOISTA'],
    [12, 30, 'KELLO ON PUOLI Y KSI'],
    [0, 10, 'KELLO ON KYM MENEN YLI KA KSI TOISTA'],
    [23, 25, 'KELLO ON VII TTÄ VAILLE PUOLI KA KSI TOISTA'],
    // 24h clock reads the same as its 12h twin
    [19, 45, 'KELLO ON VART TIA VAILLE KA H DEKS A N'],
    [21, 30, 'KELLO ON PUOLI KYMMENEN'],
  ])('%i:%i', (hours, minutes, expected) => {
    expect(spell(hours, minutes)).toBe(expected);
  });

  it('rounds down to the last five-minute step', () => {
    expect(spell(7, 4)).toBe(spell(7, 0));
    expect(spell(7, 34)).toBe(spell(7, 30));
  });
});
