import type { LightPlaySetting } from '../lightplay/effects';

export type Presentation = 'fullbleed' | 'wall';

export type DotsMode = 'corners' | 'minutes' | 'off';

export type Transition = 'instant' | 'crossfade' | 'typewriter' | 'offthenon';

export type Settings = {
  schemaVersion: 1;
  languageId: string;
  finishId: string;
  presentation: Presentation;
  showItIs: boolean;
  dots: DotsMode;
  transition: Transition;
  lightPlay: LightPlaySetting;
  brightness: number;
  keepAwake: boolean;
  dockMode: boolean;
  haptics: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  schemaVersion: 1,
  languageId: 'en',
  finishId: 'deep-black',
  presentation: 'fullbleed',
  showItIs: true,
  dots: 'corners',
  transition: 'crossfade',
  lightPlay: 'ripple',
  brightness: 1,
  keepAwake: true,
  dockMode: false,
  haptics: true,
};

const KEY = 'verba-settings';

export function loadSettings(storage: Storage): Settings {
  try {
    const raw = storage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const { showDots, egg, ...parsed } = JSON.parse(raw) as Partial<Settings> & {
      showDots?: boolean;
      egg?: LightPlaySetting;
    };
    if (parsed.schemaVersion !== 1) return DEFAULT_SETTINGS;
    const settings = { ...DEFAULT_SETTINGS, ...parsed };
    // Legacy boolean predates the dots mode; true meant the corner dots
    if (parsed.dots === undefined && showDots === false) settings.dots = 'off';
    // Light play shipped briefly under its design name, "easter egg"
    if (parsed.lightPlay === undefined && egg !== undefined) settings.lightPlay = egg;
    return settings;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(storage: Storage, settings: Settings): void {
  storage.setItem(KEY, JSON.stringify(settings));
}
