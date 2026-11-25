import { BuildingPortrait } from "@/components/hud/AssetPortrait";
import { HudPanel } from "@/components/hud/HudPrimitives";
import type { Village } from "@/types/game";

export function PlayerCard({ village }: { village: Village }) {
  const pct = Math.min(100, (village.xp / village.xpToNext) * 100);
  return (
    <HudPanel className="w-72 overflow-hidden px-3 py-2.5">
      <div className="flex items-center gap-2.5">
        <div className="flex h-12 w-14 shrink-0 items-center justify-center rounded-xl bg-raid-yellow/8">
          <BuildingPortrait
            type="townhall"
            level={village.townhallLevel}
            className="h-12 w-14"
          />
        </div>
        <div className="min-w-0">
          <div className="truncate text-base font-semibold tracking-tight">
            {village.name}
          </div>
          <div className="text-sm font-medium tracking-wide text-raid-yellow">
            Town Hall {village.townhallLevel}
          </div>
        </div>
      </div>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full bg-linear-to-r from-raid-lime to-emerald-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1 text-[11px] font-medium text-white/45 tabular-nums">
        {village.xp} / {village.xpToNext} XP
      </div>
    </HudPanel>
  );
}
