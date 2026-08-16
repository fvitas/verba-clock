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

export const LANGUAGES: LanguageDef[] = [english, german, swissGerman, french, italian, spanish, catalan, dutch, danish, norwegian, swedish, czech, romanian, portuguese, turkish];

export const getLanguage = (id: string): LanguageDef => LANGUAGES.find((l) => l.id === id) ?? english;
