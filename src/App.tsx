import { useState } from 'react';
import { resolveTime } from './clock/engine';
import { getLanguage } from './clock/languages';
import { mirrorCols, resolveSeconds } from './clock/seconds';
import { useClockTime } from './clock/use-clock-time';
import { ClockFace } from './components/ClockFace';
import { CornerDots } from './components/CornerDots';
import { MinuteDots } from './components/MinuteDots';
import { getFinish } from './finishes/catalog';
import { tapHaptic } from './native/haptics';
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

const secondsFor = (seconds: number, dir?: 'rtl'): ReadonlySet<string> => {
  const lit = resolveSeconds(seconds);
  return dir === 'rtl' ? mirrorCols(lit) : lit;
};

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
  // Seconds digits render on the letter matrix — word-grid faces (Arabic) have none
  const effectiveMode = lang.layout === 'word' ? 'words' : mode;
  const lit = effectiveMode === 'words' ? display.lit : secondsFor(time.getSeconds(), lang.dir);

  const toggleMode = () => {
    if (lang.layout === 'word') return;
    tapHaptic();
    setMode((prev) => (prev === 'words' ? 'seconds' : 'words'));
  };

  // Desktop pads the sheet's 340px + 12px margin + 12px gap out of the box, which recentres
  // the face beside it. Mobile lifts the face with a transform instead: iOS 18 never
  // re-resolves container-query units while the query container's own box animates, so
  // padding there left the letters at a stale size until a later repaint snapped them (D37).
  // Panel width + its margin + a gap, plus whatever the panel itself is inset by (Android's
  // landscape nav bar sits on the right)
  const sheetInset = settingsOpen ? 'md:pr-[calc(364px+env(safe-area-inset-right))]' : '';
  const sheetLift = settingsOpen ? 'max-md:-translate-y-[30dvh] max-md:scale-90' : '';
  // The fullbleed dial is absolutely positioned, so it centres on the padding box and the
  // panel would cover its right columns — slide it into the free half instead
  const sheetShift = settingsOpen ? 'md:translate-x-[calc(-182px-env(safe-area-inset-right)/2)]' : '';

  const onWall = settings.presentation === 'wall' && !docked;

  const corners = settings.dots === 'corners' && <CornerDots letter={finish.letter} />;

  const dial = (
    <>
      {settings.dots === 'minutes' && (
        <MinuteDots count={display.dots} finish={finish} visible={effectiveMode === 'words'} nearEdge={onWall} />
      )}
      <ClockFace
        rows={lang.rows}
        lit={lit}
        finish={finish}
        cellOverrides={lang.cellOverrides}
        layout={lang.layout}
        dir={lang.dir}
        onClick={toggleMode}
      />
    </>
  );

  if (onWall) {
    return (
      <main
        className={`group flex h-dvh w-dvw items-center justify-center overflow-hidden bg-[radial-gradient(120%_100%_at_50%_20%,#38342f,#211f1c)] font-[DINish,'Noto_Sans'] transition-[padding,filter] duration-300 [container-type:size] ${sheetInset}`}
        style={{ filter: `brightness(${brightness})` }}
        data-settings-open={settingsOpen || undefined}
      >
        <div
          className={`relative flex aspect-square h-[80cqmin] items-center justify-center transition-transform duration-300 [container-type:size] [box-shadow:0_25px_50px_rgba(0,0,0,0.6),0_4px_10px_rgba(0,0,0,0.4)] ${sheetLift}`}
          style={{ background: finish.surface }}
        >
          {corners}
          {dial}
        </div>
      </main>
    );
  }

  return (
    <main
      className={`group relative flex h-dvh w-dvw items-center justify-center overflow-hidden font-[DINish,'Noto_Sans'] transition-[padding,filter] duration-300 [container-type:size] ${sheetInset}`}
      style={{ background: finish.surface, filter: `brightness(${brightness})` }}
      data-docked={docked || undefined}
      data-settings-open={settingsOpen || undefined}
    >
      {corners}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-transform duration-300 ${sheetLift} ${sheetShift}`}
      >
        {dial}
      </div>
    </main>
  );
}
