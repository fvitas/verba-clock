import { word, type LanguageDef, type WordCoord } from '../types';

const IT = word('IT', 0, 0);
const IS = word('IS', 0, 3);
const A = word('A', 1, 0);
const QUARTER = word('QUARTER', 1, 2);
const TWENTY = word('TWENTY', 2, 0);
const FIVE_MIN = word('FIVE', 2, 6);
const HALF = word('HALF', 3, 0);
const TEN_MIN = word('TEN', 3, 5);
const TO = word('TO', 3, 9);
const PAST = word('PAST', 4, 0);
const NINE = word('NINE', 4, 7);
const ONE = word('ONE', 5, 0);
const SIX = word('SIX', 5, 3);
const THREE = word('THREE', 5, 6);
const FOUR = word('FOUR', 6, 0);
const FIVE_HOUR = word('FIVE', 6, 4);
const TWO = word('TWO', 6, 8);
const EIGHT = word('EIGHT', 7, 0);
const ELEVEN = word('ELEVEN', 7, 5);
const SEVEN = word('SEVEN', 8, 0);
const TWELVE = word('TWELVE', 8, 5);
const TEN_HOUR = word('TEN', 9, 0);
const OCLOCK = word('OCLOCK', 9, 5);

const HOURS = [TWELVE, ONE, TWO, THREE, FOUR, FIVE_HOUR, SIX, SEVEN, EIGHT, NINE, TEN_HOUR, ELEVEN];

const MINUTE_WORDS: Record<number, WordCoord[]> = {
  5: [FIVE_MIN, PAST],
  10: [TEN_MIN, PAST],
  15: [A, QUARTER, PAST],
  20: [TWENTY, PAST],
  25: [TWENTY, FIVE_MIN, PAST],
  30: [HALF, PAST],
  35: [TWENTY, FIVE_MIN, TO],
  40: [TWENTY, TO],
  45: [A, QUARTER, TO],
  50: [TEN_MIN, TO],
  55: [FIVE_MIN, TO],
};

function phrase(hours: number, minutes: number): WordCoord[] {
  const m = Math.floor(minutes / 5) * 5;
  const hour = HOURS[(m >= 35 ? hours + 1 : hours) % 12];
  return m === 0 ? [hour, OCLOCK] : [...MINUTE_WORDS[m], hour];
}

export const english: LanguageDef = {
  id: 'en',
  name: 'English',
  sample: 'IT IS',
  rows: [
    'ITLISASAMPM',
    'ACQUARTERDC',
    'TWENTYFIVEX',
    'HALFSTENFTO',
    'PASTERUNINE',
    'ONESIXTHREE',
    'FOURFIVETWO',
    'EIGHTELEVEN',
    'SEVENTWELVE',
    'TENSEOCLOCK',
  ],
  itIs: [IT, IS],
  words: [IT, IS, A, QUARTER, TWENTY, FIVE_MIN, HALF, TEN_MIN, TO, PAST, NINE, ONE, SIX, THREE, FOUR, FIVE_HOUR, TWO, EIGHT, ELEVEN, SEVEN, TWELVE, TEN_HOUR, OCLOCK],
  phrase,
};
