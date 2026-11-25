import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { OrthographicCamera, Vector3 } from "three";
import { GRID_SIZE, LAND_SIZE, TILE_SIZE } from "@/data/catalog";
import { clamp } from "@/lib/utils";
import { useGameStore } from "@/store/gameStore";

export const cameraInput = {
  didPan: false,
  blockPan: false,
  didMoveAsset: false,
};

const ISO = new Vector3(1, 0.82, 1).normalize();
const DIST = 62;
const DEFAULT_ZOOM = 58;
const MAX_ZOOM = 96;
const DRAG_THRESHOLD = 5;
const RIGHT = new Vector3(1, 0, -1).normalize();
const FWD = new Vector3(-1, 0, -1).normalize();
const LAND_HALF = LAND_SIZE / 2;
const LAND_CORNERS = [
  new Vector3(-LAND_HALF, 0, -LAND_HALF),
  new Vector3(LAND_HALF, 0, -LAND_HALF),
  new Vector3(LAND_HALF, 0, LAND_HALF),
  new Vector3(-LAND_HALF, 0, LAND_HALF),
];

function gridToWorld(x: number, z: number) {
  const origin = -((GRID_SIZE * TILE_SIZE) / 2);
  return {
    x: origin + x * TILE_SIZE + TILE_SIZE / 2,
    z: origin + z * TILE_SIZE + TILE_SIZE / 2,
  };
}

function groundPoint(camera: OrthographicCamera, ndcX: number, ndcY: number) {
  const cursor = new Vector3(ndcX, ndcY, 0.5).unproject(camera);
  const dir = cursor.sub(camera.position).normalize();
  if (Math.abs(dir.y) < 0.0001) return new Vector3();
  const t = -camera.position.y / dir.y;
  return camera.position.clone().addScaledVector(dir, t);
}

function hallTarget() {
  const village = useGameStore.getState().village;
  const hall = village?.buildings.find((b) => b.type === "townhall");
  if (!hall) return new Vector3(0, 0, 0);
  const { x, z } = gridToWorld(hall.pos.x, hall.pos.z);
  return new Vector3(x, 0, z);
}

function landFits(ortho: OrthographicCamera, pad = 0.94) {
  const ndc = new Vector3();
  for (const corner of LAND_CORNERS) {
    ndc.copy(corner).project(ortho);
    if (Math.abs(ndc.x) > pad || Math.abs(ndc.y) > pad) return false;
  }
  return true;
}

export function VillageCamera() {
  const { camera, gl, size } = useThree();
  const target = useRef(hallTarget());
  const zoom = useRef(DEFAULT_ZOOM);
  const fitZoom = useRef(16);
  const started = useRef(false);

  const applyAt = (look: Vector3, nextZoom: number) => {
    const ortho = camera as OrthographicCamera;
    ortho.left = -size.width / 2;
    ortho.right = size.width / 2;
    ortho.top = size.height / 2;
    ortho.bottom = -size.height / 2;
    ortho.zoom = nextZoom;
    ortho.near = 0.1;
    ortho.far = 400;
    ortho.position.copy(look).addScaledVector(ISO, DIST);
    ortho.lookAt(look);
    ortho.updateProjectionMatrix();
    ortho.updateMatrixWorld(true);
  };

  const apply = () => applyAt(target.current, zoom.current);

  const computeFitZoom = () => {
    const origin = new Vector3(0, 0, 0);
    let lo = 4;
    let hi = 80;
    for (let i = 0; i < 22; i += 1) {
      const mid = (lo + hi) / 2;
      applyAt(origin, mid);
      if (landFits(camera as OrthographicCamera)) lo = mid;
      else hi = mid;
    }
    return lo;
  };

  const clampToLand = () => {
    const half = LAND_HALF - 0.4;
    const ortho = camera as OrthographicCamera;
    const span = Math.max(0.0001, DEFAULT_ZOOM - fitZoom.current);
    const fitT = clamp((zoom.current - fitZoom.current) / span, 0, 1);
    if (fitT < 0.08) {
      target.current.lerp(new Vector3(0, 0, 0), 1 - fitT / 0.08);
    }
    for (let i = 0; i < 8; i += 1) {
      apply();
      const corners = [
        groundPoint(ortho, -1, -1),
        groundPoint(ortho, 1, -1),
        groundPoint(ortho, 1, 1),
        groundPoint(ortho, -1, 1),
      ];
      let dx = 0;
      let dz = 0;
      for (const c of corners) {
        if (c.x < -half) dx += -half - c.x;
        if (c.x > half) dx += half - c.x;
        if (c.z < -half) dz += -half - c.z;
        if (c.z > half) dz += half - c.z;
      }
      if (Math.abs(dx) < 0.002 && Math.abs(dz) < 0.002) break;
      target.current.x += dx * 0.55;
      target.current.z += dz * 0.55;
    }
    apply();
  };

  useEffect(() => {
    if (!started.current) {
      target.current = hallTarget();
      started.current = true;
    }
    fitZoom.current = computeFitZoom();
    zoom.current = clamp(zoom.current, fitZoom.current, MAX_ZOOM);
    clampToLand();
  }, [camera, size.width, size.height]);

  useEffect(() => {
    const el = gl.domElement;
    el.style.cursor = "grab";
    el.style.touchAction = "none";

    const drag = {
      active: false,
      panning: false,
      x: 0,
      y: 0,
    };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      drag.active = true;
      drag.panning = false;
      cameraInput.didPan = false;
      cameraInput.didMoveAsset = false;
      drag.x = e.clientX;
      drag.y = e.clientY;
    };

    const onMove = (e: PointerEvent) => {
      if (!drag.active || cameraInput.blockPan) return;
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      if (!drag.panning) {
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
        drag.panning = true;
        cameraInput.didPan = true;
        el.style.cursor = "grabbing";
        el.setPointerCapture(e.pointerId);
      }
      drag.x = e.clientX;
      drag.y = e.clientY;
      const scale = 1 / zoom.current;
      target.current.addScaledVector(RIGHT, -dx * scale);
      target.current.addScaledVector(FWD, dy * scale);
      clampToLand();
    };

    const onUp = (e: PointerEvent) => {
      if (drag.panning) {
        try {
          el.releasePointerCapture(e.pointerId);
        } catch {
          /* already released */
        }
      }
      drag.active = false;
      drag.panning = false;
      el.style.cursor = "grab";
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const minZ = fitZoom.current;
      const factor = e.deltaY > 0 ? 0.9 : 1.11;
      zoom.current = clamp(zoom.current * factor, minZ, MAX_ZOOM);
      if (e.deltaY > 0 && zoom.current <= minZ + 0.15) {
        target.current.set(0, 0, 0);
      }
      clampToLand();
    };

    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      el.removeEventListener("wheel", onWheel);
      el.style.cursor = "";
    };
  }, [camera, gl, size.width, size.height]);

  return null;
}
