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
  dir?: 'rtl';
  layout?: 'word';
  cellOverrides?: Record<string, string>;
  words: ExportedWord[];
  states: ExportedState[];
};

const HERE = dirname(fileURLToPath(import.meta.url));
// Both native renderers read the same file — iOS from the VerbaFaceKit package bundle
// (shared by the widgets and the watch app), Android from assets
const OUTS = [
  join(HERE, '../ios/App/VerbaFaceKit/Sources/VerbaFaceKit/Resources/FaceData.json'),
  join(HERE, '../android/app/src/main/assets/FaceData.json'),
];

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
    ...(lang.dir ? { dir: lang.dir } : {}),
    ...(lang.layout ? { layout: lang.layout } : {}),
    ...(lang.cellOverrides ? { cellOverrides: lang.cellOverrides } : {}),
    words,
    states,
  };
}

// Every face ships: the SwiftUI renderer draws letter grids and word grids, and flips
// either one for RTL via layoutDirection
const data = { version: 1, languages: LANGUAGES.map(exportLanguage) };
const json = JSON.stringify(data);
for (const out of OUTS) {
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, json);
  console.log(`Wrote ${out}: ${data.languages.length} languages`);
}
