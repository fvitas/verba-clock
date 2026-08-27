import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

// Kept as module state rather than context so leaf controls can buzz without prop drilling;
// SettingsProvider pushes the user's preference in on every change.
let enabled = true;

// Desktop Chromium exposes navigator.vibrate but never buzzes — web haptics are touch-only
export const supportsHaptics = (): boolean =>
  Capacitor.isNativePlatform() ||
  (typeof navigator.vibrate === 'function' && window.matchMedia('(pointer: coarse)').matches);

export function setHapticsEnabled(next: boolean): void {
  enabled = next;
}

// Fire-and-forget: a buzz that fails must never break the tap that triggered it
function fire(run: () => Promise<void>): void {
  if (!enabled || !supportsHaptics()) return;
  void run().catch(() => {});
}

export const tapHaptic = (): void => fire(() => Haptics.impact({ style: ImpactStyle.Light }));

// iOS only vibrates selectionChanged while a generator is prepared, so drags must be bracketed
export const startSelectionHaptic = (): void => fire(() => Haptics.selectionStart());

// iOS's feedback generator rate-limits itself; Android's Vibrator queues every one-shot, so a
// fast drag banks buzzes that keep firing after the finger stops — gate them ourselves
let lastTick = 0;
export function selectionHaptic(): void {
  if (Capacitor.getPlatform() === 'android') {
    const now = Date.now();
    if (now - lastTick < 80) return;
    lastTick = now;
  }
  fire(() => Haptics.selectionChanged());
}
export const endSelectionHaptic = (): void => fire(() => Haptics.selectionEnd());
