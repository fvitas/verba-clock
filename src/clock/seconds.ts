import { cellKey } from './engine';

export const DIGITS: Record<string, string[]> = {
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  '3': ['11111', '00010', '00100', '00010', '00001', '10001', '01110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  '6': ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
};

// Digits use the letter grid as pixels, like the hardware's seconds display
export function resolveSeconds(seconds: number, cols = 11, rows = 10): ReadonlySet<string> {
  const text = String(seconds).padStart(2, '0');
  const rowOffset = Math.floor((rows - 7) / 2);
  const lit = new Set<string>();
  [...text].forEach((digit, index) => {
    const colOffset = index === 0 ? 0 : cols - 5;
    DIGITS[digit].forEach((line, r) => {
      [...line].forEach((bit, c) => {
        if (bit === '1') lit.add(cellKey(rowOffset + r, colOffset + c));
      });
    });
  });
  return lit;
}
