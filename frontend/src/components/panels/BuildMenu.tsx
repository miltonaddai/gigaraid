import { Hammer, HardHat, Lock, X } from "lucide-react";
import {
  BUILDINGS,
  MAX_BUILDERS,
  STARTER_BUILDERS,
  builderHireCost,
} from "@/data/catalog";
import { BuilderPortrait, BuildingPortrait } from "@/components/hud/AssetPortrait";
import { BUILDING_ICONS } from "@/components/hud/hudIcons";
import { HudIconBadge, HudPanel, ResourceCost } from "@/components/hud/HudPrimitives";
import { formatResource } from "@/lib/utils";
import { useGameStore } from "@/store/gameStore";
import type { BuildingId } from "@/types/game";

const PLACEABLE: BuildingId[] = [
  "gold_mine",
  "storage",
  "cannon",
  "army_camp",
  "elixir_storage",
  "land_bow",
];

export function BuildMenu() {
  const village = useGameStore((s) => s.village);
  const placing = useGameStore((s) => s.placing);
  const startPlacing = useGameStore((s) => s.startPlacing);
  const cancelPlacing = useGameStore((s) => s.cancelPlacing);
  const hireBuilder = useGameStore((s) => s.hireBuilder);
  if (!village) return null;
  const builderCount = village.builderCount ?? STARTER_BUILDERS;
  const hireCost = builderHireCost(builderCount);
  const canHire =
    hireCost != null &&
    village.resources.gold >= hireCost &&
    builderCount < MAX_BUILDERS;

  return (
    <HudPanel className="absolute bottom-28 left-1/2 z-20 w-[min(880px,94vw)] -translate-x-1/2 overflow-hidden px-4 py-3.5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HudIconBadge icon={Hammer} color="#4ADE80" size="sm" />
          <div>
            <div className="text-[13px] font-semibold tracking-wide">Village shop</div>
            <div className="text-[10px] tracking-wide text-white/40 uppercase">
              Buildings and defenses
            </div>
          </div>
        </div>
        {placing && (
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full bg-white/8 px-2.5 py-1 text-[12px] font-medium text-white/65 hover:text-white"
            onClick={cancelPlacing}
          >
            <X className="h-3.5 w-3.5" />
            Cancel
          </button>
        )}
      </div>
      <div className="flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="relative min-w-40 overflow-hidden rounded-2xl border border-raid-yellow/25 bg-raid-yellow/6 p-2.5">
          <div className="relative mb-2 flex h-20 items-center justify-center overflow-hidden rounded-xl bg-[radial-gradient(circle_at_50%_70%,rgb(245_230_66/0.2),transparent_66%)]">
            <BuilderPortrait className="h-20 w-20" />
            <span className="absolute top-1.5 right-1.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px]">
              {builderCount}/{MAX_BUILDERS}
            </span>
          </div>
          <div className="mb-2 flex items-center gap-2">
            <HudIconBadge icon={HardHat} color="#F5E642" size="sm" />
            <div className="text-[13px] leading-tight font-semibold">Builder</div>
          </div>
          <button
            type="button"
            disabled={!canHire}
            onClick={() => hireBuilder()}
            className="w-full rounded-full bg-raid-yellow/18 px-2 py-1.5 text-[11px] font-semibold text-raid-yellow transition enabled:hover:bg-raid-yellow/28 disabled:opacity-45"
          >
            {hireCost == null
              ? "Roster full"
              : `Hire · ${formatResource(hireCost)} gold`}
          </button>
        </div>
        {PLACEABLE.map((id) => {
          const def = BUILDINGS[id];
          const Icon = BUILDING_ICONS[id];
          const locked = village.townhallLevel < def.unlockTownhall;
          const broke = Object.entries(def.cost).some(
            ([k, v]) => (village.resources[k as keyof typeof village.resources] ?? 0) < (v ?? 0),
          );
          return (
            <button
              key={id}
              type="button"
              disabled={locked}
              onClick={() => startPlacing(id)}
              className={`group relative min-w-40 overflow-hidden rounded-2xl border p-2.5 text-left transition ${
                placing === id
                  ? "border-raid-lime/70 bg-raid-lime/12 shadow-[0_0_24px_rgb(163_230_53/0.12)]"
                  : "border-white/10 bg-black/25 hover:-translate-y-0.5 hover:border-white/25"
              } ${locked ? "opacity-40" : ""}`}
            >
              <div className="relative mb-2 flex h-20 items-center justify-center overflow-hidden rounded-xl bg-[radial-gradient(circle_at_50%_70%,rgb(74_222_128/0.18),transparent_66%)]">
                <BuildingPortrait
                  type={id}
                  className="h-20 w-24 transition-transform group-hover:scale-105"
                />
                {locked && (
                  <span className="absolute top-2 right-2 rounded-full bg-black/65 p-1.5">
                    <Lock className="h-3.5 w-3.5 text-white/70" />
                  </span>
                )}
              </div>
              <div className="mb-2 flex items-center gap-2">
                <HudIconBadge
                  icon={Icon}
                  color={placing === id ? "#4ADE80" : "#e4e4e7"}
                  size="sm"
                />
                <div className="text-[13px] leading-tight font-semibold">{def.name}</div>
              </div>
              {locked ? (
                <div className="text-[11px] text-white/45">Town Hall {def.unlockTownhall}</div>
              ) : (
                <ResourceCost cost={def.cost} />
              )}
              {!locked && broke && (
                <div className="mt-1.5 text-[11px] font-medium text-red-300">
                  Not enough resources
                </div>
              )}
            </button>
          );
        })}
      </div>
    </HudPanel>
  );
}
