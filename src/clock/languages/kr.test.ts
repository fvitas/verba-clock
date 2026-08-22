import { describe, expect, it } from 'vitest';
import { korean } from './kr';

// Hours light syllable by syllable: 열두 = 열 + 두 across the dark 한
function spell(hours: number, minutes: number): string {
  return [...korean.itIs, ...korean.phrase(hours, minutes)].map((w) => w.text).join(' ');
}

describe('korean grid integrity', () => {
  it('is an 11x10 matrix', () => {
    expect(korean.rows).toHaveLength(10);
    for (const row of korean.rows) expect(row).toHaveLength(11);
  });

  it('every word coordinate spells its text in the grid', () => {
    for (const w of korean.words) {
      expect(korean.rows[w.row].slice(w.start, w.end + 1)).toBe(w.text);
    }
  });

  it('every phrase reads strictly top-left to bottom-right', () => {
    for (let hours = 0; hours < 24; hours++) {
      for (let minutes = 0; minutes < 60; minutes += 5) {
        const lit = [...korean.itIs, ...korean.phrase(hours, minutes)];
        for (let i = 1; i < lit.length; i++) {
          const prev = lit[i - 1];
          const cur = lit[i];
          expect(cur.row * 100 + cur.start).toBeGreaterThan(prev.row * 100 + prev.end);
        }
      }
    }
  });
});

describe('korean hours (native numerals, :00)', () => {
  it.each([
    [1, '지금 시각은 새벽 한 시 정각 입니다'],
    [2, '지금 시각은 새벽 두 시 정각 입니다'],
    [3, '지금 시각은 새벽 세 시 정각 입니다'],
    [4, '지금 시각은 새벽 네 시 정각 입니다'],
    [5, '지금 시각은 새벽 다섯 시 정각 입니다'],
    [6, '지금 시각은 아침 여섯 시 정각 입니다'],
    [7, '지금 시각은 아침 일곱 시 정각 입니다'],
    [8, '지금 시각은 아침 여덟 시 정각 입니다'],
    [9, '지금 시각은 아침 아홉 시 정각 입니다'],
    [10, '지금 시각은 아침 열 시 정각 입니다'],
    [11, '지금 시각은 아침 열 한 시 정각 입니다'],
    [12, '지금 시각은 오후 열 두 시 정각 입니다'],
  ])('%i:00', (hours, expected) => {
    expect(spell(hours, 0)).toBe(expected);
  });
});

describe('korean minute words (sino-korean, contiguous runs)', () => {
  it.each([
    [7, 5, '지금 시각은 아침 일곱 시 오분 입니다'],
    [7, 10, '지금 시각은 아침 일곱 시 십분 입니다'],
    [7, 15, '지금 시각은 아침 일곱 시 십오분 입니다'],
    [7, 20, '지금 시각은 아침 일곱 시 이십분 입니다'],
    [7, 25, '지금 시각은 아침 일곱 시 이십오분 입니다'],
    // 반 is preferred over 삼십분 in speech, matching the Japanese face's 半
    [7, 30, '지금 시각은 아침 일곱 시 반 입니다'],
    [7, 35, '지금 시각은 아침 일곱 시 삼십오분 입니다'],
    [7, 40, '지금 시각은 아침 일곱 시 사십분 입니다'],
    [7, 45, '지금 시각은 아침 일곱 시 사십오분 입니다'],
    [7, 50, '지금 시각은 아침 일곱 시 오십분 입니다'],
    [7, 55, '지금 시각은 아침 일곱 시 오십오분 입니다'],
  ])('%i:%i', (hours, minutes, expected) => {
    expect(spell(hours, minutes)).toBe(expected);
  });

  it('never rolls the hour over — Korean names the current hour throughout', () => {
    expect(spell(7, 55)).toContain('일곱');
    expect(spell(23, 55)).toContain('열 한');
  });
});

describe('korean day periods', () => {
  it.each([
    [0, '새벽'],
    [5, '새벽'],
    [6, '아침'],
    [11, '아침'],
    [12, '오후'],
    [17, '오후'],
    [18, '저녁'],
    [20, '저녁'],
    [21, '밤'],
    [23, '밤'],
  ])('%i:00 is %s', (hours, expected) => {
    expect(korean.phrase(hours, 0)[0].text).toBe(expected);
  });

  it('rounds down to the last five-minute step', () => {
    expect(spell(7, 4)).toBe(spell(7, 0));
    expect(spell(7, 34)).toBe(spell(7, 30));
  });
});
