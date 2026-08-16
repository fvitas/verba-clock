// Matrix source: https://github.com/vulture20/QLOCKGENERATOR/blob/master/src/app/configs/languages.ts
// Cross-checked with: https://github.com/bramp/wordclock/blob/master/lib/languages/natural/greek.dart (reference grid + logic)
// Source data mixes Latin lookalike codepoints; normalized here to proper Greek codepoints
import { word, type LanguageDef, type WordCoord } from '../types';

const ETA = word('Η', 0, 0);
const ORA = word('ΩΡΑ', 0, 2);
const EINAI = word('ΕΙΝΑΙ', 0, 6);
const MIA = word('ΜΙΑ', 1, 0);
const DYO = word('ΔΥΟ', 1, 3);
const TREIS = word('ΤΡΕΙΣ', 1, 6);
const TESSERIS = word('ΤΕΣΣΕΡΙΣ', 2, 0);
const EXI = word('ΕΞΙ', 2, 8);
const PENTE_HOUR = word('ΠΕΝΤΕ', 3, 0);
const OCHTO = word('ΟΧΤΩ', 3, 6);
const EFTA = word('ΕΦΤΑ', 4, 0);
const ENTEKA = word('ΕΝΤΕΚΑ', 4, 5);
const DODEKA = word('ΔΩΔΕΚΑ', 5, 0);
const ENNIA = word('ΕΝΝΙΑ', 5, 6);
const DEKA_HOUR = word('ΔΕΚΑ', 6, 0);
const PARA = word('ΠΑΡΑ', 6, 5);
const KAI = word('ΚΑΙ', 7, 0);
const TETARTO = word('ΤΕΤΑΡΤΟ', 7, 4);
const EIKOSI = word('ΕΙΚΟΣΙ', 8, 0);
const DEKA_MIN = word('ΔΕΚΑ', 8, 7);
const MISI = word('ΜΙΣΗ', 9, 0);
const PENTE_MIN = word('ΠΕΝΤΕ', 9, 5);

const HOURS = [DODEKA, MIA, DYO, TREIS, TESSERIS, PENTE_HOUR, EXI, EFTA, OCHTO, ENNIA, DEKA_HOUR, ENTEKA];

// Greek shows the NEXT hour from :35 (έντεκα παρά είκοσι πέντε)
const MINUTE_WORDS: Record<number, WordCoord[]> = {
  0: [],
  5: [KAI, PENTE_MIN],
  10: [KAI, DEKA_MIN],
  15: [KAI, TETARTO],
  20: [KAI, EIKOSI],
  25: [KAI, EIKOSI, PENTE_MIN],
  30: [KAI, MISI],
  35: [PARA, EIKOSI, PENTE_MIN],
  40: [PARA, EIKOSI],
  45: [PARA, TETARTO],
  50: [PARA, DEKA_MIN],
  55: [PARA, PENTE_MIN],
};

function phrase(hours: number, minutes: number): WordCoord[] {
  const m = Math.floor(minutes / 5) * 5;
  const hour = HOURS[(m >= 35 ? hours + 1 : hours) % 12];
  return [hour, ...MINUTE_WORDS[m]];
}

export const greek: LanguageDef = {
  id: 'gr',
  name: 'Ελληνικά',
  sample: 'Η ΩΡΑ ΕΙΝΑΙ',
  rows: [
    'ΗΧΩΡΑΤΕΙΝΑΙ',
    'ΜΙΑΔΥΟΤΡΕΙΣ',
    'ΤΕΣΣΕΡΙΣΕΞΙ',
    'ΠΕΝΤΕΡΟΧΤΩΗ',
    'ΕΦΤΑΕΕΝΤΕΚΑ',
    'ΔΩΔΕΚΑΕΝΝΙΑ',
    'ΔΕΚΑΧΠΑΡΑΕΡ',
    'ΚΑΙΕΤΕΤΑΡΤΟ',
    'ΕΙΚΟΣΙΗΔΕΚΑ',
    'ΜΙΣΗΕΠΕΝΤΕΡ',
  ],
  itIs: [ETA, ORA, EINAI],
  words: [ETA, ORA, EINAI, MIA, DYO, TREIS, TESSERIS, EXI, PENTE_HOUR, OCHTO, EFTA, ENTEKA, DODEKA, ENNIA, DEKA_HOUR, PARA, KAI, TETARTO, EIKOSI, DEKA_MIN, MISI, PENTE_MIN],
  phrase,
};
