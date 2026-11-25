import { BUILDINGS, PLAYABLE_SIZE, TILE_SIZE } from "@/data/catalog";
import { cameraInput } from "@/game/camera/VillageCamera";
import { ProceduralBuilding } from "@/game/buildings/procedural";
import { footprintScale, gridToWorld, worldToGrid } from "@/game/grid";
import { canPlace } from "@/store/gameStore";
import { useGameStore } from "@/store/gameStore";
import type { GridPos } from "@/types/game";

const GRID_PLANE = PLAYABLE_SIZE;

export function PlacementPlane() {
  const placing = useGameStore((s) => s.placing);
  const village = useGameStore((s) => s.village);
  const placeBuilding = useGameStore((s) => s.placeBuilding);
  const selectBuilding = useGameStore((s) => s.selectBuilding);

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.05, 0]}
      onClick={(e) => {
        e.stopPropagation();
        if (cameraInput.didPan || cameraInput.didMoveAsset) return;
        if (useGameStore.getState().movingBuildingId) return;
        if (!placing || !village) {
          selectBuilding(null);
          return;
        }
        const pos = worldToGrid(e.point.x, e.point.z);
        placeBuilding(pos);
      }}
      onPointerMissed={() => {
        if (cameraInput.didPan || cameraInput.didMoveAsset) return;
        if (useGameStore.getState().movingBuildingId) return;
        selectBuilding(null);
      }}
    >
      <planeGeometry args={[GRID_PLANE, GRID_PLANE]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}

export function GhostPreview({ hover }: { hover: GridPos | null }) {
  const placing = useGameStore((s) => s.placing);
  const village = useGameStore((s) => s.village);
  if (!placing || !hover || !village) return null;
  const fp = BUILDINGS[placing].footprint;
  const ok = canPlace(village, placing, hover);
  const { x, z } = gridToWorld(hover.x, hover.z, fp);
  const color = ok ? "#3dce4a" : "#ef4444";

  return (
    <group position={[x, 0.03, z]}>
      {Array.from({ length: fp * fp }, (_, i) => {
        const tx = (i % fp) - (fp - 1) / 2;
        const tz = Math.floor(i / fp) - (fp - 1) / 2;
        return (
          <mesh
            key={i}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[tx * TILE_SIZE, 0, tz * TILE_SIZE]}
          >
            <planeGeometry args={[TILE_SIZE * 0.9, TILE_SIZE * 0.9]} />
            <meshBasicMaterial color={color} transparent opacity={0.38} />
          </mesh>
        );
      })}
      <group scale={footprintScale(fp)} position={[0, 0.05, 0]}>
        <ProceduralBuilding type={placing} />
      </group>
    </group>
  );
}

export { worldToGrid };
