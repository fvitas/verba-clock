import { Check, ChevronLeft } from 'lucide-react';
import { EFFECTS, type LightPlaySetting } from '../lightplay/effects';
import { tapHaptic } from '../native/haptics';

type LightPlayListProps = {
  selectedId: LightPlaySetting;
  onSelect: (id: LightPlaySetting) => void;
  onBack: () => void;
};

const OPTIONS: { id: LightPlaySetting; label: string }[] = [
  ...EFFECTS.map(({ id, label }) => ({ id, label })),
  { id: 'off', label: 'Off' },
];

export function LightPlayList({ selectedId, onSelect, onBack }: LightPlayListProps) {
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
          <span className="text-[15px] leading-none font-semibold text-neutral-100">Light play</span>
        </button>
      </div>
      <p className="px-5 pb-2.5 text-[12px] leading-snug text-white/40">
        Swipe across the clock face and the letters play with light for a few seconds.
      </p>
      <div className="mx-3.5 min-h-0 flex-1 divide-y divide-white/10 overflow-y-auto rounded-xl bg-white/[0.08]">
        {OPTIONS.map((option) => (
          <button
            key={option.id}
            className="flex min-h-[46px] w-full items-center gap-2.5 px-4 py-2 transition-colors active:bg-white/10"
            onClick={() => {
              tapHaptic();
              onSelect(option.id);
            }}
          >
            <span className="flex-1 text-left text-[14.5px] text-neutral-100">{option.label}</span>
            {option.id === selectedId && <Check className="size-[17px] text-white" data-selected />}
          </button>
        ))}
      </div>
    </div>
  );
}
