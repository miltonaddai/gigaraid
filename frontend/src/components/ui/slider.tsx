import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

export function Slider({
  className,
  ...props
}: SliderPrimitive.SliderProps) {
  return (
    <SliderPrimitive.Root
      className={cn(
        "relative flex h-6 w-full touch-none items-center",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow rounded-full bg-white/15">
        <SliderPrimitive.Range className="absolute h-full rounded-full bg-raid-lime" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full bg-white shadow outline-none" />
    </SliderPrimitive.Root>
  );
}
