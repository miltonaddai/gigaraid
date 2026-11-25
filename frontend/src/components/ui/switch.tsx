import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

export function Switch({
  className,
  ...props
}: SwitchPrimitive.SwitchProps) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "relative h-7 w-12 rounded-full bg-white/20 data-[state=checked]:bg-raid-lime",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block h-6 w-6 translate-x-0.5 rounded-full bg-white transition-transform data-[state=checked]:translate-x-5" />
    </SwitchPrimitive.Root>
  );
}
