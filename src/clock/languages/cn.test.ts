import { describe, expect, it } from 'vitest';
import { chinese } from './cn';

function spell(hours: number, minutes: number): string {
  return [...chinese.itIs, ...chinese.phrase(hours, minutes)]
    .sort((a, b) => a.row - b.row || a.start - b.start)
    .map((w) => w.text)
    .join('');
}

describe('chinese grid integrity', () => {
  it('is an 11x10 matrix', () => {
    expect(chinese.rows).toHaveLength(10);
    for (const row of chinese.rows) expect(row).toHaveLength(11);
  });

  it('every word coordinate spells its text in the grid', () => {
    for (const w of chinese.words) {
      expect(chinese.rows[w.row].slice(w.start, w.end + 1)).toBe(w.text);
    }
  });

  it('every phrase reads strictly top-left to bottom-right and spells its text', () => {
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 5) {
        const coords = chinese.phrase(h, m);
        for (const w of coords) {
          expect(chinese.rows[w.row].slice(w.start, w.end + 1)).toBe(w.text);
        }
        const [period, hour, minute] = coords;
        expect(period.row).toBe(0);
        expect(hour.row * 100 + hour.start).toBeGreaterThan(period.row * 100 + period.end);
        expect(minute.row * 100 + minute.start).toBeGreaterThan(hour.row * 100 + hour.end);
      }
    }
  });
});

describe('chinese time phrases', () => {
  it('matches the 7:30 reference photo: 现在时间上午七点半 with the 半 right after 七点', () => {
    expect(spell(7, 30)).toBe('现在时间上午七点半');
    const half = chinese.phrase(7, 30).find((w) => w.text === '半');
    expect(half).toMatchObject({ row: 2, start: 2 });
  });

  it.each([
    [7, 0, '现在时间上午七点整'],
    [7, 5, '现在时间上午七点零五分'],
    [7, 10, '现在时间上午七点十分'],
    [7, 15, '现在时间上午七点十五分'],
    [7, 20, '现在时间上午七点二十分'],
    [7, 25, '现在时间上午七点二十五分'],
    [7, 35, '现在时间上午七点三十五分'],
    [7, 40, '现在时间上午七点四十分'],
    [7, 45, '现在时间上午七点四十五分'],
    [7, 50, '现在时间上午七点五十分'],
    [7, 55, '现在时间上午七点五十五分'],
    [8, 30, '现在时间上午八点三十分'],
    [22, 30, '现在时间夜十点三十分'],
    [1, 30, '现在时间夜一点半'],
    [14, 30, '现在时间下午二点半'],
    [3, 30, '现在时间夜三点半'],
    [16, 30, '现在时间下午四点半'],
    [5, 30, '现在时间上午五点半'],
    [18, 30, '现在时间下午六点半'],
    [9, 30, '现在时间上午九点半'],
    [11, 30, '现在时间上午十一点半'],
    [23, 30, '现在时间夜十一点半'],
    [0, 0, '现在时间夜十二点整'],
    [12, 0, '现在时间昼十二点整'],
    [12, 30, '现在时间昼十二点半'],
    [13, 0, '现在时间下午一点整'],
    [2, 2, '现在时间夜二点整'],
    [10, 45, '现在时间上午十点四十五分'],
  ])('%i:%i → "%s"', (hours, minutes, expected) => {
    expect(spell(hours, minutes)).toBe(expected);
  });
});
