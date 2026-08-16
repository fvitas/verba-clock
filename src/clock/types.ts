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
  words: WordCoord[];
  phrase: (hours: number, minutes: number) => WordCoord[];
};

export const word = (text: string, row: number, start: number): WordCoord => ({
  text,
  row,
  start,
  end: start + text.length - 1,
});
