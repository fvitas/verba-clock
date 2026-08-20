import * as React from 'react';
import { tapHaptic } from '../../native/haptics';

type SegmentedOption<T extends string> = { value: T; label: string };

type SegmentedProps<T extends string> = {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function Segmented<T extends string>({ options, value, onChange }: SegmentedProps<T>) {
  return (
    <div role="radiogroup" className="flex shrink-0 rounded-lg bg-white/15 p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          role="radio"
          aria-checked={option.value === value}
          className={`rounded-md px-2.5 py-1 text-[12.5px] transition-colors ${
            option.value === value ? 'bg-white/25 font-medium text-white' : 'text-white/75'
          }`}
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
