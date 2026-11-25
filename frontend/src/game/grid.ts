import { BUILDINGS, GRID_SIZE, TILE_SIZE } from "@/data/catalog";
import type { BuildingId, GridPos, Village } from "@/types/game";

export const PLAYABLE_ORIGIN = -((GRID_SIZE * TILE_SIZE) / 2);

export function gridToWorld(x: number, z: number, footprint = 1) {
  const inset = (footprint * TILE_SIZE) / 2;
  return {
    x: PLAYABLE_ORIGIN + x * TILE_SIZE + inset,
    z: PLAYABLE_ORIGIN + z * TILE_SIZE + inset,
  };
}

export function worldToGrid(wx: number, wz: number): GridPos {
  return {
    x: Math.floor((wx - PLAYABLE_ORIGIN) / TILE_SIZE),
    z: Math.floor((wz - PLAYABLE_ORIGIN) / TILE_SIZE),
  };
}

export function footprintScale(footprint: number) {
  return (footprint * TILE_SIZE * 0.88) / 2.3;
}

export function buildingAt(village: Village | null, gx: number, gz: number) {
  if (!village) return null;
  for (const building of village.buildings) {
    const fp = BUILDINGS[building.type as BuildingId].footprint;
    if (gx >= building.pos.x && gx < building.pos.x + fp && gz >= building.pos.z && gz < building.pos.z + fp) {
      return building;
    }
  }
  return null;
}

export function occupiedKeys(village: Village | null, excludeId?: string | null) {
  const keys = new Set<string>();
  if (!village) return keys;
  for (const building of village.buildings) {
    if (excludeId && building.instanceId === excludeId) continue;
    const fp = BUILDINGS[building.type as BuildingId].footprint;
    for (let x = 0; x < fp; x += 1) {
      for (let z = 0; z < fp; z += 1) {
        keys.add(`${building.pos.x + x}:${building.pos.z + z}`);
      }
    }
  }
  return keys;
}
