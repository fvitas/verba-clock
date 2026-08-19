// Matrix source: https://github.com/vulture20/QLOCKGENERATOR/blob/master/src/app/configs/languages.ts
// Cross-checked with: https://github.com/bramp/wordclock/blob/master/lib/languages/natural/russian.dart (reference grid + logic)
// Fragment cells confirmed against cdmoro/wordoclock ru-RU.ts; hours build from split fragments (ЧЕ ТЫ РЕ = ЧЕТЫРЕ)
import { word, type LanguageDef, type WordCoord } from '../types';

const ODIN = word('ОДИН', 0, 0);
const PYAT_HOUR = word('ПЯТЬ', 0, 4);
const DVA = word('ДВА', 0, 8);
const DE_1 = word('ДЕ', 1, 0);
const SHEST = word('ШЕСТЬ', 1, 2);
const VYAT = word('ВЯТЬ', 1, 7);
const VO = word('ВО', 2, 0);
const CHE = word('ЧЕ', 2, 2);
const SEM = word('СЕМЬ', 2, 4);
const TRI = word('ТРИ', 2, 8);
const TY = word('ТЫ', 3, 0);
const DVE = word('ДВЕ', 3, 2);
const RE = word('РЕ', 3, 5);
const SYAT_HOUR = word('СЯТЬ', 3, 7);
const NADTSAT = word('НАДЦАТЬ', 4, 0);
const CHAS = word('ЧАС', 4, 7);
const CHASA = word('ЧАСА', 4, 7);
const CHASOV = word('ЧАСОВ', 5, 0);
const SOROK = word('СОРОК', 5, 6);
const TRID = word('ТРИД', 6, 0);
const DVAD = word('ДВАД', 6, 3);
const PYAT_50 = word('ПЯТЬ', 6, 7);
const PYATNAD = word('ПЯТНАД', 7, 0);
const TSAT = word('ЦАТЬ', 7, 7);
const DE_MIN = word('ДЕ', 8, 2);
const DESYAT = word('ДЕСЯТ', 8, 2);
const SYAT_MIN = word('СЯТЬ', 8, 7);
const PYAT_MIN = word('ПЯТЬ', 9, 0);
const MINUT = word('МИНУТ', 9, 6);

// ЧАС for 1, ЧАСА for 2-4, ЧАСОВ for 5-12
const HOURS: WordCoord[][] = [
  [DVE, NADTSAT, CHASOV],
  [ODIN, CHAS],
  [DVA, CHASA],
  [TRI, CHASA],
  [CHE, TY, RE, CHASA],
  [PYAT_HOUR, CHASOV],
  [SHEST, CHASOV],
  [SEM, CHASOV],
  [VO, SEM, CHASOV],
  [DE_1, VYAT, CHASOV],
  [DE_1, SYAT_HOUR, CHASOV],
  [ODIN, NADTSAT, CHASOV],
];

const MINUTE_WORDS: Record<number, WordCoord[]> = {
  0: [],
  5: [PYAT_MIN, MINUT],
  10: [DE_MIN, SYAT_MIN, MINUT],
  15: [PYATNAD, TSAT, MINUT],
  20: [DVAD, TSAT, MINUT],
  25: [DVAD, TSAT, PYAT_MIN, MINUT],
  30: [TRID, TSAT, MINUT],
  35: [TRID, TSAT, PYAT_MIN, MINUT],
  40: [SOROK, MINUT],
  45: [SOROK, PYAT_MIN, MINUT],
  50: [PYAT_50, DESYAT, MINUT],
  55: [PYAT_50, DESYAT, PYAT_MIN, MINUT],
};

function phrase(hours: number, minutes: number): WordCoord[] {
  const m = Math.floor(minutes / 5) * 5;
  return [...HOURS[hours % 12], ...MINUTE_WORDS[m]];
}

export const russian: LanguageDef = {
  id: 'ru',
  name: 'Russian',
  sample: 'ЧАСОВ',
  rows: [
    'ОДИНПЯТЬДВА',
    'ДЕШЕСТЬВЯТЬ',
    'ВОЧЕСЕМЬТРИ',
    'ТЫДВЕРЕСЯТЬ',
    'НАДЦАТЬЧАСА',
    'ЧАСОВДСОРОК',
    'ТРИДВАДПЯТЬ',
    'ПЯТНАДЕЦАТЬ',
    'АМДЕСЯТСЯТЬ',
    'ПЯТЬЯРМИНУТ',
  ],
  itIs: [],
  words: [ODIN, PYAT_HOUR, DVA, DE_1, SHEST, VYAT, VO, CHE, SEM, TRI, TY, DVE, RE, SYAT_HOUR, NADTSAT, CHAS, CHASA, CHASOV, SOROK, TRID, DVAD, PYAT_50, PYATNAD, TSAT, DE_MIN, DESYAT, SYAT_MIN, PYAT_MIN, MINUT],
  phrase,
};
