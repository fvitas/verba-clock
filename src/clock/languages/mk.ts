import { type LanguageDef, type WordCoord, word } from '../types';

const CHASOT = word('ЧАСОТ', 0, 0);
const E = word('Е', 0, 6);
const EDEN = word('ЕДЕН', 0, 7);
// Macedonian teens drop Bulgarian's Д (единаесет), so ДЕСЕТ lights Д + ЕСЕТ across the dark ИНА
const EDINAESET = word('ЕДИНАЕСЕТ', 1, 0);
const D_HOUR = word('Д', 1, 1);
const ESET_HOUR = word('ЕСЕТ', 1, 5);
const DVANAESET = word('ДВАНАЕСЕТ', 2, 0);
const DVA = word('ДВА', 2, 0);
const CHETIRI = word('ЧЕТИРИ', 3, 0);
const T_TRI = word('Т', 3, 2);
const RI_TRI = word('РИ', 3, 4);
const PET_HOUR = word('ПЕТ', 3, 7);
const SHEST = word('ШЕСТ', 4, 0);
const SEDUM = word('СЕДУМ', 4, 5);
const OSUM = word('ОСУМ', 5, 0);
const DEVET = word('ДЕВЕТ', 5, 5);
const I_1 = word('И', 6, 0);
const BEZ = word('БЕЗ', 6, 2);
const PETNAESET = word('ПЕТНАЕСЕТ', 7, 0);
const PET_MIN = word('ПЕТ', 7, 0);
const DVAESET = word('ДВАЕСЕТ', 8, 0);
const D_MIN = word('Д', 8, 0);
const ESET_MIN = word('ЕСЕТ', 8, 3);
const I_2 = word('И', 8, 8);
const POL = word('ПОЛ', 9, 0);
const PET_TAIL = word('ПЕТ', 9, 8);

const TRI = [T_TRI, RI_TRI];
const DESET_HOUR = [D_HOUR, ESET_HOUR];
const DESET_MIN = [D_MIN, ESET_MIN];

const HOURS: WordCoord[][] = [
  [DVANAESET],
  [EDEN],
  [DVA],
  TRI,
  [CHETIRI],
  [PET_HOUR],
  [SHEST],
  [SEDUM],
  [OSUM],
  [DEVET],
  DESET_HOUR,
  [EDINAESET],
];

const POST_WORDS: Record<number, WordCoord[]> = {
  5: [PET_MIN],
  10: DESET_MIN,
  15: [PETNAESET],
  20: [DVAESET],
  25: [DVAESET, I_2, PET_TAIL],
  30: [POL],
};

const PRE_WORDS: Record<number, WordCoord[]> = {
  35: [DVAESET, I_2, PET_TAIL],
  40: [DVAESET],
  45: [PETNAESET],
  50: DESET_MIN,
  55: [PET_MIN],
};

function phrase(hours: number, minutes: number): WordCoord[] {
  const m = Math.floor(minutes / 5) * 5;
  const hour = HOURS[(m >= 35 ? hours + 1 : hours) % 12];
  if (m === 0) return hour;
  if (m <= 30) return [...hour, I_1, ...POST_WORDS[m]];
  return [...hour, BEZ, ...PRE_WORDS[m]];
}

export const macedonian: LanguageDef = {
  id: 'mk',
  name: 'Македонски',
  sample: 'ЧАСОТ Е',
  rows: [
    'ЧАСОТКЕЕДЕН',
    'ЕДИНАЕСЕТЛР',
    'ДВАНАЕСЕТКС',
    'ЧЕТИРИМПЕТЛ',
    'ШЕСТЛСЕДУМР',
    'ОСУМКДЕВЕТМ',
    'ИРБЕЗЛКАМСЕ',
    'ПЕТНАЕСЕТЛК',
    'ДВАЕСЕТЛИМС',
    'ПОЛКРМСЛПЕТ',
  ],
  itIs: [CHASOT, E],
  words: [
    CHASOT,
    E,
    EDEN,
    EDINAESET,
    D_HOUR,
    ESET_HOUR,
    DVANAESET,
    DVA,
    CHETIRI,
    T_TRI,
    RI_TRI,
    PET_HOUR,
    SHEST,
    SEDUM,
    OSUM,
    DEVET,
    I_1,
    BEZ,
    PETNAESET,
    PET_MIN,
    DVAESET,
    D_MIN,
    ESET_MIN,
    I_2,
    POL,
    PET_TAIL,
  ],
  phrase,
};
