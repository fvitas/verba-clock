type CornerDotsProps = {
  count: number;
  letter: 'light' | 'dark';
};

// Dots light clockwise from top-left, matching the hardware
const CORNERS = ['top-4 left-4', 'top-4 right-4', 'bottom-4 right-4', 'bottom-4 left-4'];

export function CornerDots({ count, letter }: CornerDotsProps) {
  const onClass =
    letter === 'light'
      ? 'bg-white [box-shadow:0_0_10px_rgba(255,255,255,0.55)]'
      : 'bg-[#181614] [box-shadow:0_0_8px_rgba(0,0,0,0.35)]';
  const offClass = letter === 'light' ? 'bg-white/15' : 'bg-black/20';

  return (
    <>
      {CORNERS.map((corner, index) => (
        <span
          key={corner}
          className={`absolute size-2 rounded-full transition-colors duration-[600ms] ${corner} ${index < count ? onClass : offClass}`}
          data-lit={index < count}
        />
      ))}
    </>
  );
}
