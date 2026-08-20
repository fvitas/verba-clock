import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Slider from '@radix-ui/react-slider';
import { Settings } from 'lucide-react';
import { Drawer } from 'vaul';
import { getLanguage } from '../clock/languages';
import { FINISHES, getFinish } from '../finishes/catalog';
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
import { LanguageList } from './LanguageList';
import { useSettings } from './SettingsContext';
import type { DotsMode, Presentation } from './store';
import { Cell } from './ui/Cell';
import { Group } from './ui/Group';
import { Segmented } from './ui/Segmented';
import { SwatchRow } from './ui/SwatchRow';
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
};

type View = 'main' | 'language';

// Vaul bundles its own Radix Dialog, so the a11y title must come from the
// namespace that rendered the surrounding Content
type PanelTitle = React.ComponentType<React.PropsWithChildren<{ className?: string }>>;

type PanelBodyProps = {
  view: View;
  Title: PanelTitle;
  onShowLanguage: () => void;
  onBack: () => void;
};

function PanelBody({ view, Title, onShowLanguage, onBack }: PanelBodyProps) {
  const { settings, update } = useSettings();

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
          <Cell label="Finish">
            <SwatchRow
              swatches={FINISHES}
              selectedId={settings.finishId}
              onSelect={(id) => update({ finishId: id })}
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

export function SettingsPanel({ open, docked, onOpenChange }: SettingsPanelProps) {
  const { settings } = useSettings();
  const isDesktop = useIsDesktop();
  const [view, setView] = React.useState<View>('main');
  const cogColor =
    getFinish(settings.finishId).letter === 'light'
      ? 'text-white/50 hover:text-white'
      : 'text-black/50 hover:text-black';

  const openChange = (next: boolean) => {
    tapHaptic();
    if (!next) setView('main');
    onOpenChange(next);
  };

  // Android's back gesture: pop the language list, then the panel, then leave the app
  useBackButton(() => {
    if (!open) return false;
    if (view === 'language') {
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
      onShowLanguage={() => setView('language')}
      onBack={() => setView('main')}
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
