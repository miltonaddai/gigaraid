import type { Object3D } from "three";

export const buildingDrag = {
  grabId: null as string | null,
  originX: 0,
  originZ: 0,
  startTileX: 0,
  startTileZ: 0,
  startX: 0,
  startY: 0,
};

export const DRAG_ASSET_THRESHOLD = 6;
export const DRAG_SPEED = 2.4;

export const buildingObjects = new Map<string, Object3D>();

export function registerBuilding(id: string, object: Object3D | null) {
  if (object) {
    object.userData.buildingId = id;
    buildingObjects.set(id, object);
    return;
  }
  buildingObjects.delete(id);
}
