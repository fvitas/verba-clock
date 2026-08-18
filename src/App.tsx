import { useState } from 'react';
import { resolveTime } from './clock/engine';
import { getLanguage } from './clock/languages';
import { resolveSeconds } from './clock/seconds';
import { useClockTime } from './clock/use-clock-time';
import { ClockFace } from './components/ClockFace';
import { CornerDots } from './components/CornerDots';
import { MinuteDots } from './components/MinuteDots';
import { getFinish } from './finishes/catalog';
import { useDockMode } from './native/useDockMode';
import { useNative } from './native/useNative';
import { useWakeLock } from './native/useWakeLock';
import { SettingsProvider, useSettings } from './settings/SettingsContext';
import { SettingsPanel } from './settings/SettingsPanel';

export function App() {
  return (
    <SettingsProvider>
      <AppShell />
    </SettingsProvider>
  );
}

function AppShell() {
  const { settings } = useSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const docked = useDockMode(settings.dockMode);

  return (
    <>
      <ClockScreen settingsOpen={settingsOpen} docked={docked} />
      <SettingsPanel open={settingsOpen} docked={docked} onOpenChange={setSettingsOpen} />
    </>
  );
}

type Mode = 'words' | 'seconds';

function ClockScreen({ settingsOpen, docked }: { settingsOpen: boolean; docked: boolean }) {
  const { settings } = useSettings();
  const time = useClockTime();
  const [mode, setMode] = useState<Mode>('words');
  // A docked clock must stay lit regardless of the keep-awake setting
  useNative(settings.keepAwake || docked);
  useWakeLock(settings.keepAwake || docked);

  const brightness = docked ? Math.min(settings.brightness, 0.3) : settings.brightness;
  const lang = getLanguage(settings.languageId);
  const finish = getFinish(settings.finishId);
  const display = resolveTime(time.getHours(), time.getMinutes(), lang, settings.showItIs);
  const lit = mode === 'words' ? display.lit : resolveSeconds(time.getSeconds());

  const toggleMode = () => setMode((prev) => (prev === 'words' ? 'seconds' : 'words'));

  // Desktop: 340px sheet + 12px margin + 12px gap keeps the face centred beside the sheet.
  // Mobile: less than the sheet's 70dvh cap — the face peeks larger above it rather than
  // shrinking to fully clear it.
  const sheetInset = settingsOpen ? 'md:pr-[364px] max-md:pb-[60dvh]' : '';

  const onWall = settings.presentation === 'wall' && !docked;

  const face = (
    <>
      {settings.dots === 'corners' && <CornerDots letter={finish.letter} />}
      {settings.dots === 'minutes' && (
        <MinuteDots count={display.dots} finish={finish} visible={mode === 'words'} nearEdge={onWall} />
      )}
      <ClockFace rows={lang.rows} lit={lit} finish={finish} cellOverrides={lang.cellOverrides} />
    </>
  );

  if (onWall) {
    return (
      <main
        className={`flex h-dvh w-dvw items-center justify-center overflow-hidden bg-[radial-gradient(120%_100%_at_50%_20%,#38342f,#211f1c)] font-[DINish,'Noto_Sans'] transition-[padding,filter] duration-300 [container-type:size] ${sheetInset}`}
        style={{ filter: `brightness(${brightness})` }}
        data-settings-open={settingsOpen || undefined}
        onClick={toggleMode}
      >
        <div
          className="relative flex aspect-square h-[80cqmin] items-center justify-center [container-type:size] [box-shadow:0_25px_50px_rgba(0,0,0,0.6),0_4px_10px_rgba(0,0,0,0.4)]"
          style={{ background: finish.surface }}
        >
          {face}
        </div>
      </main>
    );
  }

  return (
    <main
      className={`relative flex h-dvh w-dvw items-center justify-center overflow-hidden font-[DINish,'Noto_Sans'] transition-[padding,filter] duration-300 [container-type:size] ${sheetInset}`}
      style={{ background: finish.surface, filter: `brightness(${brightness})` }}
      data-docked={docked || undefined}
      data-settings-open={settingsOpen || undefined}
      onClick={toggleMode}
    >
      {face}
    </main>
  );
}
