// Custom Verba matrix (no QLOCKTWO Slovak exists — checked against the QLOCKGENERATOR
// language list), built as the digital-readout sibling of the official Czech face
// ("je sedem tridsať"). The traditional quarter system Slovak prefers ("je pol ôsmej",
// "je štvrť na sedem", "je trištvrte na desať") needs both cardinal-accusative and
// ordinal-genitive hour sets — ~119 cells for the hours alone, so it cannot fit 110 (D27).
// Copula agrees: SÚ for 2/3/4, JE otherwise. :05 reads "nula päť" like the Czech face.
// Fragments (D28): JEDE/DVA share NÁSŤ; DVA/TRI/ŠTYRI share the -dsať suffix by
// skip-lighting DESAŤ (D·SAŤ), the same trick as the official Russian face's ДЕ·ВЯТЬ.
import { word, type LanguageDef, type WordCoord } from '../types';

const JE = word('JE', 0, 0);
const SU = word('SÚ', 0, 3);
const JEDNA = word('JEDNA', 0, 6);
const DVE = word('DVE', 1, 0);
const TRI_HOUR = word('TRI', 1, 4);
const PAT_HOUR = word('PÄŤ', 1, 8);
const STYRI_HOUR = word('ŠTYRI', 2, 0);
const SEST = word('ŠESŤ', 2, 6);
const SEDEM = word('SEDEM', 3, 0);
const OSEM = word('OSEM', 3, 6);
const DEVAT = word('DEVÄŤ', 4, 0);
const DESAT_HOUR = word('DESAŤ', 4, 6);
const JEDE = word('JEDE', 5, 0);
const DVA_HOUR = word('DVA', 5, 4);
const NAST = word('NÁSŤ', 5, 7);

const DVA_MIN = word('DVA', 6, 0);
const TRI_MIN = word('TRI', 6, 3);
const STYRI_MIN = word('ŠTYRI', 6, 6);
const DESAT_MIN = word('DESAŤ', 7, 0);
const D = word('D', 7, 0);
const SAT = word('SAŤ', 7, 2);
const NULA = word('NULA', 7, 5);
const PATDESIAT = word('PÄŤDESIAT', 8, 0);
const PATNAST = word('PÄTNÁSŤ', 9, 0);
const PAT_MIN = word('PÄŤ', 9, 8);

// -dsať: the stem, then DESAŤ minus its E
const DSAT = [D, SAT];

const HOURS: WordCoord[][] = [
  [DVA_HOUR, NAST],
  [JEDNA],
  [DVE],
  [TRI_HOUR],
  [STYRI_HOUR],
  [PAT_HOUR],
  [SEST],
  [SEDEM],
  [OSEM],
  [DEVAT],
  [DESAT_HOUR],
  [JEDE, NAST],
];

const MINUTE_WORDS: Record<number, WordCoord[]> = {
  0: [],
  5: [NULA, PAT_MIN],
  10: [DESAT_MIN],
  15: [PATNAST],
  20: [DVA_MIN, ...DSAT],
  25: [DVA_MIN, ...DSAT, PAT_MIN],
  30: [TRI_MIN, ...DSAT],
  35: [TRI_MIN, ...DSAT, PAT_MIN],
  40: [STYRI_MIN, ...DSAT],
  45: [STYRI_MIN, ...DSAT, PAT_MIN],
  50: [PATDESIAT],
  55: [PATDESIAT, PAT_MIN],
};

function itIsFor(hours: number, _minutes: number): WordCoord[] {
  const h = hours % 12;
  return h >= 2 && h <= 4 ? [SU] : [JE];
}

function phrase(hours: number, minutes: number): WordCoord[] {
  const m = Math.floor(minutes / 5) * 5;
  return [...HOURS[hours % 12], ...MINUTE_WORDS[m]];
}

export const slovak: LanguageDef = {
  id: 'sk',
  name: 'Slovak',
  sample: 'JE',
  rows: [
    'JEŽSÚÔJEDNA',
    'DVEĽTRIČPÄŤ',
    'ŠTYRIAŠESŤÍ',
    'SEDEMKOSEMĹ',
    'DEVÄŤNDESAŤ',
    'JEDEDVANÁSŤ',
    'DVATRIŠTYRI',
    'DESAŤNULAĽÚ',
    'PÄŤDESIATÔŽ',
    'PÄTNÁSŤÍPÄŤ',
  ],
  itIs: [JE],
  itIsFor,
  words: [JE, SU, JEDNA, DVE, TRI_HOUR, PAT_HOUR, STYRI_HOUR, SEST, SEDEM, OSEM, DEVAT, DESAT_HOUR, JEDE, DVA_HOUR, NAST, DVA_MIN, TRI_MIN, STYRI_MIN, DESAT_MIN, D, SAT, NULA, PATDESIAT, PATNAST, PAT_MIN],
  phrase,
};
