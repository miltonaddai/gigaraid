import {
  BUILDING_SPRITES,
  BUILDER_SPRITE,
  TROOP_SPRITES,
  mineSprite,
  storageSprite,
  townhallSprite,
  type SpriteSheet,
} from "@/game/assets/sprites";
import { cn } from "@/lib/utils";
import type { BuildingId, TroopId } from "@/types/game";

function SpriteFrame({
  sheet,
  className,
}: {
  sheet: SpriteSheet;
  className?: string;
}) {
  const col = sheet.idle.col;
  const row = sheet.idle.row;

  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative block shrink-0 overflow-hidden",
        className,
      )}
    >
      <img
        src={sheet.url}
        alt=""
        draggable={false}
        className="pointer-events-none absolute top-0 left-0 max-w-none select-none [image-rendering:pixelated]"
        style={{
          width: `${sheet.columns * 100}%`,
          height: `${sheet.rows * 100}%`,
          transform: `translate(${
            (-col / sheet.columns) * 100
          }%, ${(-row / sheet.rows) * 100}%)`,
        }}
      />
    </span>
  );
}

function buildingSheet(type: BuildingId, level: number) {
  if (type === "townhall") return townhallSprite(level);
  if (type === "gold_mine") return mineSprite(level);
  if (type === "storage") return storageSprite(level, "full");
  return BUILDING_SPRITES[type];
}

export function BuildingPortrait({
  type,
  level = 1,
  className,
}: {
  type: BuildingId;
  level?: number;
  className?: string;
}) {
  const sheet = buildingSheet(type, level);
  if (!sheet) return null;
  return <SpriteFrame sheet={sheet} className={className} />;
}

export function TroopPortrait({
  type,
  className,
}: {
  type: TroopId;
  className?: string;
}) {
  const sheet = TROOP_SPRITES[type];
  if (!sheet) return null;
  return <SpriteFrame sheet={sheet} className={className} />;
}

export function BuilderPortrait({ className }: { className?: string }) {
  return <SpriteFrame sheet={BUILDER_SPRITE} className={className} />;
}
