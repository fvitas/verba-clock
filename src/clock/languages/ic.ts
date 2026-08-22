import { type LanguageDef, type WordCoord, word } from '../types';

const KLUKKAN = word('KLUKKAN', 0, 0);
const ER = word('ER', 0, 8);
const TUTTUGU = word('TUTTUGU', 1, 0);
const TIU_MIN = word('TÍU', 1, 8);
const KORTER = word('KORTER', 2, 0);
const FIMM_MIN = word('FIMM', 2, 7);
const MINUTUR = word('MÍNÚTUR', 3, 0);
const YFIR = word('YFIR', 4, 0);
const I = word('Í', 4, 5);
const HALF = word('HÁLF', 4, 7);
const EITT = word('EITT', 5, 0);
const TVO = word('TVÖ', 5, 5);
const THRJU = word('ÞRJÚ', 6, 0);
const FJOGUR = word('FJÖGUR', 6, 5);
const FIMM_HOUR = word('FIMM', 7, 0);
const SEX = word('SEX', 7, 5);
const SJO = word('SJÖ', 7, 8);
const ATTA = word('ÁTTA', 8, 0);
const NIU = word('NÍU', 8, 4);
const TIU_HOUR = word('TÍU', 8, 8);
const ELLEFU = word('ELLEFU', 9, 0);
const TOLF = word('TÓLF', 9, 7);

const HOURS = [TOLF, EITT, TVO, THRJU, FJOGUR, FIMM_HOUR, SEX, SJO, ATTA, NIU, TIU_HOUR, ELLEFU];

// MÍNÚTUR is spoken with bare numerals but dropped after KORTER and on the hour
const MINUTE_WORDS: Record<number, WordCoord[]> = {
  0: [],
  5: [FIMM_MIN, MINUTUR, YFIR],
  10: [TIU_MIN, MINUTUR, YFIR],
  15: [KORTER, YFIR],
  20: [TUTTUGU, MINUTUR, YFIR],
  25: [FIMM_MIN, MINUTUR, I, HALF],
  30: [HALF],
  35: [FIMM_MIN, MINUTUR, YFIR, HALF],
  40: [TUTTUGU, MINUTUR, I],
  45: [KORTER, I],
  50: [TIU_MIN, MINUTUR, I],
  55: [FIMM_MIN, MINUTUR, I],
};

function phrase(hours: number, minutes: number): WordCoord[] {
  const m = Math.floor(minutes / 5) * 5;
  const hour = HOURS[(m >= 25 ? hours + 1 : hours) % 12];
  return [...MINUTE_WORDS[m], hour];
}

export const icelandic: LanguageDef = {
  id: 'ic',
  name: 'Icelandic',
  sample: 'KLUKKAN ER',
  rows: [
    'KLUKKANÐERM',
    'TUTTUGUÐTÍU',
    'KORTERÆFIMM',
    'MÍNÚTURÐGÖS',
    'YFIRÞÍGHÁLF',
    'EITTÐTVÖSKÖ',
    'ÞRJÚÆFJÖGUR',
    'FIMMÐSEXSJÖ',
    'ÁTTANÍUÐTÍU',
    'ELLEFUÐTÓLF',
  ],
  itIs: [KLUKKAN, ER],
  words: [
    KLUKKAN,
    ER,
    TUTTUGU,
    TIU_MIN,
    KORTER,
    FIMM_MIN,
    MINUTUR,
    YFIR,
    I,
    HALF,
    EITT,
    TVO,
    THRJU,
    FJOGUR,
    FIMM_HOUR,
    SEX,
    SJO,
    ATTA,
    NIU,
    TIU_HOUR,
    ELLEFU,
    TOLF,
  ],
  phrase,
};
