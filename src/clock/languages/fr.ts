// Matrix source: https://github.com/vulture20/QLOCKGENERATOR/blob/master/src/app/configs/languages.ts
// Cross-checked with: https://github.com/bracci/Qlockthree/blob/master/Woerter_FR.h (+ Renderer.cpp phrase logic)
import { word, type LanguageDef, type WordCoord } from '../types';

const IL = word('IL', 0, 0);
const EST = word('EST', 0, 3);
const DEUX = word('DEUX', 0, 7);
const QUATRE = word('QUATRE', 1, 0);
const TROIS = word('TROIS', 1, 6);
const NEUF = word('NEUF', 2, 0);
const UNE = word('UNE', 2, 4);
const SEPT = word('SEPT', 2, 7);
const HUIT = word('HUIT', 3, 0);
const SIX = word('SIX', 3, 4);
const CINQ_HOUR = word('CINQ', 3, 7);
const MIDI = word('MIDI', 4, 0);
const DIX_HOUR = word('DIX', 4, 2);
const MINUIT = word('MINUIT', 4, 5);
const ONZE = word('ONZE', 5, 0);
const HEURE = word('HEURE', 5, 5);
const HEURES = word('HEURES', 5, 5);
const MOINS = word('MOINS', 6, 0);
const LE = word('LE', 6, 6);
const DIX_MIN = word('DIX', 6, 8);
const ET = word('ET', 7, 0);
const QUART = word('QUART', 7, 3);
const VINGT = word('VINGT', 8, 0);
const VINGT_CINQ = word('VINGT-CINQ', 8, 0);
const CINQ_MIN = word('CINQ', 8, 6);
// Real QLOCKTWO lights the bottom-row ET next to DEMIE, not the row-8 one (see mockups/reference-languages/fr-french.png)
const ET_DEMIE = word('ET', 9, 0);
const DEMIE = word('DEMIE', 9, 3);

const HOURS = [MINUIT, UNE, DEUX, TROIS, QUATRE, CINQ_HOUR, SIX, SEPT, HUIT, NEUF, DIX_HOUR, ONZE];

function hourWords(hours: number): WordCoord[] {
  const h = hours % 24;
  if (h === 0) return [MINUIT];
  if (h === 12) return [MIDI];
  if (h % 12 === 1) return [UNE, HEURE];
  return [HOURS[h % 12], HEURES];
}

const MINUTE_WORDS: Record<number, WordCoord[]> = {
  0: [],
  5: [CINQ_MIN],
  10: [DIX_MIN],
  15: [ET, QUART],
  20: [VINGT],
  25: [VINGT_CINQ],
  30: [ET_DEMIE, DEMIE],
  35: [MOINS, VINGT_CINQ],
  40: [MOINS, VINGT],
  45: [MOINS, LE, QUART],
  50: [MOINS, DIX_MIN],
  55: [MOINS, CINQ_MIN],
};

function phrase(hours: number, minutes: number): WordCoord[] {
  const m = Math.floor(minutes / 5) * 5;
  const displayHours = m >= 35 ? hours + 1 : hours;
  return [...hourWords(displayHours), ...MINUTE_WORDS[m]];
}

export const french: LanguageDef = {
  id: 'fr',
  name: 'French',
  sample: 'IL EST',
  rows: [
    'ILNESTODEUX',
    'QUATRETROIS',
    'NEUFUNESEPT',
    'HUITSIXCINQ',
    'MIDIXMINUIT',
    'ONZERHEURES',
    'MOINSOLEDIX',
    'ETRQUARTPMD',
    'VINGT-CINQU',
    'ETSDEMIEPAM',
  ],
  itIs: [IL, EST],
  words: [IL, EST, DEUX, QUATRE, TROIS, NEUF, UNE, SEPT, HUIT, SIX, CINQ_HOUR, MIDI, DIX_HOUR, MINUIT, ONZE, HEURE, HEURES, MOINS, LE, DIX_MIN, ET, QUART, VINGT, VINGT_CINQ, CINQ_MIN, ET_DEMIE, DEMIE],
  phrase,
};
