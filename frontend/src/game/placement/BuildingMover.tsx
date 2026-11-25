import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { Raycaster, Vector2, Vector3 } from "three";
import type { Camera, Object3D } from "three";
import { cameraInput } from "@/game/camera/VillageCamera";
import { buildingAt, worldToGrid } from "@/game/grid";
import {
  DRAG_ASSET_THRESHOLD,
  DRAG_SPEED,
  buildingDrag,
  buildingObjects,
} from "@/game/placement/buildingDrag";
import { useGameStore } from "@/store/gameStore";
import type { Village, VillageBuilding } from "@/types/game";

const cursor = new Vector3();
const dir = new Vector3();
const ndc = new Vector2();
const raycaster = new Raycaster();

function pointerToGround(
  camera: Camera,
  clientX: number,
  clientY: number,
  el: HTMLElement,
) {
  const rect = el.getBoundingClientRect();
  const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
  const ndcY = -((clientY - rect.top) / rect.height) * 2 + 1;
  cursor.set(ndcX, ndcY, 0.5).unproject(camera);
  dir.copy(cursor).sub(camera.position).normalize();
  if (Math.abs(dir.y) < 0.0001) return { x: 0, z: 0 };
  const t = -camera.position.y / dir.y;
  return {
    x: camera.position.x + dir.x * t,
    z: camera.position.z + dir.z * t,
  };
}

function pointerNdc(clientX: number, clientY: number, el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  ndc.set(
    ((clientX - rect.left) / rect.width) * 2 - 1,
    -((clientY - rect.top) / rect.height) * 2 + 1,
  );
  return ndc;
}

function buildingIdFromHit(object: Object3D) {
  let node: Object3D | null = object;
  while (node) {
    const id = node.userData.buildingId;
    if (typeof id === "string") return id;
    node = node.parent;
  }
  return null;
}

function pickBuilding(
  camera: Camera,
  el: HTMLElement,
  clientX: number,
  clientY: number,
  village: Village | null,
): VillageBuilding | null {
  if (!village) return null;
  pointerNdc(clientX, clientY, el);
  raycaster.setFromCamera(ndc, camera);
  const hits = raycaster.intersectObjects([...buildingObjects.values()], true);
  for (const hit of hits) {
    const id = buildingIdFromHit(hit.object);
    const found = id ? village.buildings.find((b) => b.instanceId === id) : null;
    if (found) return found;
  }
  const ground = pointerToGround(camera, clientX, clientY, el);
  const tile = worldToGrid(ground.x, ground.z);
  return buildingAt(village, tile.x, tile.z);
}

function hoverFromPointer(
  camera: Camera,
  el: HTMLElement,
  clientX: number,
  clientY: number,
) {
  const ground = pointerToGround(camera, clientX, clientY, el);
  const tile = worldToGrid(ground.x, ground.z);
  return {
    x: buildingDrag.originX + Math.round((tile.x - buildingDrag.startTileX) * DRAG_SPEED),
    z: buildingDrag.originZ + Math.round((tile.z - buildingDrag.startTileZ) * DRAG_SPEED),
  };
}

function resetGrab() {
  buildingDrag.grabId = null;
  cameraInput.blockPan = false;
}

export function BuildingMover() {
  const { camera, gl } = useThree();

  useEffect(() => {
    const el = gl.domElement;

    const beginGrab = (hit: VillageBuilding, clientX: number, clientY: number) => {
      const state = useGameStore.getState();
      if (state.movingBuildingId) state.cancelMoving();
      const ground = pointerToGround(camera, clientX, clientY, el);
      const tile = worldToGrid(ground.x, ground.z);
      cameraInput.blockPan = true;
      cameraInput.didMoveAsset = false;
      state.selectBuilding(hit.instanceId);
      buildingDrag.grabId = hit.instanceId;
      buildingDrag.originX = hit.pos.x;
      buildingDrag.originZ = hit.pos.z;
      buildingDrag.startTileX = tile.x;
      buildingDrag.startTileZ = tile.z;
      buildingDrag.startX = clientX;
      buildingDrag.startY = clientY;
    };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      resetGrab();
      const state = useGameStore.getState();
      if (state.movingBuildingId) state.cancelMoving();
      if (state.placing) return;
      const hit = pickBuilding(camera, el, e.clientX, e.clientY, state.village);
      if (!hit) return;
      beginGrab(hit, e.clientX, e.clientY);
    };

    const onMove = (e: PointerEvent) => {
      if (!buildingDrag.grabId) return;
      const state = useGameStore.getState();
      if (state.movingBuildingId && state.movingBuildingId !== buildingDrag.grabId) {
        state.cancelMoving();
      }
      if (state.movingBuildingId !== buildingDrag.grabId) {
        if (
          Math.hypot(e.clientX - buildingDrag.startX, e.clientY - buildingDrag.startY) <
          DRAG_ASSET_THRESHOLD
        ) {
          return;
        }
        cameraInput.didMoveAsset = true;
        useGameStore.getState().startMoving(buildingDrag.grabId);
        el.style.cursor = "grabbing";
      }
      useGameStore.getState().setMoveHover(hoverFromPointer(camera, el, e.clientX, e.clientY));
    };

    const endGrab = () => {
      if (useGameStore.getState().movingBuildingId) {
        cameraInput.didMoveAsset = true;
        useGameStore.getState().finishMoving();
      }
      resetGrab();
      el.style.cursor = "grab";
    };

    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", endGrab);
    window.addEventListener("pointercancel", endGrab);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", endGrab);
      window.removeEventListener("pointercancel", endGrab);
    };
  }, [camera, gl]);

  return null;
}
