import type { LanguageDef } from '../types';
import { english } from './en';
import { german } from './de';
import { french } from './fr';

export const LANGUAGES: LanguageDef[] = [english, german, french];

export const getLanguage = (id: string): LanguageDef => LANGUAGES.find((l) => l.id === id) ?? english;
