// Matrix reverse-engineered from official QLOCKTWO Polish photos, 2026-08-19
// (mockups notes in docs/LANGUAGES.md — photos showed 7:30 "WPÓŁ DO ÓSM·EJ" and 7:50 "ZA DZIESIĘĆ ÓSMA").
// The official face solves Polish's dual case forms with tricks unique to this language:
// - ligature cells PI/CI/SI/DZI/JE (one grid cell shows two-three letters, like Catalan D')
// - a shared EJ suffix word: genitive hours light the nominative stem minus final A, plus EJ
// - the I filler before EJ exists solely for irregular "drugiej" (DRUG + I + EJ)
// - skip-lighting: DZIEWIĄTA/DZIESIĄTA share cells (one skips S, the other skips W)
// - row-spanning fragments: DWUNASTA = DWU + NASTA (inside JEDENASTA's row)
// Word texts below are grid-cell texts; display strings come from cellOverrides.
import { word, type LanguageDef, type WordCoord } from '../types';

const ZA = word('ZA', 0, 0);
const KWADRANS = word('KWADRANS', 0, 3);
const DWADZIESCIA = word('DWADZIEŚCIA', 1, 0);
const DZIESIEC = word('DZIESIĘĆ', 2, 0);
const PIEC = word('PĘĆ', 2, 8);
const WPOL = word('WPÓŁ', 3, 0);
const PO = word('PO', 3, 4);
const DO = word('DO', 3, 6);

const PIERWSZA = word('PERWSZA', 4, 0);
const PIERWSZ = word('PERWSZ', 4, 0);
const PIATA = word('PĄTA', 4, 7);
const PIAT = word('PĄT', 4, 7);
const DRUGA = word('DRUGA', 5, 0);
const DRUG = word('DRUG', 5, 0);
const TRZECIA = word('TRZECA', 5, 5);
const TRZECI = word('TRZEC', 5, 5);
const OSMA = word('ÓSMA', 6, 0);
const OSM = word('ÓSM', 6, 0);
const CZWARTA = word('CZWARTA', 6, 4);
const CZWART = word('CZWART', 6, 4);
const SZOSTA = word('SZÓSTA', 7, 0);
const SZOST = word('SZÓST', 7, 0);
const SIODMA = word('SÓDMA', 7, 6);
const SIODM = word('SÓDM', 7, 6);
const DWU = word('DWU', 8, 0);
const DZIE = word('DE', 8, 3);
const W_9 = word('W', 8, 5);
const S_10 = word('S', 8, 6);
const IATA = word('IĄTA', 8, 7);
const IAT = word('IĄT', 8, 7);
const JEDENASTA = word('JDENASTA', 9, 0);
const JEDENAST = word('JDENAST', 9, 0);
const NASTA = word('NASTA', 9, 3);
const NAST = word('NAST', 9, 3);
const I_LIG = word('I', 9, 8);
const EJ = word('EJ', 9, 9);

// index 0 = twelve
const HOURS_NOM: WordCoord[][] = [
  [DWU, NASTA],
  [PIERWSZA],
  [DRUGA],
  [TRZECIA],
  [CZWARTA],
  [PIATA],
  [SZOSTA],
  [SIODMA],
  [OSMA],
  [DZIE, W_9, IATA],
  [DZIE, S_10, IATA],
  [JEDENASTA],
];

const HOURS_GEN: WordCoord[][] = [
  [DWU, NAST, EJ],
  [PIERWSZ, EJ],
  [DRUG, I_LIG, EJ],
  [TRZECI, EJ],
  [CZWART, EJ],
  [PIAT, EJ],
  [SZOST, EJ],
  [SIODM, EJ],
  [OSM, EJ],
  [DZIE, W_9, IAT, EJ],
  [DZIE, S_10, IAT, EJ],
  [JEDENAST, EJ],
];

const PAST_WORDS: Record<number, WordCoord[]> = {
  5: [PIEC],
  10: [DZIESIEC],
  15: [KWADRANS],
  20: [DWADZIESCIA],
  25: [DWADZIESCIA, PIEC],
};

const TO_WORDS: Record<number, WordCoord[]> = {
  35: [DWADZIESCIA, PIEC],
  40: [DWADZIESCIA],
  45: [KWADRANS],
  50: [DZIESIEC],
  55: [PIEC],
};

function phrase(hours: number, minutes: number): WordCoord[] {
  const m = Math.floor(minutes / 5) * 5;
  if (m === 0) return HOURS_NOM[hours % 12];
  if (m <= 25) return [...PAST_WORDS[m], PO, ...HOURS_GEN[hours % 12]];
  if (m === 30) return [WPOL, DO, ...HOURS_GEN[(hours + 1) % 12]];
  return [ZA, ...TO_WORDS[m], ...HOURS_NOM[(hours + 1) % 12]];
}

export const polish: LanguageDef = {
  id: 'pl',
  name: 'Polish',
  sample: 'WPÓŁ DO',
  rows: [
    'ZAEKWADRANS',
    'DWADZIEŚCIA',
    'DZIESIĘĆPĘĆ',
    'WPÓŁPODOESR',
    'PERWSZAPĄTA',
    'DRUGATRZECA',
    'ÓSMACZWARTA',
    'SZÓSTASÓDMA',
    'DWUDEWSIĄTA',
    'JDENASTAIEJ',
  ],
  itIs: [],
  cellOverrides: {
    '2:8': 'PI',
    '4:0': 'PI',
    '4:7': 'PI',
    '5:9': 'CI',
    '7:6': 'SI',
    '8:3': 'DZI',
    '9:0': 'JE',
  },
  words: [ZA, KWADRANS, DWADZIESCIA, DZIESIEC, PIEC, WPOL, PO, DO, PIERWSZA, PIATA, DRUGA, TRZECIA, OSMA, CZWARTA, SZOSTA, SIODMA, DWU, DZIE, W_9, S_10, IATA, JEDENASTA, NASTA, I_LIG, EJ],
  phrase,
};
