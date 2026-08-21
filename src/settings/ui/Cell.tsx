import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { tapHaptic } from '../../native/haptics';

type CellProps = { label: string; children?: ReactNode; stacked?: boolean; onClick?: () => void };

// `stacked` drops the control onto its own full-width line, for rows with too many options
// to sit beside their label
export function Cell({ label, children, stacked, onClick }: CellProps) {
  const content = (
    <>
      <span className="flex-1 text-left text-[14.5px] text-neutral-100">{label}</span>
      {children}
      {onClick && <ChevronRight className="-mr-1 size-[18px] text-white/40" />}
    </>
  );
  const className = stacked
    ? 'flex w-full flex-col items-stretch gap-2 px-4 py-2.5'
    : 'flex min-h-[46px] w-full items-center gap-2.5 px-4 py-2';
  if (onClick) {
    return (
      <button
        className={`${className} transition-colors active:bg-white/10`}
        onClick={() => {
          tapHaptic();
          onClick();
        }}
      >
        {content}
      </button>
    );
  }
  return <div className={className}>{content}</div>;
}
