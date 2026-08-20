export type WordCoord = {
  text: string;
  row: number;
  start: number;
  end: number;
};

export type LanguageDef = {
  id: string;
  name: string;
  sample: string;
  rows: string[];
  itIs: WordCoord[];
  // For languages whose "it is" prefix depends on the time (e.g. Italian SONO LE vs È)
  itIsFor?: (hours: number, minutes: number) => WordCoord[];
  // Display text per "row:col" cell for in-cell apostrophes (e.g. Italian L', Catalan D')
  cellOverrides?: Record<string, string>;
  // Word-grid faces (cursive scripts like Arabic): rows are space-separated whole words,
  // WordCoord start/end index word slots (slot 0 = first in reading order), not letter columns
  layout?: 'word';
  dir?: 'rtl';
  words: WordCoord[];
  phrase: (hours: number, minutes: number) => WordCoord[];
};

export const word = (text: string, row: number, start: number): WordCoord => ({
  text,
  row,
  start,
  end: start + text.length - 1,
});

// One word occupying a single slot of a word-grid row
export const wordSlot = (text: string, row: number, slot: number): WordCoord => ({
  text,
  row,
  start: slot,
  end: slot,
});
