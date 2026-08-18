import { Capacitor, registerPlugin } from '@capacitor/core';
import type { Settings } from '../settings/store';

type WidgetBridge = {
  syncSettings(options: { settings: string }): Promise<void>;
};

const WidgetBridge = registerPlugin<WidgetBridge>('WidgetBridge');

// Widgets resolve their "Same as app" options from this App Group copy
export function syncSettingsToWidgets(settings: Settings): void {
  if (Capacitor.getPlatform() !== 'ios') return;
  void WidgetBridge.syncSettings({ settings: JSON.stringify(settings) }).catch(() => {
    // Plugin missing (e.g. outdated native shell) — widgets just keep defaults
  });
}
