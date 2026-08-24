import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Slider from '@radix-ui/react-slider';
import { Settings } from 'lucide-react';
import { Drawer } from 'vaul';
import { getLanguage } from '../clock/languages';
import { resolveTheme, type Theme } from '../themes/model';
import { loadPhoto } from '../themes/photoStore';
import {
  endSelectionHaptic,
  selectionHaptic,
  startSelectionHaptic,
  supportsHaptics,
  tapHaptic,
} from '../native/haptics';
import { useBackButton } from '../native/useBackButton';
import { supportsDock } from '../native/useDockMode';
import { isNative } from '../native/useNative';
import { supportsWakeLock } from '../native/useWakeLock';
import { getEffect, type LightPlaySetting } from '../lightplay/effects';
import { LightPlayList } from './LightPlayList';
import { LanguageFlag } from './LanguageFlag';
import { LanguageList } from './LanguageList';
import { useSettings } from './SettingsContext';
import { ThemeEditor } from './ThemeEditor';
import { ThemeList } from './ThemeList';
import type { DotsMode, Presentation, Transition } from './store';
import { Cell } from './ui/Cell';
import { Group } from './ui/Group';
import { Segmented } from './ui/Segmented';
import { Toggle } from './ui/Toggle';

const PRESENTATIONS: { value: Presentation; label: string }[] = [
  { value: 'fullbleed', label: 'Full-bleed' },
  { value: 'wall', label: 'Wall' },
];

const DOTS_MODES: { value: DotsMode; label: string }[] = [
  { value: 'corners', label: 'Corners' },
  { value: 'minutes', label: 'Minutes' },
  { value: 'off', label: 'Off' },
];

// The stored values name the mechanism; the labels name what you see
const TRANSITIONS: { value: Transition; label: string }[] = [
  { value: 'instant', label: 'Instant' },
  { value: 'crossfade', label: 'Fade' },
  { value: 'typewriter', label: 'Typewriter' },
  { value: 'offthenon', label: 'Blink' },
];

const DESKTOP = '(min-width: 768px)';

function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = React.useState(() => window.matchMedia(DESKTOP).matches);
  React.useEffect(() => {
    const query = window.matchMedia(DESKTOP);
    const onChange = (event: MediaQueryListEvent) => setIsDesktop(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return isDesktop;
}

type SettingsPanelProps = {
  open: boolean;
  docked: boolean;
  onOpenChange: (open: boolean) => void;
  onPreviewEffect?: (id: LightPlaySetting) => void;
  onPreviewTheme?: (theme: Theme | null) => void;
};

type View = 'main' | 'language' | 'lightplay' | 'theme' | 'themeEditor';

// Vaul bundles its own Radix Dialog, so the a11y title must come from the
// namespace that rendered the surrounding Content
type PanelTitle = React.ComponentType<React.PropsWithChildren<{ className?: string }>>;

type PanelBodyProps = {
  view: View;
  Title: PanelTitle;
  editingThemeId: string | null;
  onShowLanguage: () => void;
  onShowLightPlay: () => void;
  onShowThemes: () => void;
  onEditTheme: (id: string | null) => void;
  onBack: () => void;
  onPreviewEffect?: (id: LightPlaySetting) => void;
  onPreviewTheme?: (theme: Theme | null) => void;
};

function PanelBody({
  view,
  Title,
  editingThemeId,
  onShowLanguage,
  onShowLightPlay,
  onShowThemes,
  onEditTheme,
  onBack,
  onPreviewEffect,
  onPreviewTheme,
}: PanelBodyProps) {
  const { settings, update } = useSettings();
  const theme = resolveTheme(settings.themeId, settings.customThemes);

  if (view === 'themeEditor') {
    return (
      <>
        <Title className="sr-only">Theme editor</Title>
        <div className="flex min-h-0 flex-1 flex-col pt-3">
          <ThemeEditor
            themeId={editingThemeId}
            onDone={onShowThemes}
            onPreview={(preview) => onPreviewTheme?.(preview)}
          />
        </div>
      </>
    );
  }

  if (view === 'theme') {
    return (
      <>
        <Title className="sr-only">Theme</Title>
        <div className="flex min-h-0 flex-1 flex-col pt-3">
          <ThemeList
            selectedId={settings.themeId}
            customThemes={settings.customThemes}
            onSelect={(id) => update({ themeId: id })}
            onCreate={() => onEditTheme(null)}
            onEdit={(id) => onEditTheme(id)}
            onBack={onBack}
          />
        </div>
      </>
    );
  }

  if (view === 'lightplay') {
    return (
      <>
        <Title className="sr-only">Light play</Title>
        <div className="flex min-h-0 flex-1 flex-col pt-3">
          <LightPlayList
            selectedId={settings.lightPlay}
            onSelect={(id) => {
              update({ lightPlay: id });
              if (id !== 'off') onPreviewEffect?.(id);
            }}
            onBack={onBack}
          />
        </div>
      </>
    );
  }

  if (view === 'language') {
    return (
      <>
        <Title className="sr-only">Language</Title>
        <div className="flex min-h-0 flex-1 flex-col pt-3">
          <LanguageList
            selectedId={settings.languageId}
            onSelect={(id) => update({ languageId: id })}
            onBack={onBack}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <Title className="pt-2 pb-1 text-center text-[15px] font-semibold md:px-4 md:pt-4 md:text-left">
        Settings
      </Title>
      <div className="min-h-0 flex-1 overflow-y-auto px-3.5 pt-2">
        <Group label="Appearance">
          <Cell label="Theme" onClick={onShowThemes}>
            <span
              className="size-[18px] rounded-full border border-white/20"
              style={{
                background: resolveTheme(settings.themeId, settings.customThemes, loadPhoto(localStorage, settings.themeId)).surface,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <span className="text-sm text-white/45">{theme.name}</span>
          </Cell>
          <Cell label="Word Transition" stacked>
            <Segmented
              full
              options={TRANSITIONS}
              value={settings.transition}
              onChange={(value) => update({ transition: value })}
            />
          </Cell>
          <Cell label="Brightness">
            <Slider.Root
              value={[settings.brightness]}
              min={0.2}
              max={1}
              step={0.05}
              className="relative flex h-5 w-36 items-center"
              data-vaul-no-drag
              onPointerDown={startSelectionHaptic}
              onValueChange={([value]) => {
                selectionHaptic();
                update({ brightness: value });
              }}
              onValueCommit={endSelectionHaptic}
            >
              <Slider.Track className="relative h-1 grow rounded-full bg-white/20">
                <Slider.Range className="absolute h-full rounded-full bg-white" />
              </Slider.Track>
              <Slider.Thumb
                aria-label="Brightness"
                className="block size-[22px] rounded-full bg-white shadow-md"
              />
            </Slider.Root>
          </Cell>
        </Group>
        <Group label="Clock">
          <Cell label="Language" onClick={onShowLanguage}>
            <LanguageFlag languageId={settings.languageId} />
            <span className="text-sm text-white/45">{getLanguage(settings.languageId).name}</span>
          </Cell>
          <Cell label="Presentation">
            <Segmented
              options={PRESENTATIONS}
              value={settings.presentation}
              onChange={(value) => update({ presentation: value })}
            />
          </Cell>
          <Cell label="“It is” words">
            <Toggle
              checked={settings.showItIs}
              aria-label="It is words"
              onCheckedChange={(checked) => update({ showItIs: checked })}
            />
          </Cell>
          <Cell label="Dots">
            <Segmented
              options={DOTS_MODES}
              value={settings.dots}
              onChange={(value) => update({ dots: value })}
            />
          </Cell>
          {/* Light play is inert on e-ink themes and word-grid faces, so the row goes with them */}
          {!theme.eink && getLanguage(settings.languageId).layout !== 'word' ? (
            <Cell label="Light play" onClick={onShowLightPlay}>
              <span className="text-sm text-white/45">{getEffect(settings.lightPlay)?.label ?? 'Off'}</span>
            </Cell>
          ) : (
            <Cell label="Light play">
              <span className="text-sm text-white/30">Off</span>
            </Cell>
          )}
        </Group>
        {(isNative() || supportsWakeLock() || supportsDock() || supportsHaptics()) && (
          <Group label="Device">
            {(isNative() || supportsWakeLock()) && (
              <Cell label="Keep screen awake">
                <Toggle
                  checked={settings.keepAwake}
                  aria-label="Keep screen awake"
                  onCheckedChange={(checked) => update({ keepAwake: checked })}
                />
              </Cell>
            )}
            {supportsDock() && (
              <Cell label="Dock when charging">
                <Toggle
                  checked={settings.dockMode}
                  aria-label="Dock when charging"
                  onCheckedChange={(checked) => update({ dockMode: checked })}
                />
              </Cell>
            )}
            {supportsHaptics() && (
              <Cell label="Haptics">
                <Toggle
                  checked={settings.haptics}
                  aria-label="Haptics"
                  onCheckedChange={(checked) => update({ haptics: checked })}
                />
              </Cell>
            )}
          </Group>
        )}
      </div>
    </>
  );
}

export function SettingsPanel({ open, docked, onOpenChange, onPreviewEffect, onPreviewTheme }: SettingsPanelProps) {
  const { settings } = useSettings();
  const isDesktop = useIsDesktop();
  const [view, setView] = React.useState<View>('main');
  const [editingThemeId, setEditingThemeId] = React.useState<string | null>(null);
  const cogColor =
    resolveTheme(settings.themeId, settings.customThemes).letter === 'light'
      ? 'text-white/50 hover:text-white'
      : 'text-black/50 hover:text-black';

  const openChange = (next: boolean) => {
    tapHaptic();
    if (!next) setView('main');
    onOpenChange(next);
  };

  // Android's back gesture: pop the open subview, then the panel, then leave the app
  useBackButton(() => {
    if (!open) return false;
    if (view === 'themeEditor') {
      setView('theme');
      return true;
    }
    if (view !== 'main') {
      setView('main');
      return true;
    }
    openChange(false);
    return true;
  });

  const trigger = (
    <button
      aria-label="Settings"
      className={`fixed bottom-[calc(0.875rem+env(safe-area-inset-bottom))] z-10 -translate-x-1/2 rounded-full p-3.5 transition-[color,left] duration-300 ${open ? 'left-1/2 md:left-[calc(50%-182px-env(safe-area-inset-right)/2)]' : 'left-1/2'} ${cogColor}`}
    >
      <Settings className="size-6" />
    </button>
  );

  const body = (
    <PanelBody
      view={view}
      Title={isDesktop ? Dialog.Title : Drawer.Title}
      editingThemeId={editingThemeId}
      onShowLanguage={() => setView('language')}
      onShowLightPlay={() => setView('lightplay')}
      onShowThemes={() => setView('theme')}
      onEditTheme={(id) => {
        setEditingThemeId(id);
        setView('themeEditor');
      }}
      onBack={() => setView('main')}
      onPreviewEffect={onPreviewEffect}
      onPreviewTheme={onPreviewTheme}
    />
  );

  if (isDesktop) {
    return (
      <Dialog.Root open={open} onOpenChange={openChange}>
        {!docked && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0" />
          <Dialog.Content
            aria-describedby={undefined}
            className="fixed top-[calc(0.75rem+env(safe-area-inset-top))] right-[calc(0.75rem+env(safe-area-inset-right))] bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-20 flex w-[340px] flex-col overflow-hidden rounded-2xl bg-neutral-900/55 pb-6 text-neutral-100 backdrop-blur-2xl [animation:sheet-in-right_.3s_ease-out]"
          >
            {body}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  return (
    <Drawer.Root open={open} onOpenChange={openChange}>
      {!docked && <Drawer.Trigger asChild>{trigger}</Drawer.Trigger>}
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/35" />
        <Drawer.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-20 flex max-h-[70dvh] flex-col overflow-hidden rounded-t-2xl bg-neutral-900/55 pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-neutral-100 outline-none backdrop-blur-2xl"
        >
          <div className="mx-auto mt-2 h-1.5 w-9 shrink-0 rounded-full bg-white/25" />
          {body}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
