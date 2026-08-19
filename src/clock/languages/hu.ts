// Custom Verba matrix (no QLOCKTWO Hungarian exists) — wave 2, decision D27
// System: the traditional Hungarian quarter-relative readings — negyed/fél/háromnegyed
// reference the COMING hour ("fél hat" = 5:30), with perccel múlt / perc múlva offsets.
// Word order puts minutes BEFORE the hour, so the minute zone sits above the hour zone.
// Overlaps: PERC inside PERCCEL, NEGYED inside HÁROMNEGYED, EGY inside TIZENEGY,
// KETTŐ inside TIZENKETTŐ. KÉT is the attributive form used only before ÓRA (2:00).
import { word, type LanguageDef, type WordCoord } from '../types';

const MOST = word('MOST', 0, 0);
const OT_MIN = word('ÖT', 0, 5);
const TIZ_MIN = word('TÍZ', 0, 8);
const PERCCEL = word('PERCCEL', 1, 0);
const PERC = word('PERC', 1, 0);
const MULT = word('MÚLT', 1, 7);
const MULVA = word('MÚLVA', 2, 0);
const FEL = word('FÉL', 2, 6);
const HAROMNEGYED = word('HÁROMNEGYED', 3, 0);
const NEGYED = word('NEGYED', 3, 5);

const TIZENKETTO = word('TIZENKETTŐ', 4, 0);
const KETTO = word('KETTŐ', 4, 5);
const TIZENEGY = word('TIZENEGY', 5, 0);
const EGY = word('EGY', 5, 5);
const HET = word('HÉT', 5, 8);
const KILENC = word('KILENC', 6, 0);
const NYOLC = word('NYOLC', 6, 6);
const HAROM = word('HÁROM', 7, 0);
const NEGY = word('NÉGY', 7, 5);
const OT_HOUR = word('ÖT', 7, 9);
const KET = word('KÉT', 8, 0);
const HAT = word('HAT', 8, 3);
const TIZ_HOUR = word('TÍZ', 8, 7);

const ORA = word('ÓRA', 9, 1);
const VAN = word('VAN', 9, 5);

const HOURS = [TIZENKETTO, EGY, KETTO, HAROM, NEGY, OT_HOUR, HAT, HET, NYOLC, KILENC, TIZ_HOUR, TIZENEGY];

function phrase(hours: number, minutes: number): WordCoord[] {
  const m = Math.floor(minutes / 5) * 5;
  const current = HOURS[hours % 12];
  const next = HOURS[(hours + 1) % 12];
  switch (m) {
    case 0:
      return [hours % 12 === 2 ? KET : current, ORA, VAN];
    case 5:
      return [OT_MIN, PERCCEL, MULT, current];
    case 10:
      return [TIZ_MIN, PERCCEL, MULT, current];
    case 15:
      return [NEGYED, next, VAN];
    case 20:
      return [OT_MIN, PERCCEL, MULT, NEGYED, next];
    case 25:
      return [OT_MIN, PERC, MULVA, FEL, next];
    case 30:
      return [FEL, next, VAN];
    case 35:
      return [OT_MIN, PERCCEL, MULT, FEL, next];
    case 40:
      return [OT_MIN, PERC, MULVA, HAROMNEGYED, next];
    case 45:
      return [HAROMNEGYED, next, VAN];
    case 50:
      return [TIZ_MIN, PERC, MULVA, next];
    default:
      return [OT_MIN, PERC, MULVA, next];
  }
}

export const hungarian: LanguageDef = {
  id: 'hu',
  name: 'Hungarian',
  sample: 'MOST',
  rows: [
    'MOSTKÖTBTÍZ',
    'PERCCELMÚLT',
    'MÚLVARFÉLKE',
    'HÁROMNEGYED',
    'TIZENKETTŐL',
    'TIZENEGYHÉT',
    'KILENCNYOLC',
    'HÁROMNÉGYÖT',
    'KÉTHATBTÍZO',
    'LÓRAKVANESZ',
  ],
  itIs: [MOST],
  words: [MOST, OT_MIN, TIZ_MIN, PERCCEL, PERC, MULT, MULVA, FEL, HAROMNEGYED, NEGYED, TIZENKETTO, KETTO, TIZENEGY, EGY, HET, KILENC, NYOLC, HAROM, NEGY, OT_HOUR, KET, HAT, TIZ_HOUR, ORA, VAN],
  phrase,
};
