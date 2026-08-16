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
  words: WordCoord[];
  phrase: (hours: number, minutes: number) => WordCoord[];
};

export const word = (text: string, row: number, start: number): WordCoord => ({
  text,
  row,
  start,
  end: start + text.length - 1,
});
