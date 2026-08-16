import { resolveTime } from './clock/engine';
import { english } from './clock/languages/en';
import { useClockTime } from './clock/use-clock-time';
import { ClockFace } from './components/ClockFace';
import { CornerDots } from './components/CornerDots';

export function App() {
  const time = useClockTime();
  const { lit, dots } = resolveTime(time.getHours(), time.getMinutes(), english, true);

  return (
    <main className="relative flex h-dvh w-dvw items-center justify-center overflow-hidden bg-[#050506] font-[Barlow]">
      <CornerDots count={dots} />
      <ClockFace rows={english.rows} lit={lit} />
    </main>
  );
}
