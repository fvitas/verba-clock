// Custom Verba matrix (no QLOCKTWO Bulgarian exists) — wave 2, decision D27
// System: "часът е X и/без Y" — Bulgarian has no case inflection, so hours stay
// nominative on both sides (unlike Polish/Ukrainian, which is why those don't fit).
// Overlaps: ЕДИН and hour-ДЕСЕТ live inside ЕДИНАДЕСЕТ, ДВА inside ДВАНАДЕСЕТ,
// minute-ПЕТ and minute-ДЕСЕТ inside ПЕТНАДЕСЕТ (Serbian-style, never co-lit).
import { word, type LanguageDef, type WordCoord } from '../types';

const CHASUT = word('ЧАСЪТ', 0, 0);
const E = word('Е', 0, 6);

const TRI = word('ТРИ', 0, 8);
const EDIN = word('ЕДИН', 1, 0);
const DESET_HOUR = word('ДЕСЕТ', 1, 5);
const EDINADESET = word('ЕДИНАДЕСЕТ', 1, 0);
const DVA = word('ДВА', 2, 0);
const DVANADESET = word('ДВАНАДЕСЕТ', 2, 0);
const CHETIRI = word('ЧЕТИРИ', 3, 0);
const PET_HOUR = word('ПЕТ', 3, 7);
const SHEST = word('ШЕСТ', 4, 0);
const SEDEM = word('СЕДЕМ', 4, 5);
const OSEM = word('ОСЕМ', 5, 0);
const DEVET = word('ДЕВЕТ', 5, 5);

const I_1 = word('И', 6, 0);
const BEZ = word('БЕЗ', 6, 2);
const DVADESET = word('ДВАДЕСЕТ', 7, 0);
const I_2 = word('И', 7, 9);
const PETNADESET = word('ПЕТНАДЕСЕТ', 8, 0);
const PET_MIN = word('ПЕТ', 8, 0);
const DESET_MIN = word('ДЕСЕТ', 8, 5);
const POLOVINA = word('ПОЛОВИНА', 9, 0);

const HOURS = [DVANADESET, EDIN, DVA, TRI, CHETIRI, PET_HOUR, SHEST, SEDEM, OSEM, DEVET, DESET_HOUR, EDINADESET];

const POST_WORDS: Record<number, WordCoord[]> = {
  5: [PET_MIN],
  10: [DESET_MIN],
  15: [PETNADESET],
  20: [DVADESET],
  25: [DVADESET, I_2, PET_MIN],
  30: [POLOVINA],
};

const PRE_WORDS: Record<number, WordCoord[]> = {
  35: [DVADESET, I_2, PET_MIN],
  40: [DVADESET],
  45: [PETNADESET],
  50: [DESET_MIN],
  55: [PET_MIN],
};

function phrase(hours: number, minutes: number): WordCoord[] {
  const m = Math.floor(minutes / 5) * 5;
  const hour = HOURS[(m >= 35 ? hours + 1 : hours) % 12];
  if (m === 0) return [hour];
  if (m <= 30) return [hour, I_1, ...POST_WORDS[m]];
  return [hour, BEZ, ...PRE_WORDS[m]];
}

export const bulgarian: LanguageDef = {
  id: 'bg',
  name: 'Bulgarian',
  sample: 'ЧАСЪТ Е',
  rows: [
    'ЧАСЪТКЕМТРИ',
    'ЕДИНАДЕСЕТЛ',
    'ДВАНАДЕСЕТС',
    'ЧЕТИРИРПЕТК',
    'ШЕСТЛСЕДЕМР',
    'ОСЕМКДЕВЕТМ',
    'ИРБЕЗЛКАМСЕ',
    'ДВАДЕСЕТКИМ',
    'ПЕТНАДЕСЕТЛ',
    'ПОЛОВИНАКРС',
  ],
  itIs: [CHASUT, E],
  words: [CHASUT, E, TRI, EDIN, DESET_HOUR, EDINADESET, DVA, DVANADESET, CHETIRI, PET_HOUR, SHEST, SEDEM, OSEM, DEVET, I_1, BEZ, DVADESET, I_2, PETNADESET, PET_MIN, DESET_MIN, POLOVINA],
  phrase,
};
