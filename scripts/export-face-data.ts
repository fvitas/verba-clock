import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LANGUAGES } from '../src/clock/languages';
import type { WordCoord } from '../src/clock/types';

// Precomputes every displayable state so native renderers never re-implement
// the phrase engine. 24h x 12 five-minute buckets = 288 states per language.
type ExportedWord = { t: string; r: number; s: number; e: number };
type ExportedState = { i: number[]; p: number[] };
type ExportedLanguage = {
  id: string;
  name: string;
  rows: string[];
  cellOverrides?: Record<string, string>;
  words: ExportedWord[];
  states: ExportedState[];
};

const OUT = join(dirname(fileURLToPath(import.meta.url)), '../ios/App/VerbaWidgets/FaceData.json');

function exportLanguage(lang: (typeof LANGUAGES)[number]): ExportedLanguage {
  const words: ExportedWord[] = [];
  const indexOf = new Map<string, number>();
  const intern = (w: WordCoord): number => {
    const key = `${w.row}:${w.start}:${w.end}:${w.text}`;
    let idx = indexOf.get(key);
    if (idx === undefined) {
      idx = words.push({ t: w.text, r: w.row, s: w.start, e: w.end }) - 1;
      indexOf.set(key, idx);
    }
    return idx;
  };

  const states: ExportedState[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let bucket = 0; bucket < 12; bucket++) {
      const minutes = bucket * 5;
      const itIs = lang.itIsFor ? lang.itIsFor(hour, minutes) : lang.itIs;
      states.push({ i: itIs.map(intern), p: lang.phrase(hour, minutes).map(intern) });
    }
  }

  return {
    id: lang.id,
    name: lang.name,
    rows: lang.rows,
    ...(lang.cellOverrides ? { cellOverrides: lang.cellOverrides } : {}),
    words,
    states,
  };
}

// The SwiftUI widget renderer draws left-to-right letter matrices, so word-grid faces
// (Arabic) and RTL faces (Hebrew) stay app-only until it learns both
const appOnly = (lang: (typeof LANGUAGES)[number]): boolean => lang.layout === 'word' || lang.dir === 'rtl';
const exportable = LANGUAGES.filter((lang) => !appOnly(lang));
const skipped = LANGUAGES.filter(appOnly);

const data = { version: 1, languages: exportable.map(exportLanguage) };
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(data));
console.log(`Wrote ${OUT}: ${data.languages.length} languages`);
if (skipped.length > 0) console.log(`Skipped app-only faces (no widget support): ${skipped.map((lang) => lang.id).join(', ')}`);
