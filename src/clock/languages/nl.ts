// Matrix source: https://github.com/vulture20/QLOCKGENERATOR/blob/master/src/app/configs/languages.ts
// Cross-checked with: https://github.com/bracci/Qlockthree/blob/master/Woerter_NL.h (+ Renderer.cpp phrase logic)
import { word, type LanguageDef, type WordCoord } from '../types';

const HET = word('HET', 0, 0);
const IS = word('IS', 0, 4);
const VIJF_MIN = word('VIJF', 0, 7);
const TIEN_MIN = word('TIEN', 1, 0);
const VOOR = word('VOOR', 1, 7);
const OVER = word('OVER', 2, 0);
const KWART = word('KWART', 2, 6);
const HALF = word('HALF', 3, 0);
const OVER2 = word('OVER', 3, 7);
const VOOR2 = word('VOOR', 4, 0);
const EEN = word('ÉÉN', 4, 7);
const TWEE = word('TWEE', 5, 0);
const DRIE = word('DRIE', 5, 7);
const VIER = word('VIER', 6, 0);
const VIJF_HOUR = word('VIJF', 6, 4);
const ZES = word('ZES', 6, 8);
const ZEVEN = word('ZEVEN', 7, 0);
const NEGEN = word('NEGEN', 7, 6);
const ACHT = word('ACHT', 8, 0);
const TIEN_HOUR = word('TIEN', 8, 4);
const ELF = word('ELF', 8, 8);
const TWAALF = word('TWAALF', 9, 0);
const UUR = word('UUR', 9, 8);

const HOURS = [TWAALF, EEN, TWEE, DRIE, VIER, VIJF_HOUR, ZES, ZEVEN, ACHT, NEGEN, TIEN_HOUR, ELF];

// Dutch shows the NEXT hour from :20 onward (tien voor half elf)
const MINUTES: Record<number, { words: WordCoord[]; nextHour: boolean }> = {
  0: { words: [], nextHour: false },
  5: { words: [VIJF_MIN, OVER], nextHour: false },
  10: { words: [TIEN_MIN, OVER], nextHour: false },
  15: { words: [KWART, OVER2], nextHour: false },
  20: { words: [TIEN_MIN, VOOR, HALF], nextHour: true },
  25: { words: [VIJF_MIN, VOOR, HALF], nextHour: true },
  30: { words: [HALF], nextHour: true },
  35: { words: [VIJF_MIN, OVER, HALF], nextHour: true },
  40: { words: [TIEN_MIN, OVER, HALF], nextHour: true },
  45: { words: [KWART, VOOR2], nextHour: true },
  50: { words: [TIEN_MIN, VOOR], nextHour: true },
  55: { words: [VIJF_MIN, VOOR], nextHour: true },
};

function phrase(hours: number, minutes: number): WordCoord[] {
  const m = Math.floor(minutes / 5) * 5;
  const { words, nextHour } = MINUTES[m];
  const hour = HOURS[(nextHour ? hours + 1 : hours) % 12];
  return m === 0 ? [hour, UUR] : [...words, hour];
}

export const dutch: LanguageDef = {
  id: 'nl',
  name: 'Nederlands',
  sample: 'HET IS',
  rows: [
    'HETKISAVIJF',
    'TIENATZVOOR',
    'OVERMEKWART',
    'HALFSPMOVER',
    'VOORTHGÉÉNS',
    'TWEEAMCDRIE',
    'VIERVIJFZES',
    'ZEVENONEGEN',
    'ACHTTIENELF',
    'TWAALFPMUUR',
  ],
  itIs: [HET, IS],
  words: [HET, IS, VIJF_MIN, TIEN_MIN, VOOR, OVER, KWART, HALF, OVER2, VOOR2, EEN, TWEE, DRIE, VIER, VIJF_HOUR, ZES, ZEVEN, NEGEN, ACHT, TIEN_HOUR, ELF, TWAALF, UUR],
  phrase,
};
