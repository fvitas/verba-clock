import { useState } from 'react';
import { resolveTime } from './clock/engine';
import { getLanguage } from './clock/languages';
import { resolveSeconds } from './clock/seconds';
import { useClockTime } from './clock/use-clock-time';
import { ClockFace } from './components/ClockFace';
import { CornerDots } from './components/CornerDots';
import { getFinish } from './finishes/catalog';
import { SettingsProvider, useSettings } from './settings/SettingsContext';
import { SettingsPanel } from './settings/SettingsPanel';

export function App() {
  return (
    <SettingsProvider>
      <ClockScreen />
      <SettingsPanel />
    </SettingsProvider>
  );
}

type Mode = 'words' | 'seconds';

function ClockScreen() {
  const { settings } = useSettings();
  const time = useClockTime();
  const [mode, setMode] = useState<Mode>('words');

  const lang = getLanguage(settings.languageId);
  const finish = getFinish(settings.finishId);
  const display = resolveTime(time.getHours(), time.getMinutes(), lang, settings.showItIs);
  const lit = mode === 'words' ? display.lit : resolveSeconds(time.getSeconds());

  const toggleMode = () => setMode((prev) => (prev === 'words' ? 'seconds' : 'words'));

  const face = (
    <>
      {mode === 'words' && <CornerDots count={display.dots} letter={finish.letter} />}
      <ClockFace rows={lang.rows} lit={lit} finish={finish} />
    </>
  );

  if (settings.presentation === 'wall') {
    return (
      <main
        className="flex h-dvh w-dvw items-center justify-center overflow-hidden bg-[radial-gradient(120%_100%_at_50%_20%,#38342f,#211f1c)] font-[DINish]"
        style={{ filter: `brightness(${settings.brightness})` }}
        onClick={toggleMode}
      >
        <div
          className="relative flex aspect-square h-[min(80vh,80vw)] items-center justify-center [container-type:size] [box-shadow:0_25px_50px_rgba(0,0,0,0.6),0_4px_10px_rgba(0,0,0,0.4)]"
          style={{ background: finish.surface }}
        >
          {face}
        </div>
      </main>
    );
  }

  return (
    <main
      className="relative flex h-dvh w-dvw items-center justify-center overflow-hidden font-[DINish] [container-type:size]"
      style={{ background: finish.surface, filter: `brightness(${settings.brightness})` }}
      onClick={toggleMode}
    >
      {face}
    </main>
  );
}
