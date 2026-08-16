import { describe, expect, it } from 'vitest';
import { romanian } from './ro';

function spell(hours: number, minutes: number): string {
  return [...romanian.itIs, ...romanian.phrase(hours, minutes)]
    .sort((a, b) => a.row - b.row || a.start - b.start)
    .map((w) => w.text)
    .join(' ');
}

describe('romanian grid integrity', () => {
  it('is an 11x10 matrix', () => {
    expect(romanian.rows).toHaveLength(10);
    for (const row of romanian.rows) expect(row).toHaveLength(11);
  });

  it('every word coordinate spells its text in the grid', () => {
    for (const w of romanian.words) {
      expect(romanian.rows[w.row].slice(w.start, w.end + 1)).toBe(w.text);
    }
  });
});

describe('romanian time phrases', () => {
  it.each([
    [10, 0, 'ESTE ORA ZECE'],
    [10, 4, 'ESTE ORA ZECE'],
    [10, 5, 'ESTE ORA ZECE ŞI CINCI'],
    [10, 10, 'ESTE ORA ZECE ŞI ZECE'],
    [10, 15, 'ESTE ORA ZECE ŞI UN SFERT'],
    [10, 20, 'ESTE ORA ZECE ŞI DOUĂZECI'],
    [10, 25, 'ESTE ORA ZECE ŞI DOUĂZECI ŞI CINCI'],
    [10, 30, 'ESTE ORA ZECE ŞI TREIZECI'],
    [10, 35, 'ESTE ORA ZECE ŞI TREIZECI ŞI CINCI'],
    [10, 40, 'ESTE ORA UNSPREZECE FĂRĂ DOUĂZECI'],
    [10, 45, 'ESTE ORA UNSPREZECE FĂRĂ UN SFERT'],
    [10, 50, 'ESTE ORA UNSPREZECE FĂRĂ ZECE'],
    [10, 55, 'ESTE ORA UNSPREZECE FĂRĂ CINCI'],
    [0, 0, 'ESTE ORA DOUĂ SPRE ZECE'],
    [13, 0, 'ESTE ORA UNU'],
    [14, 0, 'ESTE ORA DOUĂ'],
    [11, 45, 'ESTE ORA DOUĂ SPRE ZECE FĂRĂ UN SFERT'],
  ])('%i:%i → "%s"', (hours, minutes, expected) => {
    expect(spell(hours, minutes)).toBe(expected);
  });
});
