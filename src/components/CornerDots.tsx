type CornerDotsProps = {
  letter: 'light' | 'dark';
};

const CORNERS = ['top-4 left-4', 'top-4 right-4', 'bottom-4 right-4', 'bottom-4 left-4'];

// Static decoration matching the hardware's corner fixtures — not a minute indicator
export function CornerDots({ letter }: CornerDotsProps) {
  const dotClass =
    letter === 'light'
      ? 'bg-white/60 [box-shadow:inset_0_1px_1px_rgba(255,255,255,0.5),0_1px_2px_rgba(0,0,0,0.4)]'
      : 'bg-[#181614] [box-shadow:inset_0_1px_1px_rgba(255,255,255,0.25),0_1px_2px_rgba(0,0,0,0.35)]';

  return (
    <>
      {CORNERS.map((corner) => (
        <span key={corner} className={`absolute size-2 rounded-full ${corner} ${dotClass}`} />
      ))}
    </>
  );
}
