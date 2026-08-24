import { cellTiming } from '../clock/transitions';
import type { Theme } from '../themes/model';
import type { Transition } from '../settings/store';

type MinuteDotsProps = {
  count: number;
  theme: Theme;
  visible: boolean;
  nearEdge: boolean;
  transition?: Transition;
  dark?: boolean;
};

// Watch-style +1..+4 row below the letter grid. On the wall panel it sinks toward the
// panel edge like the watch dial; full-bleed hugs the grid since the viewport edge is the cog's.
export function MinuteDots({
  count,
  theme,
  visible,
  nearEdge,
  transition = 'instant',
  dark = false,
}: MinuteDotsProps) {
  const litStyle = { backgroundColor: theme.lit.color, boxShadow: theme.dotGlow };
  // A dot is one cell of one, so it never staggers — it just crossfades with the letters
  const { duration, ease } = cellTiming(transition, 0, 1, dark);
  const dotTiming = duration ? { transition: `background-color ${duration}ms ${ease}` } : {};

  return (
    <div
      // The mobile sheet slides the face up: the dots cut out at once rather than skating
      // across the screen with it, then fade back in behind the closing sheet
      // Centred on the containing block, not on `cqw`: the desktop sheet pads the query
      // container, so container units would take that inset once and the dial's own shift again
      className={`absolute ${nearEdge ? 'top-[calc(50%+44.5cqmin)]' : 'top-[calc(50%+41cqmin)]'} left-1/2 flex -translate-x-1/2 gap-[3.5cqmin] transition-opacity duration-[600ms] max-md:group-data-[settings-open]:opacity-0 max-md:group-data-[settings-open]:duration-0 ${visible ? '' : 'opacity-0'}`}
      data-testid="minute-dots"
    >
      {[0, 1, 2, 3].map((index) => (
        <span
          key={index}
          className="size-[1.4cqmin] rounded-full"
          style={{ ...(index < count ? litStyle : { backgroundColor: theme.dim }), ...dotTiming }}
          data-lit={index < count}
        />
      ))}
    </div>
  );
}
