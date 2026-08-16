import { resolveTime } from './clock/engine';
import { english } from './clock/languages/en';
import { useClockTime } from './clock/use-clock-time';
import { ClockFace } from './components/ClockFace';
import { CornerDots } from './components/CornerDots';
import { getFinish } from './finishes/catalog';

export function App() {
  const time = useClockTime();
  const finish = getFinish('deep-black');
  const { lit, dots } = resolveTime(time.getHours(), time.getMinutes(), english, true);

  return (
    <main
      className="relative flex h-dvh w-dvw items-center justify-center overflow-hidden font-[DINish]"
      style={{ background: finish.surface }}
    >
      <CornerDots count={dots} letter={finish.letter} />
      <ClockFace rows={english.rows} lit={lit} finish={finish} />
    </main>
  );
}
