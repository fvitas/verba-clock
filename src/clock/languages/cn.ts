// Matrix source: https://github.com/vulture20/QLOCKGENERATOR/blob/master/src/app/configs/languages.ts
// (CS simplified cross-checked against its CT traditional twin, which resolves the CS file's
// two gaps: row 1 一 and row 6 一零). Confirmed against a QLOCKTWO photo at 7:30
// (mockups/reference-languages/cn-chinese.png): lit 现在 时间 上午 七点半, with 是 unlit.
// Phrase construction: hour word + first occurrence of the minute phrase AFTER the hour in
// reading order — the grid's duplicate minute phrases exist exactly for this; verified for
// all 144 hour/minute-step combinations in cn.test.ts.
import { word, type LanguageDef, type WordCoord } from '../types';

const ROWS = [
  '现在是时间昼上午下午夜',
  '十一点半四点五点半六八',
  '七点半一九点半四十五分',
  '四十分三十五分零五分七',
  '六二十五分二十分五十分',
  '五三点半六点十二点半点',
  '十点八点三十分一零五分',
  '六三五十五分二十五分整',
  '三四十五分五十分二十分',
  '二十分八四十分三十五分',
];

const XIANZAI = word('现在', 0, 0);
const SHIJIAN = word('时间', 0, 3);
const ZHOU = word('昼', 0, 5);
const SHANGWU = word('上午', 0, 6);
const XIAWU = word('下午', 0, 8);
const YE = word('夜', 0, 10);

// 二点 lives inside 十二点, 一点 inside 十一点 — same overlap trick as the Serbian matrix
const HOURS = [
  word('十二点', 5, 6),
  word('一点', 1, 1),
  word('二点', 5, 7),
  word('三点', 5, 1),
  word('四点', 1, 4),
  word('五点', 1, 6),
  word('六点', 5, 4),
  word('七点', 2, 0),
  word('八点', 6, 2),
  word('九点', 2, 4),
  word('十点', 6, 0),
  word('十一点', 1, 0),
];

const MINUTE_TEXT: Record<number, string> = {
  0: '整',
  5: '零五分',
  10: '十分',
  15: '十五分',
  20: '二十分',
  25: '二十五分',
  35: '三十五分',
  40: '四十分',
  45: '四十五分',
  50: '五十分',
  55: '五十五分',
};

function findAfter(text: string, row: number, col: number): WordCoord | null {
  for (let r = row; r < ROWS.length; r++) {
    const i = ROWS[r].indexOf(text, r === row ? col + 1 : 0);
    if (i !== -1) return word(text, r, i);
  }
  return null;
}

function minuteWord(hour: WordCoord, m: number): WordCoord {
  // :30 is X点半 where a 半 is reachable; 八点/十点 sit past the last 半 and use 三十分
  const found =
    m === 30
      ? (findAfter('半', hour.row, hour.end) ?? findAfter('三十分', hour.row, hour.end))
      : findAfter(MINUTE_TEXT[m], hour.row, hour.end);
  if (!found) throw new Error(`no minute phrase for ${hour.text} :${m}`);
  return found;
}

// Provisional day-period rule — only 上午 at 7:30 is photo-confirmed; refine when more references arrive
function periodFor(hours: number): WordCoord {
  const h = hours % 24;
  if (h >= 19 || h < 5) return YE;
  if (h < 12) return SHANGWU;
  if (h < 13) return ZHOU;
  return XIAWU;
}

function phrase(hours: number, minutes: number): WordCoord[] {
  const m = Math.floor(minutes / 5) * 5;
  const hour = HOURS[hours % 12];
  return [periodFor(hours), hour, minuteWord(hour, m)];
}

export const chinese: LanguageDef = {
  id: 'cn',
  name: 'Chinese',
  sample: '现在时间',
  rows: ROWS,
  itIs: [XIANZAI, SHIJIAN],
  words: [XIANZAI, SHIJIAN, ZHOU, SHANGWU, XIAWU, YE, ...HOURS],
  phrase,
};
