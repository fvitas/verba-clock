import type { LanguageDef } from '../types';
import { english } from './en';
import { german } from './de';
import { french } from './fr';
import { italian } from './it';
import { spanish } from './es';
import { dutch } from './nl';
import { catalan } from './ca';
import { danish } from './dk';
import { norwegian } from './no';
import { swedish } from './se';
import { czech } from './cz';
import { romanian } from './ro';
import { portuguese } from './pe';
import { turkish } from './tr';
import { swissGerman } from './ch';
import { germanD2 } from './d2';
import { swabian } from './d3';
import { germanD4 } from './d4';
import { englishE2 } from './e2';
import { russian } from './ru';
import { greek } from './gr';

export const LANGUAGES: LanguageDef[] = [english, englishE2, german, germanD2, swabian, germanD4, swissGerman, french, italian, spanish, catalan, dutch, danish, norwegian, swedish, czech, romanian, portuguese, turkish, russian, greek];

export const getLanguage = (id: string): LanguageDef => LANGUAGES.find((l) => l.id === id) ?? english;
