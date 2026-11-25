import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl text-xl tracking-wide transition-transform active:translate-y-px disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40",
  {
    variants: {
      variant: {
        default: "bg-raid-yellow text-black pixel-shadow hover:brightness-105",
        outline:
          "border border-white/70 bg-transparent text-white hover:bg-white/10",
        ghost: "bg-transparent text-white hover:bg-white/10",
        dock: "flex-col h-20 w-20 rounded-2xl border-2 border-white/10 bg-raid-charcoal/90 text-sm",
      },
      size: {
        default: "h-12 px-6",
        sm: "h-9 px-3 text-lg",
        lg: "h-14 px-8 text-2xl",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
