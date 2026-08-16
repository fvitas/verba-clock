// Matrix source: https://github.com/vulture20/QLOCKGENERATOR/blob/master/src/app/configs/languages.ts
// Cross-checked with: https://github.com/bramp/wordclock/blob/master/lib/languages/natural/german.dart (D3 reference grid)
// Phrase logic: bramp ReferenceSwabianGermanTimeToWords (VIERTL/DREIVIERTL count the next hour from :15)
import { word, type LanguageDef, type WordCoord } from '../types';

const ES = word('ES', 0, 0);
const ISCH = word('ISCH', 0, 3);
const DREIVIERTL = word('DREIVIERTL', 1, 0);
const VIERTL = word('VIERTL', 1, 4);
const ZEHN_MIN = word('ZEHN', 2, 0);
const FUENF_MIN = word('FÜNF', 2, 7);
const NACH = word('NACH', 3, 0);
const VOR = word('VOR', 3, 8);
const HALB = word('HALB', 4, 0);
const FUENFE = word('FÜNFE', 4, 5);
const OISE = word('OISE', 5, 0);
const SECHSE = word('SECHSE', 5, 2);
const ELFE = word('ELFE', 5, 7);
const ZWOIE = word('ZWOIE', 6, 0);
const ACHTE = word('ACHTE', 6, 5);
const DREIE = word('DREIE', 7, 0);
const ZWOELFE = word('ZWÖLFE', 7, 5);
const ZEHNE = word('ZEHNE', 8, 0);
const NEUNE = word('NEUNE', 8, 3);
const SIEBNE = word('SIEBNE', 9, 0);
const VIERE = word('VIERE', 9, 6);

const HOURS = [ZWOELFE, OISE, ZWOIE, DREIE, VIERE, FUENFE, SECHSE, SIEBNE, ACHTE, NEUNE, ZEHNE, ELFE];

// Swabian counts VIERTL/DREIVIERTL toward the NEXT hour from :15
const MINUTES: Record<number, { words: WordCoord[]; nextHour: boolean }> = {
  0: { words: [], nextHour: false },
  5: { words: [FUENF_MIN, NACH], nextHour: false },
  10: { words: [ZEHN_MIN, NACH], nextHour: false },
  15: { words: [VIERTL], nextHour: true },
  20: { words: [ZEHN_MIN, VOR, HALB], nextHour: true },
  25: { words: [FUENF_MIN, VOR, HALB], nextHour: true },
  30: { words: [HALB], nextHour: true },
  35: { words: [FUENF_MIN, NACH, HALB], nextHour: true },
  40: { words: [ZEHN_MIN, NACH, HALB], nextHour: true },
  45: { words: [DREIVIERTL], nextHour: true },
  50: { words: [ZEHN_MIN, VOR], nextHour: true },
  55: { words: [FUENF_MIN, VOR], nextHour: true },
};

function phrase(hours: number, minutes: number): WordCoord[] {
  const m = Math.floor(minutes / 5) * 5;
  const { words, nextHour } = MINUTES[m];
  return [...words, HOURS[(nextHour ? hours + 1 : hours) % 12]];
}

export const swabian: LanguageDef = {
  id: 'd3',
  name: 'Schwäbisch (D3)',
  sample: 'ES ISCH',
  rows: [
    'ESKISCHFUNK',
    'DREIVIERTLA',
    'ZEHNBIEFÜNF',
    'NACHGERTVOR',
    'HALBXFÜNFEI',
    'OISECHSELFE',
    'ZWOIEACHTED',
    'DREIEZWÖLFE',
    'ZEHNEUNEUHL',
    'SIEBNEVIERE',
  ],
  itIs: [ES, ISCH],
  words: [ES, ISCH, DREIVIERTL, VIERTL, ZEHN_MIN, FUENF_MIN, NACH, VOR, HALB, FUENFE, OISE, SECHSE, ELFE, ZWOIE, ACHTE, DREIE, ZWOELFE, ZEHNE, NEUNE, SIEBNE, VIERE],
  phrase,
};
