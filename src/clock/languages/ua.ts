// Custom Verba matrix (no QLOCKTWO Ukrainian exists — checked against the QLOCKGENERATOR
// language list). NOT a Russian-style digital readout: "сім тридцять" is non-normative in
// Ukrainian — clock position takes ORDINAL numerals (cardinals express duration), so the face
// spells "сьома година", "п'ять на восьму", "пів на восьму", "за десять восьма".
// Feminine ordinals agree with ГОДИНА: nominative -А at :00 and after ЗА, accusative -У after
// НА; ТРЕТ takes -Я/-Ю. Suffix cells are shared by every stem (D28, the Polish -EJ trick).
// Fragments: ОДИ/ДВА share НАДЦЯТ, ДЕ is shared by ДЕВ'ЯТ and ДЕСЯТ (as on the official
// Russian face), ДВАДЦЯТЬ = ДВА + the ДЦЯТЬ tail of П'ЯТНАДЦЯТЬ.
// Apostrophes ride in the preceding cell via cellOverrides, like Italian L' and Catalan D'.
import { word, type LanguageDef, type WordCoord } from '../types';

const ZARAZ = word('ЗАРАЗ', 0, 0);
const ZA = word('ЗА', 0, 6);
const DVA_MIN = word('ДВА', 0, 8);
const PYATNADTSYAT = word('ПЯТНАДЦЯТЬ', 1, 0);
const DTSYAT = word('ДЦЯТЬ', 1, 5);
const PYAT_MIN = word('ПЯТЬ', 2, 0);
const DESYAT_MIN = word('ДЕСЯТЬ', 2, 4);
const PIV = word('ПІВ', 3, 0);
const NA = word('НА', 3, 4);

const VOSM = word('ВОСЬМ', 3, 6);
const CHETVERT = word('ЧЕТВЕРТ', 4, 0);
const ODY = word('ОДИ', 4, 8);
const DVA_HOUR = word('ДВА', 5, 0);
const NADTSYAT = word('НАДЦЯТ', 5, 3);
const DE = word('ДЕ', 5, 9);
const VYAT = word('ВЯТ', 6, 0);
const SYAT = word('СЯТ', 6, 3);
const PERSH = word('ПЕРШ', 6, 6);
const DRUH = word('ДРУГ', 7, 0);
const TRET = word('ТРЕТ', 7, 4);
const PYAT_HOUR = word('ПЯТ', 7, 8);
const SHOST = word('ШОСТ', 8, 0);
const SOM = word('СЬОМ', 8, 5);

const A = word('А', 9, 0);
const U = word('У', 9, 1);
const YA = word('Я', 9, 2);
const YU = word('Ю', 9, 3);
const HODYNA = word('ГОДИНА', 9, 5);

const HOUR_STEMS: WordCoord[][] = [
  [DVA_HOUR, NADTSYAT],
  [PERSH],
  [DRUH],
  [TRET],
  [CHETVERT],
  [PYAT_HOUR],
  [SHOST],
  [SOM],
  [VOSM],
  [DE, VYAT],
  [DE, SYAT],
  [ODY, NADTSYAT],
];

const TRETYA = 3;

// сьома, третя — the hour as subject (:00) or after ЗА
const nominative = (hours: number): WordCoord[] => {
  const i = hours % 12;
  return [...HOUR_STEMS[i], i === TRETYA ? YA : A];
};

// на сьому, на третю — the hour the minutes climb towards
const accusative = (hours: number): WordCoord[] => {
  const i = hours % 12;
  return [...HOUR_STEMS[i], i === TRETYA ? YU : U];
};

const MINUTE_WORDS: Record<number, WordCoord[]> = {
  5: [PYAT_MIN],
  10: [DESYAT_MIN],
  15: [PYATNADTSYAT],
  20: [DVA_MIN, DTSYAT],
  25: [DVA_MIN, DTSYAT, PYAT_MIN],
};

function phrase(hours: number, minutes: number): WordCoord[] {
  const m = Math.floor(minutes / 5) * 5;
  if (m === 0) return [...nominative(hours), HODYNA];
  if (m === 30) return [PIV, NA, ...accusative(hours + 1)];
  if (m < 30) return [...MINUTE_WORDS[m], NA, ...accusative(hours + 1)];
  return [ZA, ...MINUTE_WORDS[60 - m], ...nominative(hours + 1)];
}

export const ukrainian: LanguageDef = {
  id: 'ua',
  name: 'Ukrainian',
  sample: 'ЗАРАЗ',
  rows: [
    'ЗАРАЗТЗАДВА',
    'ПЯТНАДЦЯТЬИ',
    'ПЯТЬДЕСЯТЬК',
    'ПІВЕНАВОСЬМ',
    'ЧЕТВЕРТЖОДИ',
    'ДВАНАДЦЯТДЕ',
    'ВЯТСЯТПЕРШЛ',
    'ДРУГТРЕТПЯТ',
    'ШОСТІСЬОМНЧ',
    'АУЯЮРГОДИНА',
  ],
  cellOverrides: {
    '1:0': "П'",
    '2:0': "П'",
    '6:0': "В'",
    '7:8': "П'",
  },
  itIs: [ZARAZ],
  words: [ZARAZ, ZA, DVA_MIN, PYATNADTSYAT, DTSYAT, PYAT_MIN, DESYAT_MIN, PIV, NA, VOSM, CHETVERT, ODY, DVA_HOUR, NADTSYAT, DE, VYAT, SYAT, PERSH, DRUH, TRET, PYAT_HOUR, SHOST, SOM, A, U, YA, YU, HODYNA],
  phrase,
};
