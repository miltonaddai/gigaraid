import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-lg border border-white/40 bg-white/10 px-4 text-2xl text-white outline-none placeholder:text-white/40 focus:border-raid-yellow",
        className,
      )}
      {...props}
    />
  );
}
