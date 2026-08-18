export type Presentation = 'fullbleed' | 'wall';

export type Settings = {
  schemaVersion: 1;
  languageId: string;
  finishId: string;
  presentation: Presentation;
  showItIs: boolean;
  showDots: boolean;
  brightness: number;
  keepAwake: boolean;
  dockMode: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  schemaVersion: 1,
  languageId: 'en',
  finishId: 'deep-black',
  presentation: 'fullbleed',
  showItIs: true,
  showDots: true,
  brightness: 1,
  keepAwake: true,
  dockMode: false,
};

const KEY = 'verba-settings';

export function loadSettings(storage: Storage): Settings {
  try {
    const raw = storage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    if (parsed.schemaVersion !== 1) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(storage: Storage, settings: Settings): void {
  storage.setItem(KEY, JSON.stringify(settings));
}
