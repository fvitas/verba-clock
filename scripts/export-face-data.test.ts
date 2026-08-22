import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { LANGUAGES } from '../src/clock/languages';

const HERE = dirname(fileURLToPath(import.meta.url));
const read = (dir: string, file: string): string => readFileSync(join(HERE, '../ios/App', dir, file), 'utf8');
// The face data lives in the shared package; the intent stays in the widget extension
const readFaceKit = (file: string): string => read('VerbaFaceKit/Sources/VerbaFaceKit/Resources', file);
const readWidgets = (file: string): string => read('VerbaWidgets', file);

const faceData = JSON.parse(readFaceKit('FaceData.json')) as {
  languages: { id: string; dir?: string; layout?: string; rows: string[] }[];
};
const exportedIds = faceData.languages.map((lang) => lang.id);

// The widget's language picker is a hand-written Swift enum — this is the guard that keeps it
// in step with the generated face data
const pickerIds = (() => {
  const swift = readWidgets('ConfigIntent.swift');
  const cases = /case sameAsApp\s+case ([^\n]+)/.exec(swift);
  if (!cases) throw new Error('could not find WidgetLanguage cases');
  return cases[1].split(',').map((entry) => entry.trim());
})();

describe('widget face data', () => {
  it('exports every language', () => {
    expect(exportedIds).toEqual(LANGUAGES.map((lang) => lang.id));
  });

  it('marks word-grid faces so the widget picks the slot renderer', () => {
    const wordGrid = LANGUAGES.filter((lang) => lang.layout === 'word').map((lang) => lang.id);
    expect(wordGrid).toContain('ar');
    for (const lang of faceData.languages) {
      expect(lang.layout).toBe(wordGrid.includes(lang.id) ? 'word' : undefined);
    }
  });

  it('offers every exported language in the widget picker', () => {
    expect([...pickerIds].sort()).toEqual([...exportedIds].sort());
  });

  it('names every picker case in the display representations', () => {
    const swift = readWidgets('ConfigIntent.swift');
    const shown = swift.slice(swift.indexOf('caseDisplayRepresentations: [WidgetLanguage'));
    for (const id of pickerIds) expect(shown).toContain(`.${id}: "`);
  });

  it('marks RTL faces so the widget can flip its layout direction', () => {
    const rtl = LANGUAGES.filter((lang) => lang.dir === 'rtl').map((lang) => lang.id);
    expect(rtl).toEqual(expect.arrayContaining(['he', 'ar']));
    for (const lang of faceData.languages) {
      expect(lang.dir).toBe(rtl.includes(lang.id) ? 'rtl' : undefined);
    }
  });

  // FaceMoment keys lit cells as row * 11 + col, so a row may never hold more than 11 slots
  it('keeps every row within the 11-cell stride the widget hashes on', () => {
    for (const lang of faceData.languages) {
      const cells = (row: string) => (lang.layout === 'word' ? row.split(' ').length : row.length);
      for (const row of lang.rows) expect(cells(row)).toBeLessThanOrEqual(11);
    }
  });
});
