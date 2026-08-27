import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { setHapticsEnabled } from '../native/haptics';
import { syncSettingsToWidgets } from '../native/widgetSync';
import { loadSettings, saveSettings, type Settings } from './store';

type SettingsContextValue = {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(() => loadSettings(localStorage));

  useEffect(() => {
    setHapticsEnabled(settings.haptics);
    // A slider drag patches settings per step, and Android repaints widget bitmaps on every
    // sync — trail the drag instead of chasing it
    const timer = setTimeout(() => syncSettingsToWidgets(settings), 300);
    return () => clearTimeout(timer);
  }, [settings]);

  const update = (patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(localStorage, next);
      return next;
    });
  };

  return <SettingsContext.Provider value={{ settings, update }}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings requires SettingsProvider');
  return ctx;
}
