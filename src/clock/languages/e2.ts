// Matrix source: https://github.com/ukw100/wordclock24h/blob/master/make-tables/tables12h-en2.c ("ENGLISH 2")
// Word positions and minute table taken from the same file
import { word, type LanguageDef, type WordCoord } from '../types';

const IT = word('IT', 0, 0);
const IS = word('IS', 0, 3);
const HALF = word('HALF', 0, 6);
const TEN_MIN = word('TEN', 1, 0);
const QUARTER = word('QUARTER', 1, 4);
const TWENTY = word('TWENTY', 2, 1);
const FIVE_MIN = word('FIVE', 2, 7);
const TO = word('TO', 3, 0);
const PAST = word('PAST', 3, 2);
const FOUR = word('FOUR', 3, 7);
const FIVE_HOUR = word('FIVE', 4, 0);
const TWO = word('TWO', 4, 4);
const NINE = word('NINE', 4, 7);
const THREE = word('THREE', 5, 0);
const TWELVE = word('TWELVE', 5, 5);
const ELEVEN = word('ELEVEN', 6, 1);
const ONE = word('ONE', 6, 7);
const SEVEN = word('SEVEN', 7, 0);
const EIGHT = word('EIGHT', 7, 6);
const TEN_HOUR = word('TEN', 8, 1);
const SIX = word('SIX', 8, 4);
const O = word('O', 9, 4);
const CLOCK = word('CLOCK', 9, 6);

const HOURS = [TWELVE, ONE, TWO, THREE, FOUR, FIVE_HOUR, SIX, SEVEN, EIGHT, NINE, TEN_HOUR, ELEVEN];

const MINUTES: Record<number, { words: WordCoord[]; nextHour: boolean }> = {
  0: { words: [O, CLOCK], nextHour: false },
  5: { words: [FIVE_MIN, PAST], nextHour: false },
  10: { words: [TEN_MIN, PAST], nextHour: false },
  15: { words: [QUARTER, PAST], nextHour: false },
  20: { words: [TWENTY, PAST], nextHour: false },
  25: { words: [TWENTY, FIVE_MIN, PAST], nextHour: false },
  30: { words: [HALF, PAST], nextHour: false },
  35: { words: [TWENTY, FIVE_MIN, TO], nextHour: true },
  40: { words: [TWENTY, TO], nextHour: true },
  45: { words: [QUARTER, TO], nextHour: true },
  50: { words: [TEN_MIN, TO], nextHour: true },
  55: { words: [FIVE_MIN, TO], nextHour: true },
};

function phrase(hours: number, minutes: number): WordCoord[] {
  const m = Math.floor(minutes / 5) * 5;
  const { words, nextHour } = MINUTES[m];
  const hour = HOURS[(nextHour ? hours + 1 : hours) % 12];
  return m === 0 ? [hour, ...words] : [...words, hour];
}

export const englishE2: LanguageDef = {
  id: 'e2',
  name: 'English (E2)',
  sample: 'IT IS',
  rows: [
    'ITKISGHALFE',
    'TENYQUARTER',
    'DTWENTYFIVE',
    'TOPASTEFOUR',
    'FIVETWONINE',
    'THREETWELVE',
    'BELEVENONES',
    'SEVENWEIGHT',
    'ITENSIXTIES',
    'TINEOICLOCK',
  ],
  itIs: [IT, IS],
  words: [IT, IS, HALF, TEN_MIN, QUARTER, TWENTY, FIVE_MIN, TO, PAST, FOUR, FIVE_HOUR, TWO, NINE, THREE, TWELVE, ELEVEN, ONE, SEVEN, EIGHT, TEN_HOUR, SIX, O, CLOCK],
  phrase,
};
