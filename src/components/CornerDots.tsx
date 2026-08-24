import type { Theme } from '../themes/model';

type CornerDotsProps = {
  theme: Theme;
};

const CORNERS = ['top-4 left-4', 'top-4 right-4', 'bottom-4 right-4', 'bottom-4 left-4'];

// Static decoration matching the hardware's corner fixtures — not a minute indicator
export function CornerDots({ theme }: CornerDotsProps) {
  // The bevel shadows are reflections off a glass front; an e-ink panel has none
  const bevel = theme.eink
    ? undefined
    : theme.letter === 'light'
      ? 'inset 0 1px 1px rgba(255,255,255,0.5), 0 1px 2px rgba(0,0,0,0.4)'
      : 'inset 0 1px 1px rgba(255,255,255,0.25), 0 1px 2px rgba(0,0,0,0.35)';

  return (
    <>
      {CORNERS.map((corner) => (
        <span
          key={corner}
          className={`absolute size-2 rounded-full ${corner}`}
          style={{ backgroundColor: theme.dot, boxShadow: bevel }}
        />
      ))}
    </>
  );
}
