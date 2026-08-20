// Matrix source: https://github.com/vulture20/QLOCKGENERATOR/blob/master/src/app/configs/languages.ts
// Cross-checked with: https://github.com/bramp/wordclock/blob/master/lib/languages/natural/czech.dart (reference grid + logic)
// Verified against official QLOCKTWO photo at 7:30 (mockups/reference-languages/cz-czech.png); row 8 fillers are M…M, not the community sources' N…E
// Digital-readout face: hour never rolls over; JSOU for hours 2-4, JE otherwise
import { word, type LanguageDef, type WordCoord } from '../types';

const JE = word('JE', 0, 0);
const JSOU = word('JSOU', 0, 2);
const JEDNA = word('JEDNA', 0, 6);
const DEVET = word('DEVĚT', 1, 0);
const PET_HOUR = word('PĚT', 1, 5);
const DVE = word('DVĚ', 1, 8);
const SEDM = word('SEDM', 2, 0);
const DVANACT = word('DVANÁCT', 2, 4);
const DESET_HOUR = word('DESET', 3, 0);
const TRI = word('TŘI', 3, 4);
const SEST = word('ŠEST', 3, 7);
const OSM = word('OSM', 4, 0);
const JEDENACT = word('JEDENÁCT', 4, 3);
const CTYRI = word('ČTYŘI', 5, 0);
const DESET_MIN = word('DESET', 5, 6);
const DVACET = word('DVACET', 6, 0);
const TRICET = word('TŘICET', 6, 5);
const PATNACT = word('PATNÁCT', 7, 0);
const NULA = word('NULA', 7, 7);
const CTYRICET = word('ČTYŘICET', 8, 2);
const PADESAT = word('PADESÁT', 9, 0);
const PET_MIN = word('PĚT', 9, 8);

const HOURS = [DVANACT, JEDNA, DVE, TRI, CTYRI, PET_HOUR, SEST, SEDM, OSM, DEVET, DESET_HOUR, JEDENACT];

const MINUTE_WORDS: Record<number, WordCoord[]> = {
  0: [],
  5: [NULA, PET_MIN],
  10: [DESET_MIN],
  15: [PATNACT],
  20: [DVACET],
  25: [DVACET, PET_MIN],
  30: [TRICET],
  35: [TRICET, PET_MIN],
  40: [CTYRICET],
  45: [CTYRICET, PET_MIN],
  50: [PADESAT],
  55: [PADESAT, PET_MIN],
};

function itIsFor(hours: number, _minutes: number): WordCoord[] {
  const h = hours % 12;
  return h >= 2 && h <= 4 ? [JSOU] : [JE];
}

function phrase(hours: number, minutes: number): WordCoord[] {
  const m = Math.floor(minutes / 5) * 5;
  return [HOURS[hours % 12], ...MINUTE_WORDS[m]];
}

export const czech: LanguageDef = {
  id: 'cz',
  name: 'Czech',
  sample: 'JE',
  rows: [
    'JEJSOUJEDNA',
    'DEVĚTPĚTDVĚ',
    'SEDMDVANÁCT',
    'DESETŘIŠEST',
    'OSMJEDENÁCT',
    'ČTYŘIADESET',
    'DVACETŘICET',
    'PATNÁCTNULA',
    'MEČTYŘICETM',
    'PADESÁTDPĚT',
  ],
  itIs: [JE],
  itIsFor,
  words: [JE, JSOU, JEDNA, DEVET, PET_HOUR, DVE, SEDM, DVANACT, DESET_HOUR, TRI, SEST, OSM, JEDENACT, CTYRI, DESET_MIN, DVACET, TRICET, PATNACT, NULA, CTYRICET, PADESAT, PET_MIN],
  phrase,
};
