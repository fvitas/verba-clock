import { useEffect, useRef, useState, type RefObject } from 'react';
import { resolveTime } from './clock/engine';
import { getLanguage } from './clock/languages';
import { mirrorCols, resolveSeconds } from './clock/seconds';
import { resolveTransition, SPECS } from './clock/transitions';
import { useArrival } from './clock/use-arrival';
import { useClockTime } from './clock/use-clock-time';
import { ClockFace } from './components/ClockFace';
import { CornerDots } from './components/CornerDots';
import { MinuteDots } from './components/MinuteDots';
import type { LightPlaySetting } from './lightplay/effects';
import { EMPTY_LIT, useLightPlay } from './lightplay/useLightPlay';
import { resolveTheme, type Theme } from './themes/model';
import { loadPhoto } from './themes/photoStore';
import { tapHaptic } from './native/haptics';
import { syncSystemBarGlyphs } from './native/systemBars';
import { useDockMode } from './native/useDockMode';
import { useNative } from './native/useNative';
import { useReducedMotion } from './native/useReducedMotion';
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
  // The theme editor's draft, live on the real face while the sheet is up
  const [previewTheme, setPreviewTheme] = useState<Theme | null>(null);
  const docked = useDockMode(settings.dockMode);
  // The panel plays light play on the live face, which lives in a sibling tree
  const playEffect = useRef<(id: LightPlaySetting) => void>(() => {});

  return (
    <>
      <ClockScreen
        settingsOpen={settingsOpen}
        docked={docked}
        playEffect={playEffect}
        previewTheme={previewTheme}
      />
      <SettingsPanel
        open={settingsOpen}
        docked={docked}
        onOpenChange={setSettingsOpen}
        onPreviewEffect={(id) => playEffect.current(id)}
        onPreviewTheme={setPreviewTheme}
      />
    </>
  );
}

type Mode = 'words' | 'seconds';

const secondsFor = (seconds: number, dir?: 'rtl'): ReadonlySet<string> => {
  const lit = resolveSeconds(seconds);
  return dir === 'rtl' ? mirrorCols(lit) : lit;
};

type ClockScreenProps = {
  settingsOpen: boolean;
  docked: boolean;
  playEffect: RefObject<(id: LightPlaySetting) => void>;
  previewTheme: Theme | null;
};

function ClockScreen({ settingsOpen, docked, playEffect, previewTheme }: ClockScreenProps) {
  const { settings } = useSettings();
  const time = useClockTime();
  const [mode, setMode] = useState<Mode>('words');
  const reducedMotion = useReducedMotion();
  // A docked clock must stay lit regardless of the keep-awake setting
  useNative(settings.keepAwake || docked);
  useWakeLock(settings.keepAwake || docked);

  const brightness = docked ? Math.min(settings.brightness, 0.3) : settings.brightness;
  const lang = getLanguage(settings.languageId);
  const theme =
    previewTheme ??
    resolveTheme(settings.themeId, settings.customThemes, loadPhoto(localStorage, settings.themeId));
  // Tracks the editor's live preview too, so glyphs flip while a draft front is on the face
  useEffect(() => {
    syncSystemBarGlyphs(theme);
  }, [theme.letter]);

  const display = resolveTime(time.getHours(), time.getMinutes(), lang, settings.showItIs);
  // Seconds digits render on the letter matrix — word-grid faces (Arabic) have none
  const effectiveMode = lang.layout === 'word' ? 'words' : mode;
  const lit = effectiveMode === 'words' ? display.lit : secondsFor(time.getSeconds(), lang.dir);

  // Light play is inert on e-ink (a panel's pixel flips, it never fades), on the Arabic word
  // grid, and while docked
  const lightPlay = useLightPlay({
    enabled: !docked && !theme.eink && lang.layout !== 'word',
    effectId: settings.lightPlay,
    liveLit: lit,
    rows: lang.rows,
    theme,
    dir: lang.dir,
    cellOverrides: lang.cellOverrides,
  });
  useEffect(() => {
    playEffect.current = lightPlay.play;
  });

  const transition = lightPlay.active
    ? 'instant'
    : resolveTransition({
        setting: settings.transition,
        seconds: effectiveMode === 'seconds',
        docked,
        reducedMotion,
        eink: Boolean(theme.eink),
      });
  const arrival = useArrival({ lit, dots: display.dots }, transition !== 'instant', SPECS[transition].dark);

  const toggleMode = () => {
    if (lang.layout === 'word') return;
    // A click that ended a swipe, or landed during a run, belongs to light play — not to seconds
    if (lightPlay.consumeClick()) return;
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

  // The wall panel is a lit object in a room — drop-shadowed, floating on dark chrome. An
  // e-ink face is the surface itself, so it always fills the screen like a real panel would
  const onWall = settings.presentation === 'wall' && !docked && !theme.eink;

  const corners = settings.dots === 'corners' && <CornerDots theme={theme} />;

  const dial = (
    <>
      {settings.dots === 'minutes' && (
        <MinuteDots
          count={lightPlay.takeover ? 0 : arrival.face.dots}
          theme={theme}
          visible={effectiveMode === 'words'}
          nearEdge={onWall}
          transition={transition}
          dark={arrival.dark}
        />
      )}
      <ClockFace
        rows={lang.rows}
        lit={lightPlay.takeover ? EMPTY_LIT : arrival.face.lit}
        theme={theme}
        transition={transition}
        dark={arrival.dark}
        cellOverrides={lang.cellOverrides}
        layout={lang.layout}
        dir={lang.dir}
        onPointerDown={lightPlay.gestureProps.onPointerDown}
        onPointerMove={lightPlay.gestureProps.onPointerMove}
        onPointerUp={lightPlay.gestureProps.onPointerUp}
        onPointerLeave={lightPlay.gestureProps.onPointerLeave}
        onPointerCancel={lightPlay.gestureProps.onPointerCancel}
        onClick={toggleMode}
      />
      {lightPlay.overlay}
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
          style={{ background: theme.surface }}
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
      style={{ background: theme.surface, filter: `brightness(${brightness})` }}
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
