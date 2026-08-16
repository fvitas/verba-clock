// Matrix sources: https://github.com/vulture20/QLOCKGENERATOR/blob/master/src/app/configs/languages.ts
// and https://github.com/ukw100/wordclock24h/blob/master/make-tables/tables12h-ch1.c (identical)
// Phrase logic cross-checked with https://github.com/bracci/Qlockthree/blob/master/Renderer.cpp (LANGUAGE_CH)
import { word, type LanguageDef, type WordCoord } from '../types';

const ES = word('ES', 0, 0);
const ISCH = word('ISCH', 0, 3);
const FUEF_MIN = word('FÜF', 0, 8);
const VIERTU = word('VIERTU', 1, 0);
const ZAEAE = word('ZÄÄ', 1, 8);
const ZWAENZG = word('ZWÄNZG', 2, 0);
const VOR = word('VOR', 2, 8);
const AB = word('AB', 3, 0);
const HAUBI = word('HAUBI', 3, 3);
const EIS = word('EIS', 4, 0);
const ZWOEI = word('ZWÖI', 4, 3);
const DRUE = word('DRÜ', 4, 8);
const VIERI = word('VIERI', 5, 0);
const FUEFI = word('FÜFI', 5, 5);
const SAECHSI = word('SÄCHSI', 6, 0);
const SIBNI = word('SIBNI', 6, 6);
const ACHTI = word('ACHTI', 7, 0);
const NUENI = word('NÜNI', 7, 5);
const ZAENI = word('ZÄNI', 8, 0);
const EUFI = word('EUFI', 8, 7);
const ZWOEUFI = word('ZWÖUFI', 9, 0);

const HOURS = [ZWOEUFI, EIS, ZWOEI, DRUE, VIERI, FUEFI, SAECHSI, SIBNI, ACHTI, NUENI, ZAENI, EUFI];

// Swiss German pivots around HAUBI of the NEXT hour from :25
const MINUTES: Record<number, { words: WordCoord[]; nextHour: boolean }> = {
  0: { words: [], nextHour: false },
  5: { words: [FUEF_MIN, AB], nextHour: false },
  10: { words: [ZAEAE, AB], nextHour: false },
  15: { words: [VIERTU, AB], nextHour: false },
  20: { words: [ZWAENZG, AB], nextHour: false },
  25: { words: [FUEF_MIN, VOR, HAUBI], nextHour: true },
  30: { words: [HAUBI], nextHour: true },
  35: { words: [FUEF_MIN, AB, HAUBI], nextHour: true },
  40: { words: [ZWAENZG, VOR], nextHour: true },
  45: { words: [VIERTU, VOR], nextHour: true },
  50: { words: [ZAEAE, VOR], nextHour: true },
  55: { words: [FUEF_MIN, VOR], nextHour: true },
};

function phrase(hours: number, minutes: number): WordCoord[] {
  const m = Math.floor(minutes / 5) * 5;
  const { words, nextHour } = MINUTES[m];
  return [...words, HOURS[(nextHour ? hours + 1 : hours) % 12]];
}

export const swissGerman: LanguageDef = {
  id: 'ch',
  name: 'Schwiizerdütsch',
  sample: 'ES ISCH',
  rows: [
    'ESKISCHAFÜF',
    'VIERTUBFZÄÄ',
    'ZWÄNZGSIVOR',
    'ABOHAUBIEPM',
    'EISZWÖISDRÜ',
    'VIERIFÜFIQT',
    'SÄCHSISIBNI',
    'ACHTINÜNIEL',
    'ZÄNIERBEUFI',
    'ZWÖUFIAMUHR',
  ],
  itIs: [ES, ISCH],
  words: [ES, ISCH, FUEF_MIN, VIERTU, ZAEAE, ZWAENZG, VOR, AB, HAUBI, EIS, ZWOEI, DRUE, VIERI, FUEFI, SAECHSI, SIBNI, ACHTI, NUENI, ZAENI, EUFI, ZWOEUFI],
  phrase,
};
