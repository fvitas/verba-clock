import { describe, expect, it } from 'vitest';
import { ukrainian } from './ua';

// Words spell in fragments exactly as the face lights them (ДВА ДЦЯТЬ = ДВАДЦЯТЬ),
// and the hour stem is followed by its case-ending cell (СЬОМ + А = сьома)
function spell(hours: number, minutes: number): string {
  return [...ukrainian.itIs, ...ukrainian.phrase(hours, minutes)]
    .sort((a, b) => a.row - b.row || a.start - b.start)
    .map((w) => w.text)
    .join(' ');
}

describe('ukrainian grid integrity', () => {
  it('is an 11x10 matrix', () => {
    expect(ukrainian.rows).toHaveLength(10);
    for (const row of ukrainian.rows) expect(row).toHaveLength(11);
  });

  it('every word coordinate spells its text in the grid', () => {
    for (const w of ukrainian.words) {
      expect(ukrainian.rows[w.row].slice(w.start, w.end + 1)).toBe(w.text);
    }
  });

  it('every apostrophe cell keeps the grid letter it overrides', () => {
    for (const [cell, display] of Object.entries(ukrainian.cellOverrides ?? {})) {
      const [row, col] = cell.split(':').map(Number);
      expect(display.startsWith(ukrainian.rows[row][col])).toBe(true);
    }
  });

  it('every phrase reads strictly top-left to bottom-right', () => {
    for (let hours = 0; hours < 24; hours++) {
      for (let minutes = 0; minutes < 60; minutes += 5) {
        const lit = [...ukrainian.itIs, ...ukrainian.phrase(hours, minutes)];
        for (let i = 1; i < lit.length; i++) {
          const prev = lit[i - 1];
          const cur = lit[i];
          expect(cur.row * 100 + cur.start).toBeGreaterThan(prev.row * 100 + prev.end);
        }
      }
    }
  });
});

describe('ukrainian ordinal hours (nominative, :00)', () => {
  it.each([
    [1, 'ЗАРАЗ ПЕРШ А ГОДИНА'],
    [2, 'ЗАРАЗ ДРУГ А ГОДИНА'],
    [3, 'ЗАРАЗ ТРЕТ Я ГОДИНА'],
    [4, 'ЗАРАЗ ЧЕТВЕРТ А ГОДИНА'],
    [5, 'ЗАРАЗ ПЯТ А ГОДИНА'],
    [6, 'ЗАРАЗ ШОСТ А ГОДИНА'],
    [7, 'ЗАРАЗ СЬОМ А ГОДИНА'],
    [8, 'ЗАРАЗ ВОСЬМ А ГОДИНА'],
    [9, 'ЗАРАЗ ДЕ ВЯТ А ГОДИНА'],
    [10, 'ЗАРАЗ ДЕ СЯТ А ГОДИНА'],
    [11, 'ЗАРАЗ ОДИ НАДЦЯТ А ГОДИНА'],
    [12, 'ЗАРАЗ ДВА НАДЦЯТ А ГОДИНА'],
  ])('%i:00', (hours, expected) => {
    expect(spell(hours, 0)).toBe(expected);
  });
});

describe('ukrainian time phrases (ordinal system)', () => {
  it.each([
    // п'ять на восьму
    [7, 5, 'ЗАРАЗ ПЯТЬ НА ВОСЬМ У'],
    [7, 10, 'ЗАРАЗ ДЕСЯТЬ НА ВОСЬМ У'],
    [7, 15, 'ЗАРАЗ ПЯТНАДЦЯТЬ НА ВОСЬМ У'],
    [7, 20, 'ЗАРАЗ ДВА ДЦЯТЬ НА ВОСЬМ У'],
    [7, 25, 'ЗАРАЗ ДВА ДЦЯТЬ ПЯТЬ НА ВОСЬМ У'],
    // пів на восьму
    [7, 30, 'ЗАРАЗ ПІВ НА ВОСЬМ У'],
    // за двадцять п'ять восьма
    [7, 35, 'ЗАРАЗ ЗА ДВА ДЦЯТЬ ПЯТЬ ВОСЬМ А'],
    [7, 40, 'ЗАРАЗ ЗА ДВА ДЦЯТЬ ВОСЬМ А'],
    [7, 45, 'ЗАРАЗ ЗА ПЯТНАДЦЯТЬ ВОСЬМ А'],
    [7, 50, 'ЗАРАЗ ЗА ДЕСЯТЬ ВОСЬМ А'],
    [7, 55, 'ЗАРАЗ ЗА ПЯТЬ ВОСЬМ А'],
    // третя takes -Я/-Ю, not -А/-У
    [2, 30, 'ЗАРАЗ ПІВ НА ТРЕТ Ю'],
    [14, 20, 'ЗАРАЗ ДВА ДЦЯТЬ НА ТРЕТ Ю'],
    [2, 45, 'ЗАРАЗ ЗА ПЯТНАДЦЯТЬ ТРЕТ Я'],
    // rollovers
    [12, 30, 'ЗАРАЗ ПІВ НА ПЕРШ У'],
    [11, 30, 'ЗАРАЗ ПІВ НА ДВА НАДЦЯТ У'],
    [23, 50, 'ЗАРАЗ ЗА ДЕСЯТЬ ДВА НАДЦЯТ А'],
    [0, 5, 'ЗАРАЗ ПЯТЬ НА ПЕРШ У'],
    [20, 0, 'ЗАРАЗ ВОСЬМ А ГОДИНА'],
  ])('%i:%i', (hours, minutes, expected) => {
    expect(spell(hours, minutes)).toBe(expected);
  });

  it('rounds down to the last five-minute step', () => {
    expect(spell(7, 4)).toBe(spell(7, 0));
    expect(spell(7, 34)).toBe(spell(7, 30));
  });
});
