import { type LanguageDef, type WordCoord, word } from '../types';

const JIGEUM = word('지금', 0, 0);
const SIGAKEUN = word('시각은', 0, 3);
const SAEBYEOK = word('새벽', 0, 7);
const BAM = word('밤', 0, 10);
const ACHIM = word('아침', 1, 0);
const OHU = word('오후', 1, 3);
const JEONYEOK = word('저녁', 1, 6);
// 열 한 두 packs 1, 2, 10, 11, 12 — 열두 lights 열 + 두 across the dark 한
const YEOL = word('열', 2, 0);
const HAN = word('한', 2, 1);
const DU = word('두', 2, 2);
const SE = word('세', 2, 4);
const NE = word('네', 2, 5);
const DASEOT = word('다섯', 2, 7);
const YEOSEOT = word('여섯', 3, 0);
const ILGOP = word('일곱', 3, 3);
const YEODEOL = word('여덟', 3, 6);
const AHOP = word('아홉', 3, 9);
const SI = word('시', 4, 0);
const JEONGGAK = word('정각', 4, 2);
const BAN = word('반', 4, 5);
const OBUN = word('오분', 5, 0);
const SIPBUN = word('십분', 5, 3);
const SIBOBUN = word('십오분', 5, 6);
const ISIPBUN = word('이십분', 6, 0);
const ISIBOBUN = word('이십오분', 6, 4);
const SAMSIBOBUN = word('삼십오분', 7, 0);
const SASIPBUN = word('사십분', 7, 5);
const SASIBOBUN = word('사십오분', 8, 0);
const OSIPBUN = word('오십분', 8, 5);
const OSIBOBUN = word('오십오분', 9, 0);
const IMNIDA = word('입니다', 9, 8);

const HOURS: WordCoord[][] = [
  [YEOL, DU],
  [HAN],
  [DU],
  [SE],
  [NE],
  [DASEOT],
  [YEOSEOT],
  [ILGOP],
  [YEODEOL],
  [AHOP],
  [YEOL],
  [YEOL, HAN],
];

const MINUTE_WORDS: Record<number, WordCoord[]> = {
  0: [JEONGGAK],
  5: [OBUN],
  10: [SIPBUN],
  15: [SIBOBUN],
  20: [ISIPBUN],
  25: [ISIBOBUN],
  30: [BAN],
  35: [SAMSIBOBUN],
  40: [SASIPBUN],
  45: [SASIBOBUN],
  50: [OSIPBUN],
  55: [OSIBOBUN],
};

function period(hours: number): WordCoord {
  if (hours < 6) return SAEBYEOK;
  if (hours < 12) return ACHIM;
  if (hours < 18) return OHU;
  if (hours < 21) return JEONYEOK;
  return BAM;
}

function phrase(hours: number, minutes: number): WordCoord[] {
  const m = Math.floor(minutes / 5) * 5;
  return [period(hours), ...HOURS[hours % 12], SI, ...MINUTE_WORDS[m], IMNIDA];
}

export const korean: LanguageDef = {
  id: 'kr',
  name: '한국어',
  sample: '일곱 시 반',
  rows: [
    '지금은시각은초새벽낮밤',
    '아침의오후늘저녁년월요',
    '열한두육세네칠다섯팔구',
    '여섯일일곱이여덟삼아홉',
    '시사정각오반육칠팔구십',
    '오분초십분일십오분이삼',
    '이십분사이십오분육칠팔',
    '삼십오분구사십분초시분',
    '사십오분일오십분이삼사',
    '오십오분오육칠팔입니다',
  ],
  itIs: [JIGEUM, SIGAKEUN],
  words: [
    JIGEUM,
    SIGAKEUN,
    SAEBYEOK,
    BAM,
    ACHIM,
    OHU,
    JEONYEOK,
    YEOL,
    HAN,
    DU,
    SE,
    NE,
    DASEOT,
    YEOSEOT,
    ILGOP,
    YEODEOL,
    AHOP,
    SI,
    JEONGGAK,
    BAN,
    OBUN,
    SIPBUN,
    SIBOBUN,
    ISIPBUN,
    ISIBOBUN,
    SAMSIBOBUN,
    SASIPBUN,
    SASIBOBUN,
    OSIPBUN,
    OSIBOBUN,
    IMNIDA,
  ],
  phrase,
};
