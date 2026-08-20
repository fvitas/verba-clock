import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { tapHaptic } from '../../native/haptics';

type CellProps = { label: string; children?: ReactNode; onClick?: () => void };

export function Cell({ label, children, onClick }: CellProps) {
  const content = (
    <>
      <span className="flex-1 text-left text-[14.5px] text-neutral-100">{label}</span>
      {children}
      {onClick && <ChevronRight className="-mr-1 size-[18px] text-white/40" />}
    </>
  );
  const className = 'flex min-h-[46px] w-full items-center gap-2.5 px-4 py-2';
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
