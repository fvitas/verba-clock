// Matrix transcribed cell-by-cell from mockups/reference-languages/ja-japanese.png (7:30 =
// 現在の時刻は 七時半 です, both 午前/午後 dark). Japanese kanji are one glyph per cell, so this
// is a plain LTR letter grid — no word-grid or RTL mode needed.
// Phrase construction: 現在の時刻は + <time> + です, where <time> is
//   :00       X時                  (です on row 4 — the earliest copy, as in the photo)
//   :05-:25   X時 + N分
//   :30       X時 + 半
//   :35-:55   (X+1)時 + まで + あと + (60-N)分   ("it is N minutes until X o'clock")
// Rows 1-4 carry a contiguous X時半 run for every hour 1-12, so the plain hour is that run
// minus its 半. Minute phrases repeat across rows 5-9 so a monotonic reading-order path exists
// both after the hour and after あと — same first-occurrence-after rule as the Chinese face.
import { word, type LanguageDef, type WordCoord } from '../types';

const ROWS = [
  '現在の時刻は六午前午後',
  '一四時半七八分時九二五',
  '五時半七時半二十一時半',
  '十二時半十時半八時半一',
  '九時半六時半三時半です',
  '二十五分六九五分四まで',
  'あと三五分十分八二六七',
  '二十分九時六一十五分八',
  '四二十五分二十分六九三',
  '六十五分二四三一五です',
];

const GENZAI = word('現在の時刻は', 0, 0);
// The face carries 午前/午後 but the reference photo lights neither — kept as spare words
const GOZEN = word('午前', 0, 7);
const GOGO = word('午後', 0, 9);
const MADE = word('まで', 5, 9);
const ATO = word('あと', 6, 0);
const DESU_EARLY = word('です', 4, 9);
const DESU_LATE = word('です', 9, 9);

// index 0 = twelve; 一時 lives inside 十一時 and 二時 inside 十二時
const HOURS = [
  word('十二時', 3, 0),
  word('一時', 2, 8),
  word('二時', 3, 1),
  word('三時', 4, 6),
  word('四時', 1, 1),
  word('五時', 2, 0),
  word('六時', 4, 3),
  word('七時', 2, 3),
  word('八時', 3, 7),
  word('九時', 4, 0),
  word('十時', 3, 4),
  word('十一時', 2, 7),
];

// Every hour run is immediately followed by its 半 cell
const HALVES = HOURS.map((h) => word('半', h.row, h.end + 1));

const MINUTE_TEXT: Record<number, string> = {
  5: '五分',
  10: '十分',
  15: '十五分',
  20: '二十分',
  25: '二十五分',
};

function findAfter(text: string, prev: WordCoord): WordCoord {
  for (let r = prev.row; r < ROWS.length; r++) {
    const i = ROWS[r].indexOf(text, r === prev.row ? prev.end + 1 : 0);
    if (i !== -1) return word(text, r, i);
  }
  throw new Error(`no ${text} after ${prev.text}`);
}

function phrase(hours: number, minutes: number): WordCoord[] {
  const m = Math.floor(minutes / 5) * 5;
  if (m === 0) return [HOURS[hours % 12], DESU_EARLY];
  if (m === 30) return [HOURS[hours % 12], HALVES[hours % 12], DESU_EARLY];
  if (m < 30) {
    const hour = HOURS[hours % 12];
    return [hour, findAfter(MINUTE_TEXT[m], hour), DESU_LATE];
  }
  return [HOURS[(hours + 1) % 12], MADE, ATO, findAfter(MINUTE_TEXT[60 - m], ATO), DESU_LATE];
}

export const japanese: LanguageDef = {
  id: 'ja',
  name: 'Japanese',
  sample: '七時半です',
  rows: ROWS,
  itIs: [GENZAI],
  words: [GENZAI, GOZEN, GOGO, MADE, ATO, DESU_EARLY, DESU_LATE, ...HOURS, ...HALVES],
  phrase,
};
