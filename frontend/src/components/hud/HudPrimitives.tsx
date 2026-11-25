import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { RESOURCE_ICONS, RESOURCE_TINT } from "@/components/hud/hudIcons";
import { cn } from "@/lib/utils";
import type { ResourceId } from "@/types/game";

export function HudPanel({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("hud-glass rounded-2xl", className)}>{children}</div>;
}

export function HudIconBadge({
  icon: Icon,
  color = "#a3e635",
  size = "md",
  className,
}: {
  icon: LucideIcon;
  color?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const box = size === "sm" ? "h-7 w-7" : size === "lg" ? "h-11 w-11" : "h-9 w-9";
  const glyph = size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-5 w-5" : "h-4 w-4";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full",
        box,
        className,
      )}
      style={{
        background: `linear-gradient(180deg, ${color}33, ${color}14)`,
        boxShadow: `inset 0 0 0 1px ${color}55`,
        color,
      }}
    >
      <Icon className={glyph} strokeWidth={2.1} />
    </span>
  );
}

export function ResourceCost({
  cost,
}: {
  cost: Partial<Record<ResourceId, number>>;
}) {
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {Object.entries(cost).map(([id, amount]) => {
        const key = id as ResourceId;
        const Icon = RESOURCE_ICONS[key];
        const color = RESOURCE_TINT[key];
        return (
          <span
            key={id}
            className="inline-flex items-center gap-1 rounded-full bg-black/25 px-1.5 py-0.5 text-[11px] font-medium"
            style={{ color }}
          >
            <Icon className="h-3 w-3" strokeWidth={2.2} />
            {amount}
          </span>
        );
      })}
    </span>
  );
}
