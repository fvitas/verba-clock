import type * as React from 'react';
import { Check, ChevronLeft, Pencil, Plus } from 'lucide-react';
import { FINISHES } from '../finishes/catalog';
import { tapHaptic } from '../native/haptics';
import { CUSTOM_THEMES_ENABLED } from '../themes/flags';
import { resolveTheme, type CustomTheme } from '../themes/model';
import { loadPhoto } from '../themes/photoStore';

type ThemeListProps = {
  selectedId: string;
  customThemes: CustomTheme[];
  onSelect: (id: string) => void;
  onCreate: () => void;
  onEdit: (id: string) => void;
  onBack: () => void;
};

type RowProps = {
  name: string;
  surface: string;
  selected: boolean;
  onClick: () => void;
  onEdit?: () => void;
};

function ThemeRow({ name, surface, selected, onClick, onEdit }: RowProps) {
  return (
    <button
      className="flex min-h-[46px] w-full items-center gap-2.5 px-4 py-2 transition-colors active:bg-white/10"
      onClick={() => {
        tapHaptic();
        onClick();
      }}
    >
      <span
        className="size-6 shrink-0 rounded-full border border-white/20"
        style={{ background: surface, backgroundSize: 'cover', backgroundPosition: 'center' }}
      />
      <span className="text-left text-[14.5px] text-neutral-100">{name}</span>
      {/* The pencil rides the name, not the row's end; a span because buttons can't nest */}
      {onEdit && (
        <span
          role="button"
          aria-label={`Edit ${name}`}
          className="-my-1 rounded p-1 text-white/45 transition-colors active:text-white"
          onClick={(event: React.MouseEvent<HTMLSpanElement>) => {
            event.stopPropagation();
            tapHaptic();
            onEdit();
          }}
        >
          <Pencil className="size-4" />
        </span>
      )}
      <span className="flex-1" />
      {selected && <Check className="size-[17px] text-white" data-selected />}
    </button>
  );
}

// One list: the 18 built-ins, then saved customs, then create (D52)
export function ThemeList({ selectedId, customThemes, onSelect, onCreate, onEdit, onBack }: ThemeListProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-2">
        <button
          aria-label="Back"
          className="flex w-full items-center gap-1 px-3.5 py-2"
          onClick={() => {
            tapHaptic();
            onBack();
          }}
        >
          <ChevronLeft className="size-[22px] text-white/80" />
          <span className="text-[15px] leading-none font-semibold text-neutral-100">Theme</span>
        </button>
      </div>
      <div className="mx-3.5 min-h-0 flex-1 divide-y divide-white/10 overflow-y-auto rounded-xl bg-white/[0.08]">
        {FINISHES.map((finish) => (
          <ThemeRow
            key={finish.id}
            name={finish.name}
            surface={finish.surface}
            selected={finish.id === selectedId}
            onClick={() => onSelect(finish.id)}
          />
        ))}
        {customThemes.map((theme) => (
          <ThemeRow
            key={theme.id}
            name={theme.name}
            surface={resolveTheme(theme.id, customThemes, loadPhoto(localStorage, theme.id)).surface}
            selected={theme.id === selectedId}
            onClick={() => onSelect(theme.id)}
            onEdit={() => onEdit(theme.id)}
          />
        ))}
        {CUSTOM_THEMES_ENABLED && (
          <button
            className="flex min-h-[46px] w-full items-center gap-2.5 px-4 py-2 transition-colors active:bg-white/10"
            onClick={() => {
              tapHaptic();
              onCreate();
            }}
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-dashed border-white/40">
              <Plus className="size-3.5 text-white/70" />
            </span>
            <span className="flex-1 text-left text-[14.5px] text-neutral-100">Create custom theme</span>
          </button>
        )}
      </div>
    </div>
  );
}
