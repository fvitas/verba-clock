import type { Finish } from '../finishes/catalog';

type MinuteDotsProps = {
  count: number;
  finish: Finish;
  visible: boolean;
  nearEdge: boolean;
};

// Watch-style +1..+4 row below the letter grid. On the wall panel it sinks toward the
// panel edge like the watch dial; full-bleed hugs the grid since the viewport edge is the cog's.
export function MinuteDots({ count, finish, visible, nearEdge }: MinuteDotsProps) {
  const litClass =
    finish.letter === 'light'
      ? 'bg-white [box-shadow:0_0_10px_rgba(255,255,255,0.55)]'
      : 'bg-[#181614] [box-shadow:0_0_8px_rgba(0,0,0,0.3)]';
  const stencilColor =
    finish.letter === 'light'
      ? `rgba(255,255,255,${finish.stencilOpacity})`
      : `rgba(0,0,0,${finish.stencilOpacity})`;

  return (
    <div
      className={`absolute ${nearEdge ? 'top-[calc(50cqh+44.5cqmin)]' : 'top-[calc(50cqh+41cqmin)]'} left-[50cqw] flex -translate-x-1/2 gap-[3.5cqmin] transition-opacity duration-[600ms] ${visible ? 'opacity-100' : 'opacity-0'}`}
      data-testid="minute-dots"
    >
      {[0, 1, 2, 3].map((index) => (
        <span
          key={index}
          className={`size-[1.4cqmin] rounded-full transition-colors duration-[600ms] ${index < count ? litClass : ''}`}
          style={index < count ? undefined : { backgroundColor: stencilColor }}
          data-lit={index < count}
        />
      ))}
    </div>
  );
}
