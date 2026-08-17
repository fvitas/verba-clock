// Custom Verba matrix (no QLOCKTWO Serbian exists) — decision D4b
// Grammar and layout verified by the user (native speaker) via mockups/serbian-matrix.html on 2026-08-16, row 0 reworked 2026-08-17 per native-speaker feedback
import { word, type LanguageDef, type WordCoord } from '../types';

const SADA = word('САДА', 0, 0);
const JE = word('ЈЕ', 0, 5);
const POLA = word('ПОЛА', 0, 7);
const DVADESET_PRE = word('ДВАДЕСЕТ', 1, 0);
const DESET_PRE = word('ДЕСЕТ', 1, 3);
const PETNAEST_PRE = word('ПЕТНАЕСТ', 2, 0);
const PET_PRE = word('ПЕТ', 2, 0);
const DO = word('ДО', 2, 9);
const JEDANAEST = word('ЈЕДАНАЕСТ', 3, 0);
const JEDAN = word('ЈЕДАН', 3, 0);
const DVANAEST = word('ДВАНАЕСТ', 4, 0);
const DVA = word('ДВА', 4, 0);
const TRI = word('ТРИ', 4, 8);
const CETIRI = word('ЧЕТИРИ', 5, 0);
const DESET_HOUR = word('ДЕСЕТ', 5, 6);
const PET_HOUR = word('ПЕТ', 6, 0);
const SEST = word('ШЕСТ', 6, 3);
const OSAM = word('ОСАМ', 6, 7);
const SEDAM = word('СЕДАМ', 7, 0);
const DEVET = word('ДЕВЕТ', 7, 5);
const I = word('И', 8, 0);
const DVADESET_POST = word('ДВАДЕСЕТ', 8, 2);
const DESET_POST = word('ДЕСЕТ', 8, 5);
const PETNAEST_POST = word('ПЕТНАЕСТ', 9, 0);
const PET_POST = word('ПЕТ', 9, 0);

const HOURS = [DVANAEST, JEDAN, DVA, TRI, CETIRI, PET_HOUR, SEST, SEDAM, OSAM, DEVET, DESET_HOUR, JEDANAEST];

const POST_WORDS: Record<number, WordCoord[]> = {
  5: [PET_POST],
  10: [DESET_POST],
  15: [PETNAEST_POST],
  20: [DVADESET_POST],
  25: [DVADESET_POST, PET_POST],
};

const PRE_WORDS: Record<number, WordCoord[]> = {
  35: [DVADESET_PRE, PET_PRE],
  40: [DVADESET_PRE],
  45: [PETNAEST_PRE],
  50: [DESET_PRE],
  55: [PET_PRE],
};

function phrase(hours: number, minutes: number): WordCoord[] {
  const m = Math.floor(minutes / 5) * 5;
  if (m === 0) return [HOURS[hours % 12]];
  if (m === 30) return [POLA, HOURS[(hours + 1) % 12]];
  if (m < 30) return [HOURS[hours % 12], I, ...POST_WORDS[m]];
  return [...PRE_WORDS[m], DO, HOURS[(hours + 1) % 12]];
}

export const serbian: LanguageDef = {
  id: 'sr',
  name: 'Српски',
  sample: 'САДА ЈЕ',
  rows: [
    'САДАКЈЕПОЛА',
    'ДВАДЕСЕТКРМ',
    'ПЕТНАЕСТРДО',
    'ЈЕДАНАЕСТМК',
    'ДВАНАЕСТТРИ',
    'ЧЕТИРИДЕСЕТ',
    'ПЕТШЕСТОСАМ',
    'СЕДАМДЕВЕТК',
    'ИРДВАДЕСЕТМ',
    'ПЕТНАЕСТРКЛ',
  ],
  itIs: [SADA, JE],
  words: [SADA, JE, POLA, DVADESET_PRE, DESET_PRE, PETNAEST_PRE, PET_PRE, DO, JEDANAEST, JEDAN, DVANAEST, DVA, TRI, CETIRI, DESET_HOUR, PET_HOUR, SEST, OSAM, SEDAM, DEVET, I, DVADESET_POST, DESET_POST, PETNAEST_POST, PET_POST],
  phrase,
};
