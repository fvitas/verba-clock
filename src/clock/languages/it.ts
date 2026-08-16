// Matrix sources: https://github.com/vulture20/QLOCKGENERATOR/blob/master/src/app/configs/languages.ts
// and https://github.com/ukw100/wordclock24h/blob/master/make-tables/tables12h-it.c (identical fillers)
// Phrase logic cross-checked with https://github.com/bracci/Qlockthree/blob/master/Renderer.cpp
import { word, type LanguageDef, type WordCoord } from '../types';

const SONO = word('SONO', 0, 0);
const LE = word('LE', 0, 5);
const ORE = word('ORE', 0, 8);
const E_COPULA = word('È', 1, 0);
const LUNA = word('LUNA', 1, 2);
const DUE = word('DUE', 1, 7);
const TRE = word('TRE', 2, 0);
const OTTO = word('OTTO', 2, 3);
const NOVE = word('NOVE', 2, 7);
const DIECI_HOUR = word('DIECI', 3, 0);
const UNDICI = word('UNDICI', 3, 5);
const DODICI = word('DODICI', 4, 0);
const SETTE = word('SETTE', 4, 6);
const QUATTRO = word('QUATTRO', 5, 0);
const SEI = word('SEI', 5, 8);
const CINQUE_HOUR = word('CINQUE', 6, 0);
const MENO = word('MENO', 6, 7);
const E_AND = word('E', 7, 0);
const UN = word('UN', 7, 2);
const QUARTO = word('QUARTO', 7, 5);
const VENTI = word('VENTI', 8, 0);
const VENTICINQUE = word('VENTICINQUE', 8, 0);
const CINQUE_MIN = word('CINQUE', 8, 5);
const DIECI_MIN = word('DIECI', 9, 0);
const MEZZA = word('MEZZA', 9, 6);

const HOURS = [DODICI, LUNA, DUE, TRE, QUATTRO, CINQUE_HOUR, SEI, SETTE, OTTO, NOVE, DIECI_HOUR, UNDICI];

const displayHour = (hours: number, m: number): number => (m >= 35 ? hours + 1 : hours) % 12;

const MINUTE_WORDS: Record<number, WordCoord[]> = {
  0: [],
  5: [E_AND, CINQUE_MIN],
  10: [E_AND, DIECI_MIN],
  15: [E_AND, UN, QUARTO],
  20: [E_AND, VENTI],
  25: [E_AND, VENTICINQUE],
  30: [E_AND, MEZZA],
  35: [MENO, VENTICINQUE],
  40: [MENO, VENTI],
  45: [MENO, UN, QUARTO],
  50: [MENO, DIECI_MIN],
  55: [MENO, CINQUE_MIN],
};

function itIsFor(hours: number, minutes: number): WordCoord[] {
  const m = Math.floor(minutes / 5) * 5;
  return displayHour(hours, m) === 1 ? [E_COPULA] : [SONO, LE];
}

function phrase(hours: number, minutes: number): WordCoord[] {
  const m = Math.floor(minutes / 5) * 5;
  return [HOURS[displayHour(hours, m)], ...MINUTE_WORDS[m]];
}

export const italian: LanguageDef = {
  id: 'it',
  name: 'Italiano',
  sample: 'SONO LE',
  rows: [
    'SONORLEBORE',
    'ÈRLUNASDUEZ',
    'TREOTTONOVE',
    'DIECIUNDICI',
    'DODICISETTE',
    'QUATTROCSEI',
    'CINQUEAMENO',
    'EKUNLQUARTO',
    'VENTICINQUE',
    'DIECILMEZZA',
  ],
  itIs: [SONO, LE],
  itIsFor,
  cellOverrides: { '1:2': "L'" },
  words: [SONO, LE, ORE, E_COPULA, LUNA, DUE, TRE, OTTO, NOVE, DIECI_HOUR, UNDICI, DODICI, SETTE, QUATTRO, SEI, CINQUE_HOUR, MENO, E_AND, UN, QUARTO, VENTI, VENTICINQUE, CINQUE_MIN, DIECI_MIN, MEZZA],
  phrase,
};
