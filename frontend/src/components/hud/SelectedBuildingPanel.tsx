import { Hammer } from "lucide-react";
import { useEffect, useState } from "react";
import { BuildingPortrait } from "@/components/hud/AssetPortrait";
import { BUILDING_ICONS, RESOURCE_ICONS } from "@/components/hud/hudIcons";
import { HudIconBadge, HudPanel } from "@/components/hud/HudPrimitives";
import {
  BUILDINGS,
  STARTER_BUILDERS,
  freeBuilders,
  isUpgradable,
  upgradeCost,
  upgradeDurationMs,
} from "@/data/catalog";
import { BUILDING_SPRITES } from "@/game/assets/sprites";
import { formatResource, formatUpgradeClock } from "@/lib/utils";
import { useGameStore } from "@/store/gameStore";
import type { Village, VillageBuilding } from "@/types/game";

export function SelectedBuildingPanel({
  building,
  village,
}: {
  building: VillageBuilding;
  village: Village;
}) {
  const startUpgrade = useGameStore((s) => s.startUpgrade);
  const [now, setNow] = useState(Date.now());
  const upgrading = building.state === "upgrading";
  const endsAt = building.upgradeEndsAt ?? 0;

  useEffect(() => {
    if (!upgrading) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [upgrading, endsAt]);

  const def = BUILDINGS[building.type];
  const cost = upgradeCost(building.type, building.level);
  const duration = upgradeDurationMs(building.type, building.level);
  const builders = village.builderCount ?? STARTER_BUILDERS;
  const free = freeBuilders(village, now);
  const canAfford = cost != null && village.resources.gold >= cost;
  const canUpgrade =
    isUpgradable(building.type) &&
    !upgrading &&
    cost != null &&
    canAfford &&
    free > 0;

  let hint = "";
  if (!isUpgradable(building.type)) hint = "This building cannot be upgraded";
  else if (cost == null) hint = "Max level";
  else if (upgrading) hint = `Builder at work · ${formatUpgradeClock(endsAt - now)}`;
  else if (free < 1) hint = `All ${builders} builders busy`;
  else if (!canAfford) hint = "Need more gold";
  else hint = `${formatUpgradeClock(duration)} with 1 builder`;

  const GoldIcon = RESOURCE_ICONS.gold;

  return (
    <HudPanel className="w-72 overflow-hidden p-2.5">
      <div className="flex items-center gap-2.5">
        <div className="flex h-14 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[radial-gradient(circle_at_50%_75%,rgb(245_230_66/0.18),transparent_70%)]">
          <BuildingPortrait type={building.type} level={building.level} className="h-14 w-16" />
          {!BUILDING_SPRITES[building.type] &&
            building.type !== "townhall" &&
            building.type !== "gold_mine" &&
            building.type !== "storage" && (
              <HudIconBadge icon={BUILDING_ICONS[building.type]} color="#f5e642" size="sm" />
            )}
        </div>
        <div className="min-w-0">
          <div className="truncate text-[14px] leading-none font-semibold">
            {def.name}
          </div>
          <div className="mt-0.5 text-[10px] font-medium tracking-wider text-white/45 uppercase">
            Level {building.level}
            {upgrading ? ` → ${building.level + 1}` : ""}
          </div>
        </div>
      </div>
      {isUpgradable(building.type) && (
        <button
          type="button"
          disabled={!canUpgrade}
          onClick={() => startUpgrade(building.instanceId)}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-full bg-raid-yellow/18 px-3 py-1.5 text-[12px] font-semibold text-raid-yellow transition enabled:hover:bg-raid-yellow/28 disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Hammer className="h-3.5 w-3.5" strokeWidth={2.2} />
          {upgrading ? "Upgrading" : cost == null ? "Max level" : "Upgrade"}
          {!upgrading && cost != null && (
            <span className="inline-flex items-center gap-0.5 tabular-nums">
              <GoldIcon className="h-3 w-3" strokeWidth={2.2} />
              {formatResource(cost)}
            </span>
          )}
        </button>
      )}
      <div className="mt-1.5 text-[11px] font-medium text-white/50">{hint}</div>
    </HudPanel>
  );
}
