// Matrix source: https://github.com/vulture20/QLOCKGENERATOR/blob/master/src/app/configs/languages.ts
// Cross-checked with: https://github.com/bramp/wordclock/blob/master/lib/languages/natural/turkish.dart (reference grid + logic)
// and cdmoro/wordoclock tr-TR.ts examples; face prints SEKIZ with dotless I (kept as-is); YARIM is unused filler
// Digital hour never rolls over; accusative hour + GEÇİYOR except :00 and :30 (BUÇUK)
import { word, type LanguageDef, type WordCoord } from '../types';

const SAAT = word('SAAT', 0, 0);
const ON_HOUR = word('ON', 0, 5);
const ONU = word('ONU', 0, 5);
const UCU = word('ÜÇÜ', 0, 8);
const UC = word('ÜÇ', 0, 8);
const BIRI = word('BİRİ', 1, 0);
const BIR = word('BİR', 1, 0);
const ALTIYI = word('ALTIYI', 1, 4);
const ALTI = word('ALTI', 1, 4);
const IKIYI = word('İKİYİ', 2, 0);
const IKI = word('İKİ', 2, 0);
const DOKUZU = word('DOKUZU', 2, 5);
const DOKUZ = word('DOKUZ', 2, 5);
const DORDU = word('DÖRDÜ', 3, 0);
const YEDIYI = word('YEDİYİ', 3, 5);
const YEDI = word('YEDİ', 3, 5);
const SEKIZI = word('SEKIZİ', 4, 0);
const SEKIZ = word('SEKIZ', 4, 0);
const DORT = word('DÖRT', 5, 0);
const BESI = word('BEŞİ', 5, 7);
const BES_HOUR = word('BEŞ', 5, 7);
const OTUZ = word('OTUZ', 6, 3);
const KIRK = word('KIRK', 6, 7);
const ELLI = word('ELLİ', 7, 0);
const ON_MIN = word('ON', 7, 4);
const YIRMI = word('YİRMİ', 7, 6);
const BUCUK = word('BUÇUK', 8, 0);
const CEYREK = word('ÇEYREK', 8, 5);
const BES_MIN = word('BEŞ', 9, 0);
const GECIYOR = word('GEÇİYOR', 9, 4);

const HOURS_NOMINATIVE: WordCoord[][] = [
  [ON_HOUR, IKI],
  [BIR],
  [IKI],
  [UC],
  [DORT],
  [BES_HOUR],
  [ALTI],
  [YEDI],
  [SEKIZ],
  [DOKUZ],
  [ON_HOUR],
  [ON_HOUR, BIR],
];

const HOURS_ACCUSATIVE: WordCoord[][] = [
  [ON_HOUR, IKIYI],
  [BIRI],
  [IKIYI],
  [UCU],
  [DORDU],
  [BESI],
  [ALTIYI],
  [YEDIYI],
  [SEKIZI],
  [DOKUZU],
  [ONU],
  [ON_HOUR, BIRI],
];

const MINUTE_WORDS: Record<number, WordCoord[]> = {
  5: [BES_MIN],
  10: [ON_MIN],
  15: [CEYREK],
  20: [YIRMI],
  25: [YIRMI, BES_MIN],
  35: [OTUZ, BES_MIN],
  40: [KIRK],
  45: [KIRK, BES_MIN],
  50: [ELLI],
  55: [ELLI, BES_MIN],
};

function phrase(hours: number, minutes: number): WordCoord[] {
  const m = Math.floor(minutes / 5) * 5;
  const h = hours % 12;
  if (m === 0) return HOURS_NOMINATIVE[h];
  if (m === 30) return [...HOURS_NOMINATIVE[h], BUCUK];
  return [...HOURS_ACCUSATIVE[h], ...MINUTE_WORDS[m], GECIYOR];
}

export const turkish: LanguageDef = {
  id: 'tr',
  name: 'Turkish',
  sample: 'SAAT',
  rows: [
    'SAATRONUÜÇÜ',
    'BİRİALTIYID',
    'İKİYİDOKUZU',
    'DÖRDÜYEDİYİ',
    'SEKIZİYARIM',
    'DÖRTAMSBEŞİ',
    'KPMOTUZKIRK',
    'ELLİONYİRMİ',
    'BUÇUKÇEYREK',
    'BEŞMGEÇİYOR',
  ],
  itIs: [SAAT],
  words: [SAAT, ON_HOUR, ONU, UCU, UC, BIRI, BIR, ALTIYI, ALTI, IKIYI, IKI, DOKUZU, DOKUZ, DORDU, YEDIYI, YEDI, SEKIZI, SEKIZ, DORT, BESI, BES_HOUR, OTUZ, KIRK, ELLI, ON_MIN, YIRMI, BUCUK, CEYREK, BES_MIN, GECIYOR],
  phrase,
};
