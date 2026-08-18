import { LANGUAGES } from '../clock/languages';

type LanguageListProps = {
  selectedId: string;
  onSelect: (id: string) => void;
  onBack: () => void;
};

export function LanguageList({ selectedId, onSelect, onBack }: LanguageListProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-2">
        <button aria-label="Back" className="flex w-full items-center gap-1.5 px-4 py-2" onClick={onBack}>
          <span className="pb-0.5 text-[22px] leading-none text-white/80">‹</span>
          <span className="text-[15px] leading-none font-semibold text-neutral-100">Language</span>
        </button>
      </div>
      <div className="mx-3.5 min-h-0 flex-1 divide-y divide-white/10 overflow-y-auto rounded-xl bg-white/[0.08]">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.id}
            className="flex min-h-[46px] w-full items-center gap-2.5 px-4 py-2 transition-colors active:bg-white/10"
            onClick={() => onSelect(lang.id)}
          >
            <span className="flex-1 text-left text-[14.5px] text-neutral-100">{lang.name}</span>
            <span className="text-[12px] text-white/40">{lang.sample}</span>
            {lang.id === selectedId && (
              <span data-selected className="text-[17px] text-white">
                ✓
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
