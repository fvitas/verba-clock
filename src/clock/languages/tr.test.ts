import { describe, expect, it } from 'vitest';
import { turkish } from './tr';

function spell(hours: number, minutes: number): string {
  return [...turkish.itIs, ...turkish.phrase(hours, minutes)]
    .sort((a, b) => a.row - b.row || a.start - b.start)
    .map((w) => w.text)
    .join(' ');
}

describe('turkish grid integrity', () => {
  it('is an 11x10 matrix', () => {
    expect(turkish.rows).toHaveLength(10);
    for (const row of turkish.rows) expect(row).toHaveLength(11);
  });

  it('every word coordinate spells its text in the grid', () => {
    for (const w of turkish.words) {
      expect(turkish.rows[w.row].slice(w.start, w.end + 1)).toBe(w.text);
    }
  });
});

describe('turkish time phrases', () => {
  it.each([
    [10, 0, 'SAAT ON'],
    [10, 4, 'SAAT ON'],
    [10, 5, 'SAAT ONU BEŞ GEÇİYOR'],
    [10, 10, 'SAAT ONU ON GEÇİYOR'],
    [10, 15, 'SAAT ONU ÇEYREK GEÇİYOR'],
    [10, 20, 'SAAT ONU YİRMİ GEÇİYOR'],
    [10, 25, 'SAAT ONU YİRMİ BEŞ GEÇİYOR'],
    [10, 30, 'SAAT ON BUÇUK'],
    [10, 35, 'SAAT ONU OTUZ BEŞ GEÇİYOR'],
    [10, 40, 'SAAT ONU KIRK GEÇİYOR'],
    [10, 45, 'SAAT ONU KIRK BEŞ GEÇİYOR'],
    [10, 50, 'SAAT ONU ELLİ GEÇİYOR'],
    [10, 55, 'SAAT ONU ELLİ BEŞ GEÇİYOR'],
    [0, 0, 'SAAT ON İKİ'],
    [0, 30, 'SAAT ON İKİ BUÇUK'],
    [0, 15, 'SAAT ON İKİYİ ÇEYREK GEÇİYOR'],
    [13, 0, 'SAAT BİR'],
    [13, 30, 'SAAT BİR BUÇUK'],
    [13, 40, 'SAAT BİRİ KIRK GEÇİYOR'],
    [16, 30, 'SAAT DÖRT BUÇUK'],
    [16, 15, 'SAAT DÖRDÜ ÇEYREK GEÇİYOR'],
  ])('%i:%i → "%s"', (hours, minutes, expected) => {
    expect(spell(hours, minutes)).toBe(expected);
  });
});
