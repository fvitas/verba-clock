import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { LANGUAGES } from '../src/clock/languages';

const HERE = dirname(fileURLToPath(import.meta.url));
const read = (file: string): string => readFileSync(join(HERE, '../ios/App/VerbaWidgets', file), 'utf8');

const faceData = JSON.parse(read('FaceData.json')) as { languages: { id: string; dir?: string }[] };
const exportedIds = faceData.languages.map((lang) => lang.id);

// The widget's language picker is a hand-written Swift enum — this is the guard that keeps it
// in step with the generated face data
const pickerIds = (() => {
  const swift = read('ConfigIntent.swift');
  const cases = /case sameAsApp\s+case ([^\n]+)/.exec(swift);
  if (!cases) throw new Error('could not find WidgetLanguage cases');
  return cases[1].split(',').map((entry) => entry.trim());
})();

describe('widget face data', () => {
  it('exports every language the SwiftUI renderer can draw', () => {
    const drawable = LANGUAGES.filter((lang) => lang.layout !== 'word').map((lang) => lang.id);
    expect(exportedIds).toEqual(drawable);
  });

  it('skips word-grid faces, which have no widget view', () => {
    const wordGrid = LANGUAGES.filter((lang) => lang.layout === 'word').map((lang) => lang.id);
    expect(wordGrid.length).toBeGreaterThan(0);
    for (const id of wordGrid) expect(exportedIds).not.toContain(id);
  });

  it('offers every exported language in the widget picker', () => {
    expect([...pickerIds].sort()).toEqual([...exportedIds].sort());
  });

  it('names every picker case in the display representations', () => {
    const swift = read('ConfigIntent.swift');
    const shown = swift.slice(swift.indexOf('caseDisplayRepresentations: [WidgetLanguage'));
    for (const id of pickerIds) expect(shown).toContain(`.${id}: "`);
  });

  it('marks RTL faces so the widget can flip its layout direction', () => {
    const rtl = LANGUAGES.filter((lang) => lang.dir === 'rtl' && lang.layout !== 'word').map((lang) => lang.id);
    expect(rtl).toContain('he');
    for (const lang of faceData.languages) {
      expect(lang.dir).toBe(rtl.includes(lang.id) ? 'rtl' : undefined);
    }
  });
});
