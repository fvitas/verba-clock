// Matrix source: https://github.com/vulture20/QLOCKGENERATOR/blob/master/src/app/configs/languages.ts
// Cross-checked with: https://github.com/bramp/wordclock/blob/master/lib/languages/natural/norwegian.dart (reference grid + logic)
// Both sources carry a data-entry quirk (lowercase l for I in TI/FIRE); normalized to I here
import { word, type LanguageDef, type WordCoord } from '../types';

const KLOKKEN = word('KLOKKEN', 0, 0);
const ER = word('ER', 0, 8);
const FEM_MIN = word('FEM', 1, 0);
const PAA_FEM = word('PÅ', 1, 4);
const TI_MIN = word('TI', 2, 0);
const PAA_TI = word('PÅ', 2, 3);
const KVART = word('KVART', 3, 0);
const PAA_KVART = word('PÅ', 3, 6);
const OVER = word('OVER', 4, 0);
const HALV = word('HALV', 5, 0);
const ETT = word('ETT', 6, 0);
const TO = word('TO', 6, 4);
const TRE = word('TRE', 6, 7);
const FIRE = word('FIRE', 7, 0);
const FEM_HOUR = word('FEM', 7, 4);
const SEKS = word('SEKS', 7, 7);
const SYV = word('SYV', 8, 0);
const AATTE = word('ÅTTE', 8, 3);
const NI = word('NI', 8, 7);
const TI_HOUR = word('TI', 8, 9);
const ELLEVE = word('ELLEVE', 9, 0);
const TOLV = word('TOLV', 9, 7);

const HOURS = [TOLV, ETT, TO, TRE, FIRE, FEM_HOUR, SEKS, SYV, AATTE, NI, TI_HOUR, ELLEVE];

// Norwegian shows the NEXT hour from :20 (ti på halv elleve)
const MINUTE_WORDS: Record<number, WordCoord[]> = {
  0: [],
  5: [FEM_MIN, OVER],
  10: [TI_MIN, OVER],
  15: [KVART, OVER],
  20: [TI_MIN, PAA_TI, HALV],
  25: [FEM_MIN, PAA_FEM, HALV],
  30: [HALV],
  35: [FEM_MIN, OVER, HALV],
  40: [TI_MIN, OVER, HALV],
  45: [KVART, PAA_KVART],
  50: [TI_MIN, PAA_TI],
  55: [FEM_MIN, PAA_FEM],
};

function phrase(hours: number, minutes: number): WordCoord[] {
  const m = Math.floor(minutes / 5) * 5;
  const hour = HOURS[(m >= 20 ? hours + 1 : hours) % 12];
  return [...MINUTE_WORDS[m], hour];
}

export const norwegian: LanguageDef = {
  id: 'no',
  name: 'Norsk',
  sample: 'KLOKKEN ER',
  rows: [
    'KLOKKENVERM',
    'FEMHPÅSUFIS',
    'TILPÅSIDOSN',
    'KVARTNPÅSTO',
    'OVERXAMBPMZ',
    'HALVBIEGENZ',
    'ETTNTOATREX',
    'FIREFEMSEKS',
    'SYVÅTTENITI',
    'ELLEVESTOLV',
  ],
  itIs: [KLOKKEN, ER],
  words: [KLOKKEN, ER, FEM_MIN, PAA_FEM, TI_MIN, PAA_TI, KVART, PAA_KVART, OVER, HALV, ETT, TO, TRE, FIRE, FEM_HOUR, SEKS, SYV, AATTE, NI, TI_HOUR, ELLEVE, TOLV],
  phrase,
};
