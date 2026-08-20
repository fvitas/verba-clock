import { describe, expect, it } from 'vitest';
import { japanese } from './ja';

function spell(hours: number, minutes: number): string {
  return japanese
    .phrase(hours, minutes)
    .map((w) => japanese.rows[w.row].slice(w.start, w.end + 1))
    .join(' ');
}

const cellsOf = (hours: number, minutes: number): string[] =>
  [...japanese.itIs, ...japanese.phrase(hours, minutes)].flatMap((w) =>
    Array.from({ length: w.end - w.start + 1 }, (_, i) => `${w.row}:${w.start + i}`),
  );

describe('japanese grid integrity', () => {
  it('is an 11x10 left-to-right letter matrix', () => {
    expect(japanese.rows).toHaveLength(10);
    for (const row of japanese.rows) expect(row).toHaveLength(11);
    expect(japanese.dir).toBeUndefined();
    expect(japanese.layout).toBeUndefined();
    expect(japanese.cellOverrides).toBeUndefined();
  });

  it('every word coordinate spells its cell text in the grid', () => {
    for (const w of japanese.words) {
      expect(japanese.rows[w.row].slice(w.start, w.end + 1)).toBe(w.text);
    }
  });

  it('carries a contiguous X時半 run for all twelve hours', () => {
    for (let h = 0; h < 12; h++) {
      const [hour, han] = japanese.phrase(h, 30);
      expect(han.row).toBe(hour.row);
      expect(han.start).toBe(hour.end + 1);
      expect(japanese.rows[hour.row].slice(hour.start, han.end + 1)).toMatch(/^[一二三四五六七八九十]+時半$/);
    }
  });

  it('every phrase reads strictly top-left to bottom-right', () => {
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 5) {
        const coords = [...japanese.itIs, ...japanese.phrase(h, m)];
        for (let i = 1; i < coords.length; i++) {
          expect(coords[i].row * 100 + coords[i].start).toBeGreaterThan(
            coords[i - 1].row * 100 + coords[i - 1].end,
          );
        }
      }
    }
  });

  it('never lights the same cell twice (一時 sits inside 十一時)', () => {
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 5) {
        const cells = cellsOf(h, m);
        expect(new Set(cells).size).toBe(cells.length);
      }
    }
  });

  it('always closes with です', () => {
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 5) {
        const coords = japanese.phrase(h, m);
        expect(coords[coords.length - 1].text).toBe('です');
      }
    }
  });

  it('leaves 午前 and 午後 dark in every state, as the reference photo does', () => {
    const period = new Set(['0:7', '0:8', '0:9', '0:10']);
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 5) {
        expect(cellsOf(h, m).some((cell) => period.has(cell))).toBe(false);
      }
    }
  });

  it('prefixes 現在の時刻は as the "it is" words', () => {
    expect(japanese.itIs.map((w) => w.text)).toEqual(['現在の時刻は']);
    expect(japanese.itIs.map((w) => [w.row, w.start])).toEqual([[0, 0]]);
  });
});

describe('japanese time phrases', () => {
  it('matches the 7:30 reference photo: 七時半です', () => {
    expect(spell(7, 30)).toBe('七時 半 です');
    expect(japanese.phrase(7, 30).map((w) => [w.row, w.start])).toEqual([
      [2, 3],
      [2, 5],
      [4, 9],
    ]);
  });

  it.each([
    [7, 0, '七時 です'],
    [7, 5, '七時 五分 です'],
    [7, 10, '七時 十分 です'],
    [7, 15, '七時 十五分 です'],
    [7, 20, '七時 二十分 です'],
    [7, 25, '七時 二十五分 です'],
    [7, 35, '八時 まで あと 二十五分 です'],
    [7, 40, '八時 まで あと 二十分 です'],
    [7, 45, '八時 まで あと 十五分 です'],
    [7, 50, '八時 まで あと 十分 です'],
    [7, 55, '八時 まで あと 五分 です'],
    [1, 0, '一時 です'],
    [1, 30, '一時 半 です'],
    [2, 30, '二時 半 です'],
    [3, 15, '三時 十五分 です'],
    [4, 0, '四時 です'],
    [5, 30, '五時 半 です'],
    [6, 5, '六時 五分 です'],
    [8, 45, '九時 まで あと 十五分 です'],
    [9, 30, '九時 半 です'],
    [10, 20, '十時 二十分 です'],
    [11, 0, '十一時 です'],
    [11, 30, '十一時 半 です'],
    [11, 55, '十二時 まで あと 五分 です'],
    [12, 0, '十二時 です'],
    [0, 30, '十二時 半 です'],
    [19, 30, '七時 半 です'],
    [23, 45, '十二時 まで あと 十五分 です'],
  ])('%i:%i → "%s"', (hours, minutes, expected) => {
    expect(spell(hours, minutes)).toBe(expected);
  });

  it('counts down to the next hour from :35 (the face has まで and あと)', () => {
    expect(spell(7, 29)).toBe('七時 二十五分 です');
    expect(spell(7, 34)).toBe('七時 半 です');
    expect(spell(7, 35)).toBe('八時 まで あと 二十五分 です');
    expect(spell(7, 59)).toBe(spell(7, 55));
  });
});
