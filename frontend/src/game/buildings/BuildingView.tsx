import { Suspense, useLayoutEffect, useMemo, useRef } from "react";
import type { Group } from "three";
import { BUILDINGS, TILE_SIZE } from "@/data/catalog";
import { BUILDING_MODELS } from "@/game/assets/manifest";
import {
  BUILDING_SPRITES,
  mineSprite,
  storageFill,
  storageSprite,
  townhallSprite,
} from "@/game/assets/sprites";
import { cameraInput } from "@/game/camera/VillageCamera";
import { ModelOrFallback } from "@/game/assets/ModelOrFallback";
import { CannonView } from "@/game/buildings/CannonView";
import { ProceduralBuilding } from "@/game/buildings/procedural";
import { footprintScale, gridToWorld } from "@/game/grid";
import { registerBuilding } from "@/game/placement/buildingDrag";
import { SheetSprite, SpriteShadow } from "@/game/units/SheetSprite";
import { TrainingCamp } from "@/game/units/TrainingCamp";
import { UpgradeTimer } from "@/game/buildings/UpgradeTimer";
import { canMove, useGameStore } from "@/store/gameStore";
import type { VillageBuilding } from "@/types/game";

const TIMER_HEIGHT: Partial<Record<VillageBuilding["type"], number>> = {
  townhall: 4.15,
  army_camp: 2.95,
  storage: 3.15,
  cannon: 2.45,
};

export function BuildingView({
  building,
  onWorldClick,
}: {
  building: VillageBuilding;
  onWorldClick?: (x: number, z: number) => void;
}) {
  const group = useRef<Group>(null);
  const selected = useGameStore((s) => s.selectedBuildingId === building.instanceId);
  const moving = useGameStore((s) => s.movingBuildingId === building.instanceId);
  const hover = useGameStore((s) =>
    s.movingBuildingId === building.instanceId ? s.moveHover : null,
  );
  const village = useGameStore((s) => s.village);
  const selectBuilding = useGameStore((s) => s.selectBuilding);
  const def = BUILDINGS[building.type];
  const pos = moving && hover ? hover : building.pos;
  const { x, z } = gridToWorld(pos.x, pos.z, def.footprint);
  const ok = !moving || !hover || !village || canMove(village, building.instanceId, hover);
  const vaultSheet = useMemo(
    () =>
      storageSprite(
        building.level,
        storageFill(village?.resources.gold ?? 0, village?.buildings ?? []),
      ),
    [building.level, village?.resources.gold, village?.buildings],
  );
  const hallSheet = useMemo(() => townhallSprite(building.level), [building.level]);
  const mineSheet = useMemo(() => mineSprite(building.level), [building.level]);
  const sheet =
    building.type === "storage"
      ? vaultSheet
      : building.type === "townhall"
        ? hallSheet
        : building.type === "gold_mine"
          ? mineSheet
        : BUILDING_SPRITES[building.type];

  useLayoutEffect(() => {
    registerBuilding(building.instanceId, group.current);
    return () => registerBuilding(building.instanceId, null);
  }, [building.instanceId]);

  return (
    <group position={[x, moving ? 0.42 : 0, z]}>
      <group
        ref={group}
        onClick={(e) => {
          e.stopPropagation();
          if (cameraInput.didPan || cameraInput.didMoveAsset) return;
          if (onWorldClick) {
            onWorldClick(e.point.x, e.point.z);
            return;
          }
          selectBuilding(building.instanceId);
        }}
      >
      {(selected || moving) && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <planeGeometry
            args={[def.footprint * TILE_SIZE * 0.98, def.footprint * TILE_SIZE * 0.98]}
          />
          <meshBasicMaterial
            color={moving ? (ok ? "#3dce4a" : "#ef4444") : "#f5e642"}
            transparent
            opacity={moving ? 0.34 : 0.22}
          />
        </mesh>
      )}
      {moving &&
        Array.from({ length: def.footprint * def.footprint }, (_, i) => {
          const tx = (i % def.footprint) - (def.footprint - 1) / 2;
          const tz = Math.floor(i / def.footprint) - (def.footprint - 1) / 2;
          return (
            <mesh
              key={i}
              rotation={[-Math.PI / 2, 0, 0]}
              position={[tx * TILE_SIZE, 0.01, tz * TILE_SIZE]}
            >
              <planeGeometry args={[TILE_SIZE * 0.9, TILE_SIZE * 0.9]} />
              <meshBasicMaterial
                color={ok ? "#3dce4a" : "#ef4444"}
                transparent
                opacity={0.4}
              />
            </mesh>
          );
        })}
        {building.type === "army_camp" ? (
          <TrainingCamp />
        ) : building.type === "cannon" ? (
          <CannonView
            x={x}
            z={z}
            range={def.range ?? 5}
            dps={(def.dps ?? 18) * (1 + (building.level - 1) * 0.1)}
          />
        ) : sheet ? (
          <Suspense fallback={null}>
            {building.type !== "townhall" &&
              building.type !== "gold_mine" &&
              building.type !== "storage" && (
              <SpriteShadow radius={def.footprint * 0.55} />
            )}
            <SheetSprite
              sheet={sheet}
              clip={sheet.idle}
              animate={(sheet.idle.frames ?? 1) > 1}
            />
          </Suspense>
        ) : (
          <group scale={footprintScale(def.footprint)}>
            <ModelOrFallback url={BUILDING_MODELS[building.type]} scale={1}>
              <ProceduralBuilding type={building.type} />
            </ModelOrFallback>
          </group>
        )}
        {building.state === "upgrading" && building.upgradeEndsAt != null && (
          <UpgradeTimer
            endsAt={building.upgradeEndsAt}
            height={
              building.type === "townhall" && building.level >= 2
                ? 5.35
                : (TIMER_HEIGHT[building.type] ?? 2.8)
            }
          />
        )}
      </group>
    </group>
  );
}
