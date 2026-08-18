import type { ReactNode } from 'react';

type GroupProps = { label: string; children: ReactNode };

export function Group({ label, children }: GroupProps) {
  return (
    <section className="mb-4">
      <h3 className="mb-1.5 text-[11px] tracking-wider text-white/50 uppercase">{label}</h3>
      <div className="divide-y divide-white/10 overflow-hidden rounded-xl bg-white/[0.08]">{children}</div>
    </section>
  );
}
