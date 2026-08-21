import * as React from 'react';
import { tapHaptic } from '../../native/haptics';

type SegmentedOption<T extends string> = { value: T; label: string };

type SegmentedProps<T extends string> = {
  options: SegmentedOption<T>[];
  value: T;
  full?: boolean;
  onChange: (value: T) => void;
};

export function Segmented<T extends string>({ options, value, full, onChange }: SegmentedProps<T>) {
  return (
    <div role="radiogroup" className={`flex rounded-lg bg-white/15 p-0.5 ${full ? 'w-full' : 'shrink-0'}`}>
      {options.map((option) => (
        <button
          key={option.value}
          role="radio"
          aria-checked={option.value === value}
          // Four equal segments have to hold their labels on a 320px screen, so a full-width
          // row buys the space back from the font
          className={`rounded-md py-1 whitespace-nowrap transition-colors ${
            full ? 'flex-1 px-0.5 text-[11.5px]' : 'px-2.5 text-[12.5px]'
          } ${option.value === value ? 'bg-white/25 font-medium text-white' : 'text-white/75'}`}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation();
            tapHaptic();
            // With two options the control acts as a toggle: clicking the active side flips too
            const next =
              option.value === value && options.length === 2
                ? (options.find((o) => o.value !== value)?.value ?? option.value)
                : option.value;
            onChange(next);
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
