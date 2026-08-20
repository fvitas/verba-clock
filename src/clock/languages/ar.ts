// Official QLOCKTWO Arabic face — a WORD grid, not a letter grid (cursive script
// can't split into letter cells). Transcribed from mockups/reference-languages/
// ar-arabic.png + ar-arabic-watch.png (both 7:30) and cross-checked against the
// QLOCKGENERATOR comment matrix (its لا-ligature mangling decoded).
// Grammar (QLOCKTWO manual example الثالثة إلا الربع + GeeksValley Arabic word clock):
// hour first, then minutes; from :40 the NEXT hour with الا ("except").
// Hours repeat across rows so every (hour, minute) pair has a monotonic
// reading-order path; the 7:30 photos show the LATEST valid copy lit
// (row 3 السابعة, not row 1) — that selection rule is photo-confirmed at 7:30 only.
// أو / من / stray الا copies are filler words (word-grid analogue of filler letters).
// Spelling is faithful to the stencil, not the dictionary: the face writes إلا WITHOUT
// its hamza (bare الا) while أو keeps its hamza and الآن keeps its madda — photo-verified
// at high zoom, don't "correct" it.
import { wordSlot, type LanguageDef, type WordCoord } from '../types';

const ROWS = [
  'الساعة الآن الحادية الا الثانية عشر',
  'الثانية الواحدة السادسة السابعة',
  'الثالثة العاشرة الخامسة أو الرابعة',
  'الا الواحدة الا السابعة التاسعة الا',
  'العاشرة الثامنة السادسة الواحدة',
  'الحادية الثانية الا عشر و الثامنة',
  'الثانية والنصف أو الا الثلث الثامنة',
  'الا خمس أو الا الربع من الا عشر',
  'وعشر الثالثة والربع و والثلث الثانية',
  'وخمس السابعة دقائق الا التاسعة',
];

const w = (row: number, slot: number): WordCoord => wordSlot(ROWS[row].split(' ')[slot], row, slot);

const AL_SAA = w(0, 0);
const AL_AAN = w(0, 1);

// Hour copies in ascending reading order; 11/12 are two-word pairs sharing عشر
const HOUR_COPIES: WordCoord[][][] = [
  [[w(0, 4), w(0, 5)], [w(5, 1), w(5, 3)]], // 12 الثانية عشر
  [[w(1, 1)], [w(3, 1)], [w(4, 3)]], // 1 الواحدة
  [[w(1, 0)], [w(5, 1)], [w(6, 0)], [w(8, 5)]], // 2 الثانية
  [[w(2, 0)], [w(8, 1)]], // 3 الثالثة
  [[w(2, 4)]], // 4 الرابعة
  [[w(2, 2)]], // 5 الخامسة
  [[w(1, 2)], [w(4, 2)]], // 6 السادسة
  [[w(1, 3)], [w(3, 3)], [w(9, 1)]], // 7 السابعة
  [[w(4, 1)], [w(5, 5)], [w(6, 5)]], // 8 الثامنة
  [[w(3, 4)], [w(9, 4)]], // 9 التاسعة
  [[w(2, 1)], [w(4, 0)]], // 10 العاشرة
  [[w(0, 2), w(0, 5)], [w(5, 0), w(5, 3)]], // 11 الحادية عشر
];

const MINUTE_WORDS: Record<number, WordCoord[]> = {
  0: [],
  5: [w(9, 0), w(9, 2)], // وخمس دقائق
  10: [w(8, 0), w(9, 2)], // وعشر دقائق
  15: [w(8, 2)], // والربع
  20: [w(8, 4)], // والثلث
  25: [w(6, 1), w(7, 0), w(7, 1), w(9, 2)], // والنصف الا خمس دقائق
  30: [w(6, 1)], // والنصف
  35: [w(6, 1), w(9, 0), w(9, 2)], // والنصف وخمس دقائق
  40: [w(6, 3), w(6, 4)], // الا الثلث
  45: [w(7, 3), w(7, 4)], // الا الربع
  50: [w(7, 6), w(7, 7), w(9, 2)], // الا عشر دقائق
  55: [w(7, 0), w(7, 1), w(9, 2)], // الا خمس دقائق
};

const pos = (word: WordCoord): number => word.row * 100 + word.start;

function phrase(hours: number, minutes: number): WordCoord[] {
  const m = Math.floor(minutes / 5) * 5;
  const displayHour = m >= 40 ? hours + 1 : hours;
  const minuteWords = MINUTE_WORDS[m];
  const limit = minuteWords.length > 0 ? pos(minuteWords[0]) : Number.POSITIVE_INFINITY;
  const copies = HOUR_COPIES[displayHour % 12].filter((copy) => pos(copy[copy.length - 1]) < limit);
  return [...copies[copies.length - 1], ...minuteWords];
}

const ALL_WORDS = new Map<string, WordCoord>();
for (const coord of [AL_SAA, AL_AAN, ...HOUR_COPIES.flat(2), ...Object.values(MINUTE_WORDS).flat()]) {
  ALL_WORDS.set(`${coord.row}:${coord.start}`, coord);
}

export const arabic: LanguageDef = {
  id: 'ar',
  name: 'Arabic',
  sample: 'السابعة والنصف',
  rows: ROWS,
  itIs: [AL_SAA, AL_AAN],
  layout: 'word',
  dir: 'rtl',
  words: [...ALL_WORDS.values()],
  phrase,
};
