import { Capacitor, registerPlugin } from '@capacitor/core';
import type { Theme } from '../themes/model';

type SystemBars = {
  setGlyphs(options: { dark: boolean }): Promise<void>;
};

const SystemBars = registerPlugin<SystemBars>('SystemBars');

// Android pins nav-bar glyphs white in styles.xml; a light front needs dark glyphs (D39 nit).
// iOS has no nav bar and its status bar is hidden, so this is Android-only.
export function syncSystemBarGlyphs(theme: Theme): void {
  if (Capacitor.getPlatform() !== 'android') return;
  void SystemBars.setGlyphs({ dark: theme.letter === 'dark' }).catch(() => {
    // Plugin missing (outdated native shell) — glyphs just stay white
  });
}
