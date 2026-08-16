import { describe, expect, it } from 'vitest';
import { greek } from './gr';

function spell(hours: number, minutes: number): string {
  return [...greek.itIs, ...greek.phrase(hours, minutes)]
    .sort((a, b) => a.row - b.row || a.start - b.start)
    .map((w) => w.text)
    .join(' ');
}

describe('greek grid integrity', () => {
  it('is an 11x10 matrix', () => {
    expect(greek.rows).toHaveLength(10);
    for (const row of greek.rows) expect(row).toHaveLength(11);
  });

  it('every word coordinate spells its text in the grid', () => {
    for (const w of greek.words) {
      expect(greek.rows[w.row].slice(w.start, w.end + 1)).toBe(w.text);
    }
  });

  it('uses only Greek codepoints (no Latin lookalikes)', () => {
    for (const row of greek.rows) {
      expect(/^[Ά-ώ]+$/.test(row)).toBe(true);
    }
  });
});

describe('greek time phrases', () => {
  it.each([
    [10, 0, 'Η ΩΡΑ ΕΙΝΑΙ ΔΕΚΑ'],
    [10, 4, 'Η ΩΡΑ ΕΙΝΑΙ ΔΕΚΑ'],
    [10, 5, 'Η ΩΡΑ ΕΙΝΑΙ ΔΕΚΑ ΚΑΙ ΠΕΝΤΕ'],
    [10, 10, 'Η ΩΡΑ ΕΙΝΑΙ ΔΕΚΑ ΚΑΙ ΔΕΚΑ'],
    [10, 15, 'Η ΩΡΑ ΕΙΝΑΙ ΔΕΚΑ ΚΑΙ ΤΕΤΑΡΤΟ'],
    [10, 20, 'Η ΩΡΑ ΕΙΝΑΙ ΔΕΚΑ ΚΑΙ ΕΙΚΟΣΙ'],
    [10, 25, 'Η ΩΡΑ ΕΙΝΑΙ ΔΕΚΑ ΚΑΙ ΕΙΚΟΣΙ ΠΕΝΤΕ'],
    [10, 30, 'Η ΩΡΑ ΕΙΝΑΙ ΔΕΚΑ ΚΑΙ ΜΙΣΗ'],
    [10, 35, 'Η ΩΡΑ ΕΙΝΑΙ ΕΝΤΕΚΑ ΠΑΡΑ ΕΙΚΟΣΙ ΠΕΝΤΕ'],
    [10, 40, 'Η ΩΡΑ ΕΙΝΑΙ ΕΝΤΕΚΑ ΠΑΡΑ ΕΙΚΟΣΙ'],
    [10, 45, 'Η ΩΡΑ ΕΙΝΑΙ ΕΝΤΕΚΑ ΠΑΡΑ ΤΕΤΑΡΤΟ'],
    [10, 50, 'Η ΩΡΑ ΕΙΝΑΙ ΕΝΤΕΚΑ ΠΑΡΑ ΔΕΚΑ'],
    [10, 55, 'Η ΩΡΑ ΕΙΝΑΙ ΕΝΤΕΚΑ ΠΑΡΑ ΠΕΝΤΕ'],
    [0, 0, 'Η ΩΡΑ ΕΙΝΑΙ ΔΩΔΕΚΑ'],
    [13, 0, 'Η ΩΡΑ ΕΙΝΑΙ ΜΙΑ'],
    [12, 45, 'Η ΩΡΑ ΕΙΝΑΙ ΜΙΑ ΠΑΡΑ ΤΕΤΑΡΤΟ'],
    [16, 55, 'Η ΩΡΑ ΕΙΝΑΙ ΠΕΝΤΕ ΠΑΡΑ ΠΕΝΤΕ'],
  ])('%i:%i → "%s"', (hours, minutes, expected) => {
    expect(spell(hours, minutes)).toBe(expected);
  });
});
