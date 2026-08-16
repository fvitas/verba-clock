import type { LanguageDef } from '../types';
import { english } from './en';
import { german } from './de';
import { french } from './fr';
import { italian } from './it';

export const LANGUAGES: LanguageDef[] = [english, german, french, italian];

export const getLanguage = (id: string): LanguageDef => LANGUAGES.find((l) => l.id === id) ?? english;
