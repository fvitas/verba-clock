// Matrix source: https://github.com/vulture20/QLOCKGENERATOR/blob/master/src/app/configs/languages.ts
// Cross-checked with: https://github.com/bramp/wordclock/blob/master/lib/languages/natural/danish.dart (reference grid + logic)
import { word, type LanguageDef, type WordCoord } from '../types';

const KLOKKEN = word('KLOKKEN', 0, 0);
const ER = word('ER', 0, 8);
const FEM_MIN = word('FEM', 1, 0);
const TYVE = word('TYVE', 1, 3);
const KVART = word('KVART', 2, 3);
const TI_MIN = word('TI', 3, 0);
const MINUTTER = word('MINUTTER', 3, 3);
const OVER = word('OVER', 4, 3);
const I = word('I', 4, 7);
const HALV = word('HALV', 5, 7);
const ET = word('ET', 6, 0);
const TO = word('TO', 6, 2);
const TRE = word('TRE', 6, 4);
const FIRE = word('FIRE', 6, 7);
const FEM_HOUR = word('FEM', 7, 0);
const SEKS = word('SEKS', 7, 3);
const SYV = word('SYV', 7, 8);
const OTTE = word('OTTE', 8, 0);
const NI = word('NI', 8, 5);
const TI_HOUR = word('TI', 8, 9);
const ELLEVE = word('ELLEVE', 9, 0);
const TOLV = word('TOLV', 9, 7);

const HOURS = [TOLV, ET, TO, TRE, FIRE, FEM_HOUR, SEKS, SYV, OTTE, NI, TI_HOUR, ELLEVE];

// Danish shows the NEXT hour from :25 (fem minutter i halv elleve)
const MINUTE_WORDS: Record<number, WordCoord[]> = {
  0: [],
  5: [FEM_MIN, MINUTTER, OVER],
  10: [TI_MIN, MINUTTER, OVER],
  15: [KVART, OVER],
  20: [TYVE, MINUTTER, OVER],
  25: [FEM_MIN, MINUTTER, I, HALV],
  30: [HALV],
  35: [FEM_MIN, MINUTTER, OVER, HALV],
  40: [TYVE, MINUTTER, I],
  45: [KVART, I],
  50: [TI_MIN, MINUTTER, I],
  55: [FEM_MIN, MINUTTER, I],
};

function phrase(hours: number, minutes: number): WordCoord[] {
  const m = Math.floor(minutes / 5) * 5;
  const hour = HOURS[(m >= 25 ? hours + 1 : hours) % 12];
  return [...MINUTE_WORDS[m], hour];
}

export const danish: LanguageDef = {
  id: 'dk',
  name: 'Dansk',
  sample: 'KLOKKEN ER',
  rows: [
    'KLOKKENVERO',
    'FEMTYVESKAM',
    'OJEKVARTVAT',
    'TIAMINUTTER',
    'VEMOVERILPM',
    'MONALISHALV',
    'ETTOTREFIRE',
    'FEMSEKSRSYV',
    'OTTERNIMETI',
    'ELLEVEATOLV',
  ],
  itIs: [KLOKKEN, ER],
  words: [KLOKKEN, ER, FEM_MIN, TYVE, KVART, TI_MIN, MINUTTER, OVER, I, HALV, ET, TO, TRE, FIRE, FEM_HOUR, SEKS, SYV, OTTE, NI, TI_HOUR, ELLEVE, TOLV],
  phrase,
};
