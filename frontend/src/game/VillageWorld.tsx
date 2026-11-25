import { useEffect, useState } from "react";
import { BUILDINGS, TILE_SIZE } from "@/data/catalog";
import { BuildingView } from "@/game/buildings/BuildingView";
import { VillageCamera } from "@/game/camera/VillageCamera";
import { gridToWorld, worldToGrid } from "@/game/grid";
import {
  GhostPreview,
  PlacementPlane,
} from "@/game/placement/GhostPlot";
import { BuildingMover } from "@/game/placement/BuildingMover";
import { Terrain } from "@/game/terrain/Terrain";
import { VillageUnits } from "@/game/units/Units";
import { useGameStore } from "@/store/gameStore";
import type { GridPos } from "@/types/game";

export function VillageWorld() {
  const village = useGameStore((s) => s.village);
  const placing = useGameStore((s) => s.placing);
  const graphics = useGameStore((s) => s.settings.graphics);
  const ensureArmyCamp = useGameStore((s) => s.ensureArmyCamp);
  const ensureBuilderHuts = useGameStore((s) => s.ensureBuilderHuts);
  const [hover, setHover] = useState<GridPos | null>(null);

  useEffect(() => {
    ensureArmyCamp();
    ensureBuilderHuts();
  }, [village?.id, village?.builderCount, ensureArmyCamp, ensureBuilderHuts]);

  return (
    <>
      <VillageCamera />
      <BuildingMover />
      <color attach="background" args={["#7a9a36"]} />
      <hemisphereLight args={["#fff4d6", "#3d5c32", 0.85]} />
      <directionalLight
        position={[18, 28, 10]}
        intensity={1.35}
        castShadow={graphics !== "low"}
        shadow-mapSize-width={graphics === "high" ? 2048 : 1024}
        shadow-mapSize-height={graphics === "high" ? 2048 : 1024}
      />
      <ambientLight intensity={0.28} />

      <Terrain />
      {village?.buildings.map((b) => (
        <BuildingView key={b.instanceId} building={b} />
      ))}
      {village && <VillageUnits village={village} />}

      <group
        onPointerMove={(e) => {
          if (!placing) return;
          setHover(worldToGrid(e.point.x, e.point.z));
        }}
      >
        <PlacementPlane />
      </group>
      <GhostPreview hover={hover} />

      {placing && village && village.buildings.length > 0 && (
        <EmptyPlotHint
          x={village.buildings[0].pos.x + BUILDINGS[village.buildings[0].type].footprint + 1}
          z={village.buildings[0].pos.z}
        />
      )}
    </>
  );
}

function EmptyPlotHint({ x, z }: { x: number; z: number }) {
  const world = gridToWorld(x, z, 1);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[world.x, 0.04, world.z]}>
      <planeGeometry args={[TILE_SIZE * 0.9, TILE_SIZE * 0.9]} />
      <meshBasicMaterial color="#3dce4a" transparent opacity={0.35} />
    </mesh>
  );
}
