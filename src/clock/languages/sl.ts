import { type LanguageDef, type WordCoord, word } from '../types';

const URA = word('URA', 0, 0);
const JE = word('JE', 0, 4);
// POL needs no minute numeral (*pol osmih*), so it only has to precede the hours
const POL = word('POL', 0, 7);
const PETNAJST = word('PETNAJST', 1, 0);
const PET_MIN = word('PET', 1, 0);
const IN = word('IN', 2, 0);
const DVAJSET = word('DVAJSET', 2, 3);
const DESET_MIN = word('DESET', 3, 0);
const CHEZ = word('ČEZ', 3, 6);
const DO = word('DO', 3, 9);
const ENAJST = word('ENAJST', 4, 0);
const ENA = word('ENA', 4, 0);
const EN = word('EN', 4, 0);
const O_ENO = word('O', 4, 6);
const SHEST = word('ŠEST', 4, 7);
const DVANAJST = word('DVANAJST', 5, 0);
const DEVET = word('DEVET', 6, 0);
// DVE lights DEVET's D and VE across the dark E
const D_DVE = word('D', 6, 0);
const VE_DVE = word('VE', 6, 2);
const DESET_HOUR = word('DESET', 6, 6);
const TRI = word('TRI', 7, 0);
const TR = word('TR', 7, 0);
const SHTIRI = word('ŠTIRI', 7, 4);
const PET_HOUR = word('PET', 8, 0);
const SEDEM = word('SEDEM', 8, 4);
// *sedmih* and *osmih* drop the second E, so they light SED/OS + M across it
const SED = word('SED', 8, 4);
const M_SEDEM = word('M', 8, 8);
const OSEM = word('OSEM', 9, 0);
const OS = word('OS', 9, 0);
const M_OSEM = word('M', 9, 3);
// Three cells spell every genitive-plural ending: IH, H alone, and E+H across the dark I
const E_GEN = word('E', 9, 8);
const IH = word('IH', 9, 9);
const H_GEN = word('H', 9, 10);

const HOURS: WordCoord[][] = [
  [DVANAJST],
  [ENA],
  [D_DVE, VE_DVE],
  [TRI],
  [SHTIRI],
  [PET_HOUR],
  [SHEST],
  [SEDEM],
  [OSEM],
  [DEVET],
  [DESET_HOUR],
  [ENAJST],
];

// ČEZ takes the accusative, which differs from the nominative only at one o'clock
const HOURS_ACC: WordCoord[][] = HOURS.map((h, i) => (i === 1 ? [EN, O_ENO] : h));

// POL and DO take the genitive plural
const HOURS_GEN: WordCoord[][] = [
  [DVANAJST, IH],
  [EN, IH],
  [D_DVE, VE_DVE, H_GEN],
  [TR, E_GEN, H_GEN],
  [SHTIRI, H_GEN],
  [PET_HOUR, IH],
  [SHEST, IH],
  [SED, M_SEDEM, IH],
  [OS, M_OSEM, IH],
  [DEVET, IH],
  [DESET_HOUR, IH],
  [ENAJST, IH],
];

const MINUTE_WORDS: Record<number, WordCoord[]> = {
  5: [PET_MIN],
  10: [DESET_MIN],
  15: [PETNAJST],
  20: [DVAJSET],
  25: [PET_MIN, IN, DVAJSET],
};

function phrase(hours: number, minutes: number): WordCoord[] {
  const m = Math.floor(minutes / 5) * 5;
  if (m === 0) return HOURS[hours % 12];
  const next = HOURS_GEN[(hours + 1) % 12];
  if (m === 30) return [POL, ...next];
  if (m < 30) return [...MINUTE_WORDS[m], CHEZ, ...HOURS_ACC[hours % 12]];
  return [...MINUTE_WORDS[60 - m], DO, ...next];
}

export const slovenian: LanguageDef = {
  id: 'sl',
  name: 'Slovenian',
  sample: 'URA JE',
  rows: [
    'URAKJEMPOLC',
    'PETNAJSTKRV',
    'INKDVAJSETM',
    'DESETLČEZDO',
    'ENAJSTOŠEST',
    'DVANAJSTKML',
    'DEVETŽDESET',
    'TRIMŠTIRIKN',
    'PETLSEDEMRV',
    'OSEMKRVNEIH',
  ],
  itIs: [URA, JE],
  words: [
    URA,
    JE,
    POL,
    PETNAJST,
    PET_MIN,
    IN,
    DVAJSET,
    DESET_MIN,
    CHEZ,
    DO,
    ENAJST,
    ENA,
    EN,
    O_ENO,
    SHEST,
    DVANAJST,
    DEVET,
    D_DVE,
    VE_DVE,
    DESET_HOUR,
    TRI,
    TR,
    SHTIRI,
    PET_HOUR,
    SEDEM,
    SED,
    M_SEDEM,
    OSEM,
    OS,
    M_OSEM,
    E_GEN,
    IH,
    H_GEN,
  ],
  phrase,
};
