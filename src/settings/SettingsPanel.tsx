import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Slider from '@radix-ui/react-slider';
import { Settings } from 'lucide-react';
import { getLanguage } from '../clock/languages';
import { FINISHES, getFinish } from '../finishes/catalog';
import { isNative } from '../native/useNative';
import { supportsWakeLock } from '../native/useWakeLock';
import { LanguageList } from './LanguageList';
import { useSettings } from './SettingsContext';
import type { Presentation } from './store';
import { Cell } from './ui/Cell';
import { Group } from './ui/Group';
import { Segmented } from './ui/Segmented';
import { SwatchRow } from './ui/SwatchRow';
import { Toggle } from './ui/Toggle';

const PRESENTATIONS: { value: Presentation; label: string }[] = [
  { value: 'fullbleed', label: 'Full-bleed' },
  { value: 'wall', label: 'Wall' },
];

type SettingsPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type View = 'main' | 'language';

export function SettingsPanel({ open, onOpenChange }: SettingsPanelProps) {
  const { settings, update } = useSettings();
  const [view, setView] = React.useState<View>('main');
  const cogColor =
    getFinish(settings.finishId).letter === 'light'
      ? 'text-white/50 hover:text-white'
      : 'text-black/50 hover:text-black';

  const openChange = (next: boolean) => {
    if (!next) setView('main');
    onOpenChange(next);
  };

  return (
    <Dialog.Root open={open} onOpenChange={openChange}>
      <Dialog.Trigger asChild>
        <button
          aria-label="Settings"
          className={`fixed bottom-5 left-1/2 z-10 -translate-x-1/2 rounded-full p-2 transition-colors ${cogColor}`}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => event.stopPropagation()}
        >
          <Settings className="size-5" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/35 md:bg-transparent" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-20 flex max-h-[70dvh] flex-col overflow-hidden rounded-t-2xl bg-neutral-900/55 pb-6 text-neutral-100 backdrop-blur-2xl [animation:sheet-up_.3s_ease-out] md:inset-x-auto md:top-3 md:right-3 md:bottom-3 md:max-h-none md:w-[340px] md:rounded-2xl md:[animation:sheet-in-right_.3s_ease-out]"
        >
          <div className="mx-auto mt-2 h-1.5 w-9 rounded-full bg-white/25 md:hidden" />
          {view === 'language' ? (
            <>
              <Dialog.Title className="sr-only">Language</Dialog.Title>
              <div className="flex min-h-0 flex-1 flex-col pt-3">
                <LanguageList
                  selectedId={settings.languageId}
                  onSelect={(id) => update({ languageId: id })}
                  onBack={() => setView('main')}
                />
              </div>
            </>
          ) : (
            <>
              <Dialog.Title className="pt-2 pb-1 text-center text-[15px] font-semibold md:px-4 md:pt-4 md:text-left">
                Settings
              </Dialog.Title>
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
                      onValueChange={([value]) => update({ brightness: value })}
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
                  <Cell label="Language" onClick={() => setView('language')}>
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
                </Group>
                {(isNative() || supportsWakeLock()) && (
                  <Group label="Device">
                    <Cell label="Keep screen awake">
                      <Toggle
                        checked={settings.keepAwake}
                        aria-label="Keep screen awake"
                        onCheckedChange={(checked) => update({ keepAwake: checked })}
                      />
                    </Cell>
                  </Group>
                )}
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
