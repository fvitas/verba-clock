import { type LanguageDef, type WordCoord, word } from '../types';

const JAM = word('JAM', 0, 0);
// SETENGAH sits above the hours because *setengah delapan* names the hour last, unlike *delapan kurang lima*
const SETENGAH = word('SETENGAH', 0, 3);
const SEMBILAN = word('SEMBILAN', 1, 0);
// SE_H is SEMBILAN's first two cells, reused as the SE- of SEPULUH and SEBELAS
const SE_H = word('SE', 1, 0);
const DUA_H = word('DUA', 1, 8);
const BELAS = word('BELAS', 2, 0);
const PULUH_H = word('PULUH', 2, 6);
const SATU = word('SATU', 3, 0);
const TIGA = word('TIGA', 3, 5);
const EMPAT = word('EMPAT', 4, 0);
const LIMA_H = word('LIMA', 4, 6);
const ENAM = word('ENAM', 5, 0);
const TUJUH = word('TUJUH', 5, 5);
const DELAPAN = word('DELAPAN', 6, 0);
const LEBIH = word('LEBIH', 7, 0);
const KURANG = word('KURANG', 7, 5);
const SE_M = word('SE', 8, 0);
const DUA_M = word('DUA', 8, 2);
const PULUH_M = word('PULUH', 8, 5);
const LIMABELAS = word('LIMABELAS', 9, 0);
// LIMA follows PULUH in reading order, so it serves both :05 alone and the tail of *dua puluh lima*
const LIMA_M = word('LIMA', 9, 0);

const HOURS: WordCoord[][] = [
  [DUA_H, BELAS],
  [SATU],
  [DUA_H],
  [TIGA],
  [EMPAT],
  [LIMA_H],
  [ENAM],
  [TUJUH],
  [DELAPAN],
  [SEMBILAN],
  [SE_H, PULUH_H],
  [SE_H, BELAS],
];

const MINUTE_WORDS: Record<number, WordCoord[]> = {
  5: [LIMA_M],
  10: [SE_M, PULUH_M],
  15: [LIMABELAS],
  20: [DUA_M, PULUH_M],
  25: [DUA_M, PULUH_M, LIMA_M],
};

function phrase(hours: number, minutes: number): WordCoord[] {
  const m = Math.floor(minutes / 5) * 5;
  const hour = HOURS[(m >= 30 ? hours + 1 : hours) % 12];
  if (m === 0) return hour;
  if (m === 30) return [SETENGAH, ...hour];
  if (m < 30) return [...hour, LEBIH, ...MINUTE_WORDS[m]];
  return [...hour, KURANG, ...MINUTE_WORDS[60 - m]];
}

export const indonesian: LanguageDef = {
  id: 'id',
  name: 'Indonesian',
  sample: 'JAM SETENGAH',
  rows: [
    'JAMSETENGAH',
    'SEMBILANDUA',
    'BELASKPULUH',
    'SATUWTIGARB',
    'EMPATKLIMAY',
    'ENAMRTUJUHW',
    'DELAPANKRWY',
    'LEBIHKURANG',
    'SEDUAPULUHB',
    'LIMABELASKR',
  ],
  itIs: [JAM],
  words: [
    JAM,
    SETENGAH,
    SEMBILAN,
    SE_H,
    DUA_H,
    BELAS,
    PULUH_H,
    SATU,
    TIGA,
    EMPAT,
    LIMA_H,
    ENAM,
    TUJUH,
    DELAPAN,
    LEBIH,
    KURANG,
    SE_M,
    DUA_M,
    PULUH_M,
    LIMABELAS,
    LIMA_M,
  ],
  phrase,
};
