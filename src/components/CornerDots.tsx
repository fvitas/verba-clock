type CornerDotsProps = {
  count: number;
};

// Dots light clockwise from top-left, matching the hardware
const CORNERS = ['top-4 left-4', 'top-4 right-4', 'bottom-4 right-4', 'bottom-4 left-4'];

export function CornerDots({ count }: CornerDotsProps) {
  return (
    <>
      {CORNERS.map((corner, index) => (
        <span
          key={corner}
          className={`absolute size-2 rounded-full transition-colors duration-[600ms] ${corner} ${
            index < count ? 'bg-white [box-shadow:0_0_10px_rgba(255,255,255,0.55)]' : 'bg-white/15'
          }`}
          data-lit={index < count}
        />
      ))}
    </>
  );
}
