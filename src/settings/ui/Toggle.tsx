import * as Switch from '@radix-ui/react-switch';
import { tapHaptic } from '../../native/haptics';

type ToggleProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  'aria-label'?: string;
};

export function Toggle({ checked, onCheckedChange, 'aria-label': ariaLabel }: ToggleProps) {
  return (
    <Switch.Root
      checked={checked}
      aria-label={ariaLabel}
      className="h-[26px] w-[42px] shrink-0 rounded-full bg-white/20 transition-colors data-[state=checked]:bg-[#30d158]"
      onCheckedChange={(checked: boolean) => {
        tapHaptic();
        onCheckedChange(checked);
      }}
    >
      <Switch.Thumb className="block size-[22px] translate-x-0.5 rounded-full bg-white shadow-md transition-transform data-[state=checked]:translate-x-[18px]" />
    </Switch.Root>
  );
}
