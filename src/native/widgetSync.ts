import { Capacitor, registerPlugin } from '@capacitor/core';
import type { Settings } from '../settings/store';

type WidgetBridge = {
  syncSettings(options: { settings: string }): Promise<void>;
};

const WidgetBridge = registerPlugin<WidgetBridge>('WidgetBridge');

// Widgets resolve their "Same as app" options from this copy — an App Group on iOS,
// SharedPreferences on Android
export function syncSettingsToWidgets(settings: Settings): void {
  if (!Capacitor.isNativePlatform()) return;
  // Native readers still key on finishId; a custom theme falls back to Deep Black on the
  // widgets until the native renderers learn the theme object
  const builtin = !settings.customThemes.some((theme) => theme.id === settings.themeId);
  const payload = { ...settings, finishId: builtin ? settings.themeId : 'deep-black' };
  void WidgetBridge.syncSettings({ settings: JSON.stringify(payload) }).catch(() => {
    // Plugin missing (e.g. outdated native shell) — widgets just keep defaults
  });
}
