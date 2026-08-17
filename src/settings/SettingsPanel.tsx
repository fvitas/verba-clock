import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Slider from '@radix-ui/react-slider';
import * as Switch from '@radix-ui/react-switch';
import { LANGUAGES } from '../clock/languages';
import { FINISHES } from '../finishes/catalog';
import { isNative } from '../native/useNative';
import { useSettings } from './SettingsContext';
import type { Presentation } from './store';

const PRESENTATIONS: { value: Presentation; label: string }[] = [
  { value: 'fullbleed', label: 'Full-bleed' },
  { value: 'wall', label: 'Wall' },
];

export function SettingsPanel() {
  const { settings, update } = useSettings();

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          aria-label="Settings"
          className="fixed right-5 bottom-5 z-10 rounded-full p-2 text-xl opacity-30 transition-opacity hover:opacity-100"
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => event.stopPropagation()}
        >
          ⚙
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed top-0 right-0 z-20 h-dvh w-80 overflow-y-auto bg-neutral-900/95 p-6 text-neutral-100 backdrop-blur">
          <Dialog.Title className="mb-6 text-sm font-semibold tracking-[0.3em] uppercase">Verba</Dialog.Title>

          <section className="mb-6">
            <h3 className="mb-3 text-xs tracking-widest text-neutral-400 uppercase">Finish</h3>
            <div className="grid grid-cols-4 gap-3">
              {FINISHES.map((finish) => (
                <button
                  key={finish.id}
                  aria-label={finish.name}
                  title={finish.name}
                  className={`aspect-square rounded-full border ${
                    settings.finishId === finish.id ? 'border-white ring-2 ring-white/60' : 'border-white/20'
                  }`}
                  style={{ background: finish.surface }}
                  onClick={() => update({ finishId: finish.id })}
                />
              ))}
            </div>
          </section>

          <section className="mb-6">
            <h3 className="mb-3 text-xs tracking-widest text-neutral-400 uppercase">Language</h3>
            <select
              aria-label="Language"
              value={settings.languageId}
              className="w-full rounded border border-white/15 bg-white/5 px-3 py-2 text-sm text-neutral-100 hover:bg-white/10"
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) => update({ languageId: event.target.value })}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id} className="bg-neutral-900 text-neutral-100">
                  {lang.name} — {lang.sample}
                </option>
              ))}
            </select>
          </section>

          <section className="mb-6">
            <h3 className="mb-3 text-xs tracking-widest text-neutral-400 uppercase">Presentation</h3>
            <div className="flex gap-2">
              {PRESENTATIONS.map((p) => (
                <button
                  key={p.value}
                  className={`flex-1 rounded px-3 py-2 text-sm ${
                    settings.presentation === p.value ? 'bg-white/15' : 'bg-white/5 hover:bg-white/10'
                  }`}
                  onClick={() => update({ presentation: p.value })}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </section>

          <section className="mb-6 flex items-center justify-between">
            <h3 className="text-xs tracking-widest text-neutral-400 uppercase">"It is" words</h3>
            <Switch.Root
              checked={settings.showItIs}
              onCheckedChange={(checked) => update({ showItIs: checked })}
              className="h-6 w-10 rounded-full bg-white/15 data-[state=checked]:bg-white/60"
            >
              <Switch.Thumb className="block size-5 translate-x-0.5 rounded-full bg-white transition-transform data-[state=checked]:translate-x-[18px]" />
            </Switch.Root>
          </section>

          {isNative() && (
            <section className="mb-6 flex items-center justify-between">
              <h3 className="text-xs tracking-widest text-neutral-400 uppercase">Keep screen awake</h3>
              <Switch.Root
                checked={settings.keepAwake}
                onCheckedChange={(checked: boolean) => update({ keepAwake: checked })}
                className="h-6 w-10 rounded-full bg-white/15 data-[state=checked]:bg-white/60"
              >
                <Switch.Thumb className="block size-5 translate-x-0.5 rounded-full bg-white transition-transform data-[state=checked]:translate-x-[18px]" />
              </Switch.Root>
            </section>
          )}

          <section className="mb-6">
            <h3 className="mb-3 text-xs tracking-widest text-neutral-400 uppercase">Brightness</h3>
            <Slider.Root
              value={[settings.brightness]}
              min={0.2}
              max={1}
              step={0.05}
              onValueChange={([value]) => update({ brightness: value })}
              className="relative flex h-5 items-center"
            >
              <Slider.Track className="relative h-1 grow rounded-full bg-white/15">
                <Slider.Range className="absolute h-full rounded-full bg-white/60" />
              </Slider.Track>
              <Slider.Thumb aria-label="Brightness" className="block size-4 rounded-full bg-white" />
            </Slider.Root>
          </section>

          <Dialog.Close asChild>
            <button className="mt-2 w-full rounded bg-white/10 px-3 py-2 text-sm hover:bg-white/20">Close</button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
