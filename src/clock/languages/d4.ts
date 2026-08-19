// Same faceplate as DE; East German phrase mode (VIERTEL/DREIVIERTEL count the next hour from :15)
// Sources: https://github.com/bramp/wordclock/blob/master/lib/languages/natural/german_time_to_words.dart
// (ReferenceEastGermanTimeToWords) + https://github.com/ukw100/wordclock24h/blob/master/make-tables/tables12h-de.c (OSSI mode)
import { word, type LanguageDef, type WordCoord } from '../types';
import { german } from './de';

const FUENF_MIN = word('FÜNF', 0, 7);
const ZEHN_MIN = word('ZEHN', 1, 0);
const DREIVIERTEL = word('DREIVIERTEL', 2, 0);
const VIERTEL = word('VIERTEL', 2, 4);
const VOR = word('VOR', 3, 0);
const NACH = word('NACH', 3, 7);
const HALB = word('HALB', 4, 0);
const ELF = word('ELF', 4, 5);
const FUENF_HOUR = word('FÜNF', 4, 7);
const EINS = word('EINS', 5, 0);
const EIN = word('EIN', 5, 0);
const ZWEI = word('ZWEI', 5, 7);
const DREI = word('DREI', 6, 0);
const VIER = word('VIER', 6, 7);
const SECHS = word('SECHS', 7, 0);
const ACHT = word('ACHT', 7, 7);
const SIEBEN = word('SIEBEN', 8, 0);
const ZWOELF = word('ZWÖLF', 8, 6);
const ZEHN_HOUR = word('ZEHN', 9, 0);
const NEUN = word('NEUN', 9, 3);
const UHR = word('UHR', 9, 8);

const HOURS = [ZWOELF, EINS, ZWEI, DREI, VIER, FUENF_HOUR, SECHS, SIEBEN, ACHT, NEUN, ZEHN_HOUR, ELF];

// Next hour from :15 in the East German variant
const MINUTES: Record<number, { words: WordCoord[]; nextHour: boolean }> = {
  0: { words: [UHR], nextHour: false },
  5: { words: [FUENF_MIN, NACH], nextHour: false },
  10: { words: [ZEHN_MIN, NACH], nextHour: false },
  15: { words: [VIERTEL], nextHour: true },
  20: { words: [ZEHN_MIN, VOR, HALB], nextHour: true },
  25: { words: [FUENF_MIN, VOR, HALB], nextHour: true },
  30: { words: [HALB], nextHour: true },
  35: { words: [FUENF_MIN, NACH, HALB], nextHour: true },
  40: { words: [ZEHN_MIN, NACH, HALB], nextHour: true },
  45: { words: [DREIVIERTEL], nextHour: true },
  50: { words: [ZEHN_MIN, VOR], nextHour: true },
  55: { words: [FUENF_MIN, VOR], nextHour: true },
};

function phrase(hours: number, minutes: number): WordCoord[] {
  const m = Math.floor(minutes / 5) * 5;
  const { words, nextHour } = MINUTES[m];
  const h = (nextHour ? hours + 1 : hours) % 12;
  if (m === 0) return [h === 1 ? EIN : HOURS[h], UHR];
  return [...words, HOURS[h]];
}

export const germanD4: LanguageDef = {
  id: 'd4',
  name: 'German East (D4)',
  sample: 'ES IST',
  rows: german.rows,
  itIs: german.itIs,
  words: [...german.itIs, FUENF_MIN, ZEHN_MIN, DREIVIERTEL, VIERTEL, VOR, NACH, HALB, ELF, FUENF_HOUR, EINS, ZWEI, DREI, VIER, SECHS, ACHT, SIEBEN, ZWOELF, ZEHN_HOUR, NEUN, UHR],
  phrase,
};
