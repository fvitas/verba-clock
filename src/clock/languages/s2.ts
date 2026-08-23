// Gaj-Latin transliteration of the Serbian face (sr.ts) — every word maps 1:1 in length
// (Č and Š are single letters), so the grid coordinates and phrase logic are identical.
import { word, type LanguageDef, type WordCoord } from '../types';

const SADA = word('SADA', 0, 0);
const JE = word('JE', 0, 5);
const POLA = word('POLA', 0, 7);
const DVADESET_PRE = word('DVADESET', 1, 0);
const DESET_PRE = word('DESET', 1, 3);
const PETNAEST_PRE = word('PETNAEST', 2, 0);
const PET_PRE = word('PET', 2, 0);
const DO = word('DO', 2, 9);
const JEDANAEST = word('JEDANAEST', 3, 0);
const JEDAN = word('JEDAN', 3, 0);
const DVANAEST = word('DVANAEST', 4, 0);
const DVA = word('DVA', 4, 0);
const TRI = word('TRI', 4, 8);
const CETIRI = word('ČETIRI', 5, 0);
const DESET_HOUR = word('DESET', 5, 6);
const PET_HOUR = word('PET', 6, 0);
const SEST = word('ŠEST', 6, 3);
const OSAM = word('OSAM', 6, 7);
const SEDAM = word('SEDAM', 7, 0);
const DEVET = word('DEVET', 7, 5);
const I = word('I', 8, 0);
const DVADESET_POST = word('DVADESET', 8, 2);
const DESET_POST = word('DESET', 8, 5);
const PETNAEST_POST = word('PETNAEST', 9, 0);
const PET_POST = word('PET', 9, 0);

const HOURS = [DVANAEST, JEDAN, DVA, TRI, CETIRI, PET_HOUR, SEST, SEDAM, OSAM, DEVET, DESET_HOUR, JEDANAEST];

const POST_WORDS: Record<number, WordCoord[]> = {
  5: [PET_POST],
  10: [DESET_POST],
  15: [PETNAEST_POST],
  20: [DVADESET_POST],
  25: [DVADESET_POST, PET_POST],
};

const PRE_WORDS: Record<number, WordCoord[]> = {
  35: [DVADESET_PRE, PET_PRE],
  40: [DVADESET_PRE],
  45: [PETNAEST_PRE],
  50: [DESET_PRE],
  55: [PET_PRE],
};

function phrase(hours: number, minutes: number): WordCoord[] {
  const m = Math.floor(minutes / 5) * 5;
  if (m === 0) return [HOURS[hours % 12]];
  if (m === 30) return [POLA, HOURS[(hours + 1) % 12]];
  if (m < 30) return [HOURS[hours % 12], I, ...POST_WORDS[m]];
  return [...PRE_WORDS[m], DO, HOURS[(hours + 1) % 12]];
}

export const serbianLatin: LanguageDef = {
  id: 's2',
  name: 'Serbian (Latin)',
  sample: 'SADA JE',
  rows: [
    'SADAKJEPOLA',
    'DVADESETKRM',
    'PETNAESTRDO',
    'JEDANAESTMK',
    'DVANAESTTRI',
    'ČETIRIDESET',
    'PETŠESTOSAM',
    'SEDAMDEVETK',
    'IRDVADESETM',
    'PETNAESTRKL',
  ],
  itIs: [SADA, JE],
  words: [SADA, JE, POLA, DVADESET_PRE, DESET_PRE, PETNAEST_PRE, PET_PRE, DO, JEDANAEST, JEDAN, DVANAEST, DVA, TRI, CETIRI, DESET_HOUR, PET_HOUR, SEST, OSAM, SEDAM, DEVET, I, DVADESET_POST, DESET_POST, PETNAEST_POST, PET_POST],
  phrase,
};
