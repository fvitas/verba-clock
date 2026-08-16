import { describe, expect, it } from 'vitest';
import { cellKey, resolveTime } from './engine';
import { word, type LanguageDef } from './types';

const AB = word('AB', 0, 0);
const DE = word('DE', 1, 0);
const F = word('F', 1, 2);

const fake: LanguageDef = {
  id: 'fake',
  name: 'Fake',
  sample: 'AB',
  rows: ['ABC', 'DEF'],
  itIs: [AB],
  words: [AB, DE, F],
  phrase: (_hours, minutes) => (minutes < 30 ? [DE] : [F]),
};

describe('resolveTime', () => {
  it('lights it-is words plus phrase words', () => {
    const { lit } = resolveTime(10, 0, fake, true);
    expect(lit).toEqual(new Set(['0:0', '0:1', '1:0', '1:1']));
  });

  it('omits it-is words when disabled', () => {
    const { lit } = resolveTime(10, 0, fake, false);
    expect(lit).toEqual(new Set(['1:0', '1:1']));
  });

  it('sets corner dots to minutes modulo five', () => {
    expect(resolveTime(10, 0, fake, true).dots).toBe(0);
    expect(resolveTime(10, 17, fake, true).dots).toBe(2);
    expect(resolveTime(10, 59, fake, true).dots).toBe(4);
  });
});

describe('cellKey', () => {
  it('formats row and column', () => {
    expect(cellKey(3, 10)).toBe('3:10');
  });
});
