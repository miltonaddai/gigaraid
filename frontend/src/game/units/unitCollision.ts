import { BUILDINGS, TILE_SIZE } from "@/data/catalog";
import { gridToWorld } from "@/game/grid";
import { treePositions } from "@/game/terrain/trees";
import type { BuildingId, VillageBuilding } from "@/types/game";

export interface Rect {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface Circle {
  x: number;
  z: number;
  r: number;
}

export interface Solids {
  rects: Rect[];
  circles: Circle[];
}

export type Team = "friend" | "enemy";

export interface Agent {
  x: number;
  z: number;
  r: number;
  team: Team;
  hp: number;
  alive: boolean;
}

export const UNIT_RADIUS = 0.4;
export const TREE_RADIUS = 0.58;
const PLOT_INSET = 0.1;
const VISUAL_PAD: Partial<Record<BuildingId, number>> = {
  townhall: 0.85,
  cannon: 0.25,
  builder_hut: 0.15,
};

const agents = new Map<string, Agent>();
const trees = treePositions().map((t) => ({ x: t.x, z: t.z, r: TREE_RADIUS }));

export function treeObstacles() {
  return trees;
}

export function buildingRect(building: VillageBuilding, inset = PLOT_INSET): Rect {
  const fp = BUILDINGS[building.type as BuildingId].footprint;
  const w = gridToWorld(building.pos.x, building.pos.z, fp);
  const pad = VISUAL_PAD[building.type] ?? 0;
  const half = (fp * TILE_SIZE) / 2 - inset + pad;
  return {
    minX: w.x - half,
    maxX: w.x + half,
    minZ: w.z - half,
    maxZ: w.z + half,
  };
}

export function workRadius(building: VillageBuilding) {
  const fp = BUILDINGS[building.type as BuildingId].footprint;
  const pad = VISUAL_PAD[building.type] ?? 0;
  return (fp * TILE_SIZE) / 2 + pad + 0.55;
}

export function villageSolids(
  buildings: VillageBuilding[],
  skipTypes: Iterable<BuildingId> = [],
): Solids {
  const skip = new Set(skipTypes);
  return {
    rects: buildings.filter((b) => !skip.has(b.type)).map((b) => buildingRect(b)),
    circles: trees,
  };
}

export function circleHitsRect(x: number, z: number, r: number, box: Rect) {
  const cx = Math.max(box.minX, Math.min(x, box.maxX));
  const cz = Math.max(box.minZ, Math.min(z, box.maxZ));
  const dx = x - cx;
  const dz = z - cz;
  return dx * dx + dz * dz < r * r;
}

export function blocked(x: number, z: number, r: number, solids: Solids) {
  for (const box of solids.rects) {
    if (circleHitsRect(x, z, r, box)) return true;
  }
  for (const c of solids.circles) {
    const dx = x - c.x;
    const dz = z - c.z;
    const min = r + c.r;
    if (dx * dx + dz * dz < min * min) return true;
  }
  return false;
}

function hitsHostile(x: number, z: number, r: number, id: string, team: Team) {
  for (const [otherId, a] of agents) {
    if (otherId === id || !a.alive || a.team === team) continue;
    const dx = x - a.x;
    const dz = z - a.z;
    const min = r + a.r;
    if (dx * dx + dz * dz < min * min) return true;
  }
  return false;
}

export function isFree(x: number, z: number, r: number, id: string, solids: Solids) {
  if (blocked(x, z, r, solids)) return false;
  const team = agents.get(id)?.team ?? "friend";
  return !hitsHostile(x, z, r, id, team);
}

export function placeFree(
  x: number,
  z: number,
  r: number,
  id: string,
  solids: Solids,
  leash?: Circle,
) {
  const ok = (nx: number, nz: number) => {
    if (leash) {
      const dx = nx - leash.x;
      const dz = nz - leash.z;
      if (dx * dx + dz * dz > leash.r * leash.r) return false;
    }
    return isFree(nx, nz, r, id, solids);
  };
  if (ok(x, z)) return { x, z };
  for (let ring = 1; ring <= 8; ring += 1) {
    const steps = ring * 8;
    const dist = ring * r * 0.85;
    for (let i = 0; i < steps; i += 1) {
      const a = (i / steps) * Math.PI * 2;
      const nx = x + Math.cos(a) * dist;
      const nz = z + Math.sin(a) * dist;
      if (ok(nx, nz)) return { x: nx, z: nz };
    }
  }
  return { x, z };
}

export function clearAgents() {
  agents.clear();
}

export function registerAgent(
  id: string,
  x: number,
  z: number,
  r: number,
  team: Team,
  hp: number,
) {
  agents.set(id, { x, z, r, team, hp, alive: hp > 0 });
}

export function unregisterAgent(id: string) {
  agents.delete(id);
}

export function writeAgent(id: string, x: number, z: number, r: number) {
  const cur = agents.get(id);
  if (!cur) return;
  cur.x = x;
  cur.z = z;
  cur.r = r;
}

export function nearestHostile(x: number, z: number, team: Team, range: number) {
  let best: { id: string; agent: Agent; dist: number } | null = null;
  for (const [id, a] of agents) {
    if (!a.alive || a.team === team) continue;
    const dist = Math.hypot(a.x - x, a.z - z);
    if (dist > range) continue;
    if (!best || dist < best.dist) best = { id, agent: a, dist };
  }
  return best;
}

export function damageAgent(id: string, amount: number) {
  const a = agents.get(id);
  if (!a || !a.alive) return 0;
  a.hp = Math.max(0, a.hp - amount);
  if (a.hp <= 0) a.alive = false;
  return a.hp;
}

export function agentAlive(id: string) {
  const a = agents.get(id);
  return a ? a.alive : true;
}

export function agentSnapshot(id: string) {
  const agent = agents.get(id);
  return agent ? { ...agent } : null;
}

const STEER = [0, 0.4, -0.4, 0.85, -0.85, 1.25, -1.25];

export function stepToward(
  x: number,
  z: number,
  tx: number,
  tz: number,
  step: number,
  r: number,
  id: string,
  solids: Solids,
  leash?: Circle,
) {
  const dx = tx - x;
  const dz = tz - z;
  const dist = Math.hypot(dx, dz);
  if (dist < 0.08) return { x, z, arrived: true, stuck: false };
  const ux = dx / dist;
  const uz = dz / dist;
  const len = Math.min(dist, step);
  const inLeash = (nx: number, nz: number) => {
    if (!leash) return true;
    const lx = nx - leash.x;
    const lz = nz - leash.z;
    return lx * lx + lz * lz <= leash.r * leash.r;
  };

  for (const angle of STEER) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const nx = x + (ux * c - uz * s) * len;
    const nz = z + (ux * s + uz * c) * len;
    if (inLeash(nx, nz) && isFree(nx, nz, r, id, solids)) {
      return { x: nx, z: nz, arrived: false, stuck: false };
    }
  }

  return { x, z, arrived: false, stuck: true };
}

export function clampToRadius(x: number, z: number, radius: number) {
  const d = Math.hypot(x, z);
  if (d <= radius || d < 1e-6) return { x, z };
  return { x: (x / d) * radius, z: (z / d) * radius };
}
