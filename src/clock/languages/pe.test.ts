import { describe, expect, it } from 'vitest';
import { portuguese } from './pe';

function spell(hours: number, minutes: number): string {
  return [...(portuguese.itIsFor?.(hours, minutes) ?? []), ...portuguese.phrase(hours, minutes)]
    .sort((a, b) => a.row - b.row || a.start - b.start)
    .map((w) => w.text)
    .join(' ');
}

describe('portuguese grid integrity', () => {
  it('is an 11x10 matrix', () => {
    expect(portuguese.rows).toHaveLength(10);
    for (const row of portuguese.rows) expect(row).toHaveLength(11);
  });

  it('every word coordinate spells its text in the grid', () => {
    for (const w of portuguese.words) {
      expect(portuguese.rows[w.row].slice(w.start, w.end + 1)).toBe(w.text);
    }
  });
});

describe('portuguese time phrases', () => {
  it.each([
    [10, 0, 'SÃO DEZ HORAS'],
    [10, 4, 'SÃO DEZ HORAS'],
    [10, 5, 'SÃO DEZ E CINCO'],
    [10, 10, 'SÃO DEZ E DEZ'],
    [10, 15, 'SÃO DEZ E UM QUARTO'],
    [10, 20, 'SÃO DEZ E VINTE'],
    [10, 25, 'SÃO DEZ E VINTE E CINCO'],
    [10, 30, 'SÃO DEZ E MEIA'],
    [10, 35, 'SÃO ONZE MENOS VINTE E CINCO'],
    [10, 40, 'SÃO ONZE MENOS VINTE'],
    [10, 45, 'SÃO ONZE MENOS UM QUARTO'],
    [10, 50, 'SÃO ONZE MENOS DEZ'],
    [10, 55, 'SÃO ONZE MENOS CINCO'],
    [13, 0, 'É UMA HORA'],
    [0, 0, 'É MEIA NOITE'],
    [12, 0, 'É MEIO DIA'],
    [12, 30, 'É MEIA HORA'],
    [11, 35, 'É MEIO DIA MENOS VINTE E CINCO'],
    [23, 45, 'É MEIA NOITE MENOS UM QUARTO'],
  ])('%i:%i → "%s"', (hours, minutes, expected) => {
    expect(spell(hours, minutes)).toBe(expected);
  });
});
