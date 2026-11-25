import { HardHat } from "lucide-react";
import { RESOURCE_ICONS, RESOURCE_TINT } from "@/components/hud/hudIcons";
import { HudPanel } from "@/components/hud/HudPrimitives";
import { RESOURCE_META, STARTER_BUILDERS, freeBuilders } from "@/data/catalog";
import { formatResource } from "@/lib/utils";
import type { Resources, Village } from "@/types/game";

export function ResourceBar({
  resources,
  village,
}: {
  resources: Resources;
  village?: Village;
}) {
  const total = village?.builderCount ?? STARTER_BUILDERS;
  const free = village ? freeBuilders(village) : total;
  return (
    <HudPanel className="flex items-center gap-1 rounded-full px-1.5 py-1.5">
      {(["gold", "elixir", "ore"] as const).map((id) => {
        const Icon = RESOURCE_ICONS[id];
        const color = RESOURCE_TINT[id];
        return (
          <div
            key={id}
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
            title={RESOURCE_META[id].label}
          >
            <span
              className="inline-flex h-6 w-6 items-center justify-center rounded-full"
              style={{
                background: `linear-gradient(180deg, ${color}40, ${color}18)`,
                boxShadow: `inset 0 0 0 1px ${color}66`,
                color,
              }}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
            </span>
            <span className="text-[13px] font-semibold tracking-tight tabular-nums">
              {formatResource(resources[id])}
            </span>
          </div>
        );
      })}
      {village && (
        <div
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
          title={`${free} free of ${total} builders`}
        >
          <span
            className="inline-flex h-6 w-6 items-center justify-center rounded-full"
            style={{
              background: "linear-gradient(180deg, #f5e64240, #f5e64218)",
              boxShadow: "inset 0 0 0 1px #f5e64266",
              color: "#f5e642",
            }}
          >
            <HardHat className="h-3.5 w-3.5" strokeWidth={2.2} />
          </span>
          <span className="text-[13px] font-semibold tracking-tight tabular-nums">
            {free}/{total}
          </span>
        </div>
      )}
    </HudPanel>
  );
}
