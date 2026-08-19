// Matrix source: https://github.com/ministubbe/clock/blob/master/qlocktwo.html
import { word, type LanguageDef, type WordCoord } from '../types';

const ES = word('ES', 0, 0);
const IST = word('IST', 0, 3);
const FUENF_MIN = word('FÜNF', 0, 7);
const ZEHN_MIN = word('ZEHN', 1, 0);
const ZWANZIG = word('ZWANZIG', 1, 4);
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

function phrase(hours: number, minutes: number): WordCoord[] {
  const m = Math.floor(minutes / 5) * 5;
  const nextHour = HOURS[(hours + 1) % 12];
  const thisHour = HOURS[hours % 12];

  if (m === 0) return [hours % 12 === 1 ? EIN : thisHour, UHR];

  const MINUTES: Record<number, WordCoord[]> = {
    5: [FUENF_MIN, NACH, thisHour],
    10: [ZEHN_MIN, NACH, thisHour],
    15: [VIERTEL, NACH, thisHour],
    20: [ZWANZIG, NACH, thisHour],
    25: [FUENF_MIN, VOR, HALB, nextHour],
    30: [HALB, nextHour],
    35: [FUENF_MIN, NACH, HALB, nextHour],
    40: [ZWANZIG, VOR, nextHour],
    45: [VIERTEL, VOR, nextHour],
    50: [ZEHN_MIN, VOR, nextHour],
    55: [FUENF_MIN, VOR, nextHour],
  };
  return MINUTES[m];
}

export const german: LanguageDef = {
  id: 'de',
  name: 'German',
  sample: 'ES IST',
  rows: [
    'ESKISTAFÜNF',
    'ZEHNZWANZIG',
    'DREIVIERTEL',
    'VORFUNKNACH',
    'HALBAELFÜNF',
    'EINSXAMZWEI',
    'DREIPMJVIER',
    'SECHSNLACHT',
    'SIEBENZWÖLF',
    'ZEHNEUNKUHR',
  ],
  itIs: [ES, IST],
  words: [ES, IST, FUENF_MIN, ZEHN_MIN, ZWANZIG, VIERTEL, VOR, NACH, HALB, ELF, FUENF_HOUR, EINS, ZWEI, DREI, VIER, SECHS, ACHT, SIEBEN, ZWOELF, ZEHN_HOUR, NEUN, UHR],
  phrase,
};
