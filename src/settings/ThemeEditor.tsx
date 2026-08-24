import * as React from 'react';
import * as Slider from '@radix-ui/react-slider';
import { ChevronLeft } from 'lucide-react';
import { FINISHES } from '../finishes/catalog';
import {
  endSelectionHaptic,
  selectionHaptic,
  startSelectionHaptic,
  tapHaptic,
} from '../native/haptics';
import { isNative } from '../native/useNative';
import {
  DEFAULT_DRAFT,
  DIM_DEFAULT,
  fallbackName,
  GLOW_DEFAULT,
  INK,
  LED_PRESETS,
  lightLetters,
  resolveCustom,
  SOLID_PRESETS,
  type CustomTheme,
  type Theme,
  type ThemeBackground,
} from '../themes/model';
import { deletePhoto, importPhoto, loadPhoto, savePhoto } from '../themes/photoStore';
import { useSettings } from './SettingsContext';

type ThemeEditorProps = {
  // null creates a fresh theme; an id edits an existing one
  themeId: string | null;
  onDone: () => void;
  onPreview: (theme: Theme | null) => void;
};

type Draft = Omit<CustomTheme, 'id'>;

const WHEEL_RING =
  'conic-gradient(from 200deg, #ff6b6b, #ffb86b, #f2e26a, #7bd98d, #6bbcf5, #9b7bf0, #ff6b6b)';

type SwatchProps = {
  title: string;
  active: boolean;
  background: string;
  onClick: () => void;
};

// Circles stay full-bleed; selection shrinks the color inside its own ring (iOS-style), so
// the ring lives INSIDE the box and nothing can clip it
function SwatchButton({ title, active, background, onClick }: SwatchProps) {
  return (
    <button
      aria-label={title}
      title={title}
      className={`size-6 shrink-0 rounded-full ${active ? 'border-2 border-white p-[1.5px] bg-clip-content' : 'border border-white/20'}`}
      style={{ background, backgroundSize: 'cover', backgroundPosition: 'center' }}
      onClick={() => {
        tapHaptic();
        onClick();
      }}
    />
  );
}

type WheelProps = {
  label: string;
  active: boolean;
  value: string;
  onChange: (hex: string) => void;
};

// The iOS-style ring: harmonized hues around a dark hole, the native picker underneath.
// Selection is an outline — safe here because the wheels sit in rows that never scroll
function ColorWheel({ label, active, value, onChange }: WheelProps) {
  return (
    <span
      className={`relative size-6 shrink-0 rounded-full ${active ? 'outline-2 outline-offset-2 outline-white' : ''}`}
      style={{ background: WHEEL_RING, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.25)' }}
    >
      <span
        className="absolute inset-[6px] rounded-full"
        style={{ background: active ? value : '#2a2a2c' }}
      />

      <input
        type="color"
        aria-label={label}
        value={value}
        className="absolute inset-0 size-full cursor-pointer opacity-0"
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
      />
    </span>
  );
}

type EditorRowProps = { label: string; children: React.ReactNode };

function EditorRow({ label, children }: EditorRowProps) {
  return (
    <div className="flex min-h-[46px] w-full items-center gap-2.5 px-4 py-2">
      <span className="w-10 shrink-0 text-left text-[13px] text-white/60">{label}</span>
      {children}
    </div>
  );
}

type SliderRowProps = {
  label: string;
  value: number;
  max: number;
  defaultValue: number;
  onChange: (value: number) => void;
};

function SliderRow({ label, value, max, defaultValue, onChange }: SliderRowProps) {
  const dirty = value !== defaultValue;
  return (
    <EditorRow label={label}>
      <Slider.Root
        value={[value]}
        min={0}
        max={max}
        step={0.01}
        className="relative flex h-5 flex-1 items-center"
        data-vaul-no-drag
        onPointerDown={startSelectionHaptic}
        onValueChange={([next]) => {
          selectionHaptic();
          onChange(next);
        }}
        onValueCommit={endSelectionHaptic}
      >
        <Slider.Track className="relative h-1 grow rounded-full bg-white/20">
          <Slider.Range className="absolute h-full rounded-full bg-white" />
        </Slider.Track>
        <Slider.Thumb aria-label={label} className="block size-[22px] rounded-full bg-white shadow-md" />
      </Slider.Root>
      <span className="w-9 text-right text-[13px] tabular-nums text-white/60">
        {Math.round(value * 100)}%
      </span>
      <button
        aria-label={`Reset ${label.toLowerCase()}`}
        className={`text-[15px] ${dirty ? 'text-[#8db6ff]' : 'text-[#55555a]'}`}
        onClick={() => {
          tapHaptic();
          onChange(defaultValue);
        }}
      >
        ↺
      </button>
    </EditorRow>
  );
}

export function ThemeEditor({ themeId, onDone, onPreview }: ThemeEditorProps) {
  const { settings, update } = useSettings();
  const editing = themeId ? settings.customThemes.find((theme) => theme.id === themeId) : undefined;
  const [draft, setDraft] = React.useState<Draft>(() =>
    editing ? { ...editing } : { ...DEFAULT_DRAFT },
  );
  // The photo rides editor state and only lands in the store on Save, so a cancelled
  // edit leaves nothing behind
  const [photo, setPhoto] = React.useState<string | null>(() =>
    themeId ? loadPhoto(localStorage, themeId) : null,
  );
  const photoInput = React.useRef<HTMLInputElement>(null);

  // The live preview is the real face behind the sheet (D52), a sibling tree — pushed from
  // the handlers, not an effect, so re-renders can't feed back into it
  const push = (nextDraft: Draft, nextPhoto: string | null) =>
    onPreview(resolveCustom({ ...nextDraft, id: themeId ?? 'draft' }, nextPhoto));

  const set = (patch: Partial<Draft>) => {
    const next = { ...draft, ...patch };
    setDraft(next);
    push(next, photo);
  };

  // A polarity flip re-defaults the LED — ink on a light front, white on a dark one — but
  // only the flip does: whatever the user picks afterwards renders literally
  const backgroundPatch = (background: ThemeBackground): Partial<Draft> => {
    if (lightLetters(draft.background) === lightLetters(background)) return { background };
    return { background, ledColor: lightLetters(background) ? '#ffffff' : INK };
  };

  const setBackground = (background: ThemeBackground) => set(backgroundPatch(background));

  // Mount shows the boot state on the face at once; unmount hands the face back
  React.useEffect(() => {
    push(draft, photo);
    return () => onPreview(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount/unmount only
  }, []);

  const bg = draft.background;
  const customSolid =
    bg.kind === 'solid' && !SOLID_PRESETS.some((preset) => preset.hex === bg.color);
  const customLed = !LED_PRESETS.some((preset) => preset.hex === draft.ledColor);

  const pickPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const imported = await importPhoto(file);
      const next: Draft = {
        ...draft,
        ...backgroundPatch({ kind: 'photo', luminance: imported.luminance }),
      };
      setPhoto(imported.dataUrl);
      setDraft(next);
      push(next, imported.dataUrl);
    } catch {
      // Undecodable pick — keep the current background
    }
  };

  const save = () => {
    tapHaptic();
    const id = themeId ?? `custom-${crypto.randomUUID()}`;
    const others = settings.customThemes.filter((theme) => theme.id !== id);
    const name = draft.name.trim() || fallbackName(others);
    const theme: CustomTheme = { ...draft, id, name };
    if (draft.background.kind === 'photo' && photo) savePhoto(localStorage, id, photo);
    if (draft.background.kind !== 'photo') deletePhoto(localStorage, id);
    update({
      customThemes: editing
        ? settings.customThemes.map((existing) => (existing.id === id ? theme : existing))
        : [...settings.customThemes, theme],
      themeId: id,
    });
    onDone();
  };

  const remove = () => {
    if (!themeId) return;
    tapHaptic();
    deletePhoto(localStorage, themeId);
    update({
      customThemes: settings.customThemes.filter((theme) => theme.id !== themeId),
      // Deleting the active theme falls back to Deep Black (D52)
      themeId: settings.themeId === themeId ? 'deep-black' : settings.themeId,
    });
    onDone();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-2 grid grid-cols-[1fr_auto_1fr] items-center px-3.5">
        <button
          aria-label="Back"
          className="flex items-center gap-1 justify-self-start py-2"
          onClick={() => {
            tapHaptic();
            onDone();
          }}
        >
          <ChevronLeft className="size-[22px] text-white/80" />
          <span className="text-[13px] text-white/80">Themes</span>
        </button>
        <span className="text-[15px] leading-none font-semibold text-neutral-100">
          {editing ? editing.name : 'New Theme'}
        </span>
        {editing ? (
          <button
            className="justify-self-end py-2 text-[13px] text-[#ff6b5e]"
            onClick={remove}
          >
            Delete
          </button>
        ) : (
          <span />
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3.5">
        <div className="divide-y divide-white/10 overflow-hidden rounded-xl bg-white/[0.08]">
          <EditorRow label="Name">
            <input
              value={draft.name}
              placeholder="Custom Theme"
              className="min-w-0 flex-1 bg-transparent text-right text-[14.5px] text-neutral-100 placeholder:text-white/30 focus:outline-none"
              data-vaul-no-drag
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => set({ name: event.target.value })}
            />
          </EditorRow>
          <EditorRow label="Finish">
            {/* 18 finishes don't fit a row — they wrap so every swatch stays fully visible */}
            <div className="flex flex-1 flex-wrap items-center justify-end gap-1.5">
              {FINISHES.map((finish) => (
                <SwatchButton
                  key={finish.id}
                  title={finish.name}
                  active={bg.kind === 'finish' && bg.finishId === finish.id}
                  background={finish.surface}
                  onClick={() => setBackground({ kind: 'finish', finishId: finish.id })}
                />
              ))}
            </div>
          </EditorRow>
          <EditorRow label="Solid">
            <div className="flex flex-1 items-center justify-end gap-2">
              {SOLID_PRESETS.map((preset) => (
                <SwatchButton
                  key={preset.hex}
                  title={preset.name}
                  active={bg.kind === 'solid' && bg.color === preset.hex}
                  background={preset.hex}
                  onClick={() => setBackground({ kind: 'solid', color: preset.hex })}
                />
              ))}
              <ColorWheel
                label="Custom solid color"
                active={customSolid}
                value={customSolid ? bg.color : '#0d1526'}
                onChange={(hex) => setBackground({ kind: 'solid', color: hex })}
              />
            </div>
          </EditorRow>
          {isNative() && (
            <EditorRow label="Photo">
              <div className="flex flex-1 items-center justify-end gap-2.5">
                <span className="text-[12px] text-white/35">from library</span>
                {photo && (
                  <SwatchButton
                    title="Picked photo"
                    active={bg.kind === 'photo'}
                    background={`url("${photo}")`}
                    onClick={() => photoInput.current?.click()}
                  />
                )}
                {!photo && (
                  <button
                    aria-label="Pick photo"
                    className="flex size-6 shrink-0 items-center justify-center rounded-full border border-dashed border-white/40 text-white/70"
                    onClick={() => {
                      tapHaptic();
                      photoInput.current?.click();
                    }}
                  >
                    +
                  </button>
                )}
                <input
                  ref={photoInput}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={pickPhoto}
                />
              </div>
            </EditorRow>
          )}
          {/* The 340px sheet leaves 230px after paddings and the label: 8 × 24px + 7 × 4px fits */}
          <EditorRow label="LED">
            <div className="flex flex-1 items-center justify-end gap-1">
              {LED_PRESETS.map((preset) => (
                <SwatchButton
                  key={preset.hex}
                  title={preset.name}
                  active={draft.ledColor === preset.hex}
                  background={preset.hex}
                  onClick={() => set({ ledColor: preset.hex })}
                />
              ))}
              <ColorWheel
                label="Custom LED color"
                active={customLed}
                value={draft.ledColor}
                onChange={(hex) => set({ ledColor: hex })}
              />
            </div>
          </EditorRow>
          <SliderRow
            label="Dim"
            value={draft.dimOpacity}
            max={0.4}
            defaultValue={DIM_DEFAULT}
            onChange={(value) => set({ dimOpacity: value })}
          />
          <SliderRow
            label="Glow"
            value={draft.glow}
            max={1}
            defaultValue={GLOW_DEFAULT}
            onChange={(value) => set({ glow: value })}
          />
        </div>
      </div>
      <div className="px-3.5 pt-3">
        <button
          className="w-full rounded-xl bg-[#e8e8ea] py-3 text-[15px] font-semibold text-[#1c1c1e] transition-opacity active:opacity-80"
          onClick={save}
        >
          Save
        </button>
      </div>
    </div>
  );
}
