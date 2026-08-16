// Matrix sources: https://github.com/vulture20/QLOCKGENERATOR/blob/master/src/app/configs/languages.ts
// and https://github.com/bramp/wordclock/blob/master/lib/languages/natural/catalan.dart (reference grid, identical)
// Phrase logic cross-checked between bramp catalan_time_to_words.dart and cdmoro/wordoclock ca-ES.ts examples
// Catalan counts bell quarters toward the NEXT hour: 1:15 = "és un quart de dues"
import { word, type LanguageDef, type WordCoord } from '../types';

const ES = word('ÉS', 0, 0);
const SON = word('SÓN', 0, 1);
const LA = word('LA', 0, 5);
const UNA_SIMPLE = word('UNA', 0, 8);
const UN_COUNT = word('UN', 0, 8);
const DOS_COUNT = word('DOS', 1, 0);
const LES = word('LES', 1, 3);
const TRES_COUNT = word('TRES', 1, 7);
const CINC_HOUR = word('CINC', 2, 0);
const QUART = word('QUART', 2, 4);
const QUARTS = word('QUARTS', 2, 4);
const MENYS = word('MENYS', 3, 0);
const I = word('I', 3, 5);
const CINC_MIN = word('CINC', 3, 7);
const DE = word('DE', 4, 0);
const D_APOS = word('D', 4, 2);
const UNA_QUART = word('UNA', 4, 4);
const ONZE_QUART = word('ONZE', 4, 7);
const DUES = word('DUES', 5, 0);
const TRES_HOUR = word('TRES', 5, 4);
const SET = word('SET', 5, 7);
const QUATRE = word('QUATRE', 6, 0);
const DOTZE = word('DOTZE', 6, 6);
const VUIT = word('VUIT', 7, 0);
const NOU = word('NOU', 7, 4);
const ONZE_HOUR = word('ONZE', 7, 7);
const SIS = word('SIS', 8, 0);
const DEU = word('DEU', 8, 5);
const MENYS_2 = word('MENYS', 9, 0);
const I_2 = word('I', 9, 5);
const CINC_2 = word('CINC', 9, 7);

const HOURS_SIMPLE = [DOTZE, UNA_SIMPLE, DUES, TRES_HOUR, QUATRE, CINC_HOUR, SIS, SET, VUIT, NOU, DEU, ONZE_HOUR];

// In quart phrases the hour follows DE/D', so UNA/ONZE/CINC use later grid cells
function quartHour(dh: number): WordCoord[] {
  if (dh === 1) return [D_APOS, UNA_QUART];
  if (dh === 11) return [D_APOS, ONZE_QUART];
  if (dh === 5) return [DE, CINC_2];
  return [DE, HOURS_SIMPLE[dh]];
}

const QUART_WORDS: Record<number, WordCoord[]> = {
  10: [UN_COUNT, QUART, MENYS, CINC_MIN],
  15: [UN_COUNT, QUART],
  20: [UN_COUNT, QUART, I, CINC_MIN],
  25: [DOS_COUNT, QUARTS, MENYS, CINC_MIN],
  30: [DOS_COUNT, QUARTS],
  35: [DOS_COUNT, QUARTS, I, CINC_MIN],
  40: [TRES_COUNT, QUARTS, MENYS, CINC_MIN],
  45: [TRES_COUNT, QUARTS],
  50: [TRES_COUNT, QUARTS, I, CINC_MIN],
};

const bucket = (minutes: number): number => Math.floor(minutes / 5) * 5;
const isQuart = (m: number): boolean => m >= 10 && m <= 50;
const displayHour = (hours: number, m: number): number => (m >= 10 ? hours + 1 : hours) % 12;

function itIsFor(hours: number, minutes: number): WordCoord[] {
  const m = bucket(minutes);
  if (isQuart(m)) return m < 25 ? [ES] : [SON];
  return displayHour(hours, m) === 1 ? [ES, LA] : [SON, LES];
}

function phrase(hours: number, minutes: number): WordCoord[] {
  const m = bucket(minutes);
  const dh = displayHour(hours, m);
  if (m === 5) return [HOURS_SIMPLE[dh], I_2, CINC_2];
  if (m === 55) return [HOURS_SIMPLE[dh], MENYS_2, CINC_2];
  if (isQuart(m)) return [...QUART_WORDS[m], ...quartHour(dh)];
  return [HOURS_SIMPLE[dh]];
}

export const catalan: LanguageDef = {
  id: 'ca',
  name: 'Català',
  sample: 'ÉS LA',
  rows: [
    'ÉSÓNRLAMUNA',
    'DOSLESNTRES',
    'CINCQUARTSU',
    'MENYSIECINC',
    'DEDRUNAONZE',
    'DUESTRESETD',
    'QUATREDOTZE',
    'VUITNOUONZE',
    'SISAMDEUNPM',
    'MENYSIACINC',
  ],
  itIs: [SON, LES],
  itIsFor,
  cellOverrides: { '4:2': "D'" },
  words: [ES, SON, LA, UNA_SIMPLE, UN_COUNT, DOS_COUNT, LES, TRES_COUNT, CINC_HOUR, QUART, QUARTS, MENYS, I, CINC_MIN, DE, D_APOS, UNA_QUART, ONZE_QUART, DUES, TRES_HOUR, SET, QUATRE, DOTZE, VUIT, NOU, ONZE_HOUR, SIS, DEU, MENYS_2, I_2, CINC_2],
  phrase,
};
