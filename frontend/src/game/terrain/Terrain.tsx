import { useLayoutEffect, useMemo, useRef } from "react";
import { Color, Object3D } from "three";
import type { InstancedMesh } from "three";
import {
  BUILDINGS,
  GRID_SIZE,
  LAND_PAD,
  LAND_SIZE,
  LAND_TILES,
  TILE_SIZE,
} from "@/data/catalog";
import { occupiedKeys } from "@/game/grid";
import { treePositions } from "@/game/terrain/trees";
import { canMove, useGameStore } from "@/store/gameStore";
import type { Village } from "@/types/game";

const GRASS = [
  new Color("#78a944"),
  new Color("#73a240"),
  new Color("#82af4b"),
  new Color("#6e9c3d"),
  new Color("#7da847"),
];
const PLOT = new Color("#4f9638");
const TILE_FACE = TILE_SIZE * 0.965;
const dummy = new Object3D();

function grassTone(x: number, z: number) {
  const noise = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
  return GRASS[Math.floor((noise - Math.floor(noise)) * GRASS.length)] ?? GRASS[0];
}

export function Terrain({ village: villageOverride }: { village?: Village }) {
  const homeVillage = useGameStore((s) => s.village);
  const village = villageOverride ?? homeVillage;
  const movingId = useGameStore((s) => s.movingBuildingId);
  const moveHover = useGameStore((s) => s.moveHover);
  const occupied = useMemo(() => {
    const activeMovingId = villageOverride ? null : movingId;
    const keys = occupiedKeys(village, activeMovingId);
    if (
      !villageOverride &&
      village &&
      movingId &&
      moveHover &&
      canMove(village, movingId, moveHover)
    ) {
      const moving = village.buildings.find((b) => b.instanceId === movingId);
      if (moving) {
        const fp = BUILDINGS[moving.type].footprint;
        for (let x = 0; x < fp; x += 1) {
          for (let z = 0; z < fp; z += 1) {
            keys.add(`${moveHover.x + x}:${moveHover.z + z}`);
          }
        }
      }
    }
    return keys;
  }, [village, villageOverride, movingId, moveHover]);
  const mesh = useRef<InstancedMesh>(null);
  const count = LAND_TILES * LAND_TILES;

  useLayoutEffect(() => {
    const inst = mesh.current;
    if (!inst) return;
    const origin = -LAND_SIZE / 2;
    let i = 0;
    for (let lx = 0; lx < LAND_TILES; lx += 1) {
      for (let lz = 0; lz < LAND_TILES; lz += 1) {
        const gx = lx - LAND_PAD;
        const gz = lz - LAND_PAD;
        const inPlay =
          gx >= 0 && gz >= 0 && gx < GRID_SIZE && gz < GRID_SIZE;
        const claimed = inPlay && occupied.has(`${gx}:${gz}`);
        dummy.position.set(
          origin + lx * TILE_SIZE + TILE_SIZE / 2,
          claimed ? 0.02 : 0.01,
          origin + lz * TILE_SIZE + TILE_SIZE / 2,
        );
        dummy.rotation.set(-Math.PI / 2, 0, 0);
        dummy.updateMatrix();
        inst.setMatrixAt(i, dummy.matrix);
        inst.setColorAt(i, claimed ? PLOT : grassTone(lx, lz));
        i += 1;
      }
    }
    inst.instanceMatrix.needsUpdate = true;
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
  }, [occupied]);

  const trees = useMemo(() => treePositions(), []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[LAND_SIZE + 1.2, LAND_SIZE + 1.2]} />
        <meshLambertMaterial color="#557d32" />
      </mesh>
      <instancedMesh ref={mesh} args={[undefined, undefined, count]} receiveShadow>
        <planeGeometry args={[TILE_FACE, TILE_FACE]} />
        <meshLambertMaterial />
      </instancedMesh>
      {trees.map((tree, i) => (
        <group key={i} position={[tree.x, 0, tree.z]}>
          <mesh position={[0, 0.45, 0]} castShadow>
            <cylinderGeometry args={[0.14, 0.18, 0.85, 6]} />
            <meshToonMaterial color="#6b4226" />
          </mesh>
          <mesh position={[0, 1.25, 0]} castShadow>
            <coneGeometry args={[0.72, 1.35, 7]} />
            <meshToonMaterial color="#3f7a28" />
          </mesh>
          <mesh position={[0, 1.95, 0]} castShadow>
            <coneGeometry args={[0.48, 0.9, 7]} />
            <meshToonMaterial color="#4a8d30" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
