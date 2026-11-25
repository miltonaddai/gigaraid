import { useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { Group } from "three";
import { BUILDINGS, CAMP_MINION_CAP, STARTER_MINIONS, TROOPS } from "@/data/catalog";
import {
  ARCHER_SPRITE,
  BULL_RIDER_SPRITE,
  BUILDER_SPRITE,
  GIANT_SPRITE,
  MINION_SPRITE,
  archerClip,
  bullRiderClip,
  builderClip,
  giantClip,
  minionClip,
  minionFacing,
  type SpriteClip,
  type SpriteSheet,
} from "@/game/assets/sprites";
import { gridToWorld } from "@/game/grid";
import { SheetSprite } from "@/game/units/SheetSprite";
import { CAMP_RADIUS } from "@/game/units/TrainingCamp";
import {
  UNIT_RADIUS,
  agentAlive,
  clampToRadius,
  clearAgents,
  damageAgent,
  isFree,
  nearestHostile,
  placeFree,
  registerAgent,
  stepToward,
  unregisterAgent,
  villageSolids,
  workRadius,
  writeAgent,
  type Circle,
  type Solids,
  type Team,
} from "@/game/units/unitCollision";
import type { Village, VillageBuilding } from "@/types/game";

const CAMP_LEASH = CAMP_RADIUS * 0.72;
const CAMP_IDLE_RADIUS = CAMP_RADIUS * 0.34;
const WORLD_ORIGIN: [number, number, number] = [0, 0, 0];
const TENT = { x: -1.45, z: -1.25, r: 0.7 };
const DUMMY = { x: 0.2, z: 0.08, r: 0.28 };

interface Combat {
  sight: number;
  range: number;
  dps: number;
  hp: number;
}

const MINION_COMBAT: Combat = { sight: 8.5, range: 0.9, dps: TROOPS.minion.dps, hp: TROOPS.minion.hp };
const ARCHER_COMBAT: Combat = { sight: 11, range: TROOPS.archer.range, dps: TROOPS.archer.dps, hp: TROOPS.archer.hp };
const BULL_RIDER_COMBAT: Combat = {
  sight: 10,
  range: TROOPS.bull_rider.range,
  dps: TROOPS.bull_rider.dps,
  hp: TROOPS.bull_rider.hp,
};
const GIANT_COMBAT: Combat = {
  sight: 9,
  range: TROOPS.giant.range,
  dps: TROOPS.giant.dps,
  hp: TROOPS.giant.hp,
};
const BUILDER_COMBAT: Combat = { sight: 7, range: 1, dps: 12, hp: 70 };

function hash(n: number) {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

function campSpot(seed: number, radius: number) {
  const a = hash(seed) * Math.PI * 2;
  const r = Math.sqrt(hash(seed + 3.1)) * radius;
  return { x: Math.cos(a) * r, z: Math.sin(a) * r };
}

function buildingWorkSpot(building: VillageBuilding, seed: number) {
  const w = gridToWorld(
    building.pos.x,
    building.pos.z,
    BUILDINGS[building.type].footprint,
  );
  const a = Math.PI / 4 + (hash(seed) - 0.5) * 1.8;
  const r = workRadius(building);
  return {
    x: w.x + Math.cos(a) * r,
    z: w.z + Math.sin(a) * r,
    faceX: w.x,
    faceZ: w.z,
  };
}

function upgradeWorkSpot(building: VillageBuilding) {
  const w = gridToWorld(
    building.pos.x,
    building.pos.z,
    BUILDINGS[building.type].footprint,
  );
  const a = Math.PI / 4;
  const r = workRadius(building);
  return {
    x: w.x + Math.cos(a) * r,
    z: w.z + Math.sin(a) * r,
    faceX: w.x,
    faceZ: w.z,
  };
}

function worldLeash(
  origin: [number, number, number],
  leash?: number,
): Circle | undefined {
  if (leash == null) return undefined;
  return { x: origin[0], z: origin[2], r: leash };
}

function pickSpot(
  seed: number,
  origin: [number, number, number],
  id: string,
  radius: number,
  solids: Solids,
  nextTarget: (seed: number) => { x: number; z: number; faceX?: number; faceZ?: number },
  leash?: number,
) {
  const ring = worldLeash(origin, leash);
  for (let i = 0; i < 14; i += 1) {
    const t = nextTarget(seed + i * 19.7);
    let lx = t.x;
    let lz = t.z;
    if (leash != null) {
      const local = clampToRadius(t.x, t.z, leash);
      lx = local.x;
      lz = local.z;
    }
    if (isFree(origin[0] + lx, origin[2] + lz, radius, id, solids)) {
      return { ...t, x: lx, z: lz };
    }
  }
  const fallback = nextTarget(seed);
  const placed = placeFree(
    origin[0] + fallback.x,
    origin[2] + fallback.z,
    radius,
    id,
    solids,
    ring,
  );
  return {
    ...fallback,
    x: placed.x - origin[0],
    z: placed.z - origin[2],
  };
}

function Wanderer({
  id,
  origin,
  seed,
  sheet,
  clipFor,
  solids,
  speed = 0.95,
  radius = UNIT_RADIUS,
  nextTarget,
  actChance = 0,
  leash,
  team = "friend",
  combat,
  tint,
  onDeath,
  spawnAt,
  stationed = false,
  job,
}: {
  id: string;
  origin: [number, number, number];
  seed: number;
  sheet: SpriteSheet;
  clipFor: (moving: boolean, acting: boolean, facing: number) => SpriteClip;
  solids: Solids;
  speed?: number;
  radius?: number;
  nextTarget: (seed: number) => { x: number; z: number; faceX?: number; faceZ?: number };
  actChance?: number;
  leash?: number;
  team?: Team;
  combat?: Combat;
  tint?: string;
  onDeath?: () => void;
  spawnAt?: { x: number; z: number };
  stationed?: boolean;
  job?: { x: number; z: number; faceX: number; faceZ: number; work?: boolean } | null;
}) {
  const spawn = useRef<{
    start: { x: number; z: number; faceX?: number; faceZ?: number };
    first: { x: number; z: number; faceX?: number; faceZ?: number };
  } | null>(null);
  if (!spawn.current) {
    spawn.current = spawnAt
      ? {
          start: spawnAt,
          first: job ?? nextTarget(seed + 1),
        }
      : {
          start: pickSpot(seed, origin, id, radius, solids, nextTarget, leash),
          first: pickSpot(seed + 1, origin, id, radius, solids, nextTarget, leash),
        };
  }
  const start = spawn.current.start;
  const first = spawn.current.first;
  const group = useRef<Group>(null);
  const [moving, setMoving] = useState(false);
  const [acting, setActing] = useState(false);
  const [facing, setFacing] = useState(() =>
    minionFacing(first.x - start.x, first.z - start.z),
  );
  const [dead, setDead] = useState(false);
  const state = useRef({
    x: start.x,
    z: start.z,
    tx: first.x,
    tz: first.z,
    wait: (stationed ? 1.6 : 0.4) + hash(seed + 9) * (stationed ? 2.4 : 1.2),
    faceX: first.faceX,
    faceZ: first.faceZ,
    stuck: 0,
    swing: 0,
    faceLock: 0,
    jobSig: "",
  });

  useEffect(() => {
    registerAgent(id, origin[0] + start.x, origin[2] + start.z, radius, team, combat?.hp ?? 80);
    return () => unregisterAgent(id);
  }, [id, origin, radius, team, combat?.hp, start.x, start.z]);

  useFrame((_, dt) => {
    const g = group.current;
    const s = state.current;
    if (!g || dead) return;
    if (!agentAlive(id)) {
      setDead(true);
      onDeath?.();
      return;
    }

    const holdFacing = (dx: number, dz: number, force = false) => {
      if ((!force && s.faceLock > 0) || (dx === 0 && dz === 0)) return;
      const nextFacing = minionFacing(dx, dz);
      setFacing((prev) => (prev === nextFacing ? prev : nextFacing));
      s.faceLock = force ? 0 : 0.22;
    };

    const faceJob = (j: { x: number; z: number; faceX: number; faceZ: number }) => {
      holdFacing(j.faceX - s.x, j.faceZ - s.z, true);
    };

    const retarget = (nextSeed: number) => {
      const next = pickSpot(nextSeed, origin, id, radius, solids, nextTarget, leash);
      s.tx = next.x;
      s.tz = next.z;
      s.faceX = next.faceX;
      s.faceZ = next.faceZ;
      s.wait = (stationed ? 2.2 : 0.7) + hash(s.x + 2.2) * (stationed ? 3.4 : 2);
      s.stuck = 0;
      if (next.faceX != null && next.faceZ != null) {
        holdFacing(next.faceX - s.x, next.faceZ - s.z);
      }
      setActing(actChance > 0 && hash(s.x + s.z + 4.4) < actChance);
      setMoving((prev) => (prev ? false : prev));
    };

    s.faceLock = Math.max(0, s.faceLock - dt);
    const jobSig = job
      ? `${job.x.toFixed(2)}:${job.z.toFixed(2)}:${job.work ? "w" : "h"}`
      : "";
    if (jobSig !== s.jobSig) {
      s.jobSig = jobSig;
      if (job) {
        s.tx = job.x;
        s.tz = job.z;
        s.faceX = job.faceX;
        s.faceZ = job.faceZ;
        s.wait = 0;
        s.stuck = 0;
        setActing(false);
      }
    }
    const ring = worldLeash(origin, leash);
    const wx = origin[0] + s.x;
    const wz = origin[2] + s.z;

    if (combat) {
      const foe = nearestHostile(wx, wz, team, combat.sight);
      const foeInYard =
        !!foe &&
        (!ring ||
          Math.hypot(foe.agent.x - ring.x, foe.agent.z - ring.z) <= ring.r + 0.45);
      if (foe && (!stationed || foeInYard)) {
        s.wait = 0;
        const reach = Math.max(combat.range, radius + foe.agent.r + 0.1);
        holdFacing(foe.agent.x - wx, foe.agent.z - wz);
        if (foe.dist <= reach) {
          s.swing += dt;
          if (s.swing >= 0.4) {
            s.swing = 0;
            damageAgent(foe.id, combat.dps * 0.4);
          }
          writeAgent(id, wx, wz, radius);
          setActing((prev) => (prev ? prev : true));
          setMoving((prev) => (prev ? false : prev));
          return;
        }
        const moved = stepToward(
          wx,
          wz,
          foe.agent.x,
          foe.agent.z,
          speed * 1.15 * dt,
          radius,
          id,
          solids,
          stationed ? ring : undefined,
        );
        s.x = moved.x - origin[0];
        s.z = moved.z - origin[2];
        writeAgent(id, origin[0] + s.x, origin[2] + s.z, radius);
        g.position.set(origin[0] + s.x, 0, origin[2] + s.z);
        setActing((prev) => (prev ? false : prev));
        setMoving((prev) => (prev ? prev : true));
        return;
      }
    }

    if (s.wait > 0) {
      s.wait -= dt;
      if (!isFree(wx, wz, radius, id, solids)) {
        const parked = placeFree(wx, wz, radius, id, solids, ring);
        s.x = parked.x - origin[0];
        s.z = parked.z - origin[2];
        g.position.set(origin[0] + s.x, 0, origin[2] + s.z);
      }
      writeAgent(id, origin[0] + s.x, origin[2] + s.z, radius);
      setMoving((prev) => (prev ? false : prev));
      if (s.wait <= 0) {
        if (job) {
          const dist = Math.hypot(job.x - s.x, job.z - s.z);
          if (dist < 0.4) {
            s.wait = job.work ? 2.6 : 8;
            faceJob(job);
            setActing(!!job.work);
            return;
          }
          s.tx = job.x;
          s.tz = job.z;
          s.faceX = job.faceX;
          s.faceZ = job.faceZ;
          setActing((prev) => (prev ? false : prev));
          return;
        }
        setActing((prev) => (prev ? false : prev));
      } else if (job) {
        faceJob(job);
        setActing(!!job.work);
      } else {
        setActing((prev) => (prev ? false : prev));
      }
      return;
    }

    const moved = stepToward(
      origin[0] + s.x,
      origin[2] + s.z,
      origin[0] + s.tx,
      origin[2] + s.tz,
      speed * dt,
      radius,
      id,
      solids,
      ring,
    );

    const lx = moved.x - origin[0];
    const lz = moved.z - origin[2];

    if (moved.arrived) {
      if (job) {
        s.wait = job.work ? 2.6 : 8;
        faceJob(job);
        setActing(!!job.work);
        setMoving((prev) => (prev ? false : prev));
        writeAgent(id, origin[0] + s.x, origin[2] + s.z, radius);
        return;
      }
      retarget(seed + s.x * 17.3 + s.z * 9.1);
      writeAgent(id, origin[0] + s.x, origin[2] + s.z, radius);
      return;
    }

    if (moved.stuck) {
      s.stuck += dt;
      setMoving((prev) => (prev ? false : prev));
      writeAgent(id, origin[0] + s.x, origin[2] + s.z, radius);
      if (s.stuck > 0.12) {
        retarget(seed + s.x * 31.1 + s.z * 5.7 + 8);
      }
      return;
    }
    s.stuck = 0;

    const dx = lx - s.x;
    const dz = lz - s.z;
    const stride = Math.hypot(dx, dz);
    s.x = lx;
    s.z = lz;
    writeAgent(id, origin[0] + s.x, origin[2] + s.z, radius);
    if (stride > 0.0004) {
      holdFacing(s.tx - s.x, s.tz - s.z);
      setActing((prev) => (prev ? false : prev));
      setMoving((prev) => (prev ? prev : true));
    } else {
      setMoving((prev) => (prev ? false : prev));
    }
    g.position.set(origin[0] + s.x, 0, origin[2] + s.z);
  });

  if (dead) return null;

  const clip = clipFor(moving, acting, facing);

  return (
    <group ref={group} position={[origin[0] + start.x, 0, origin[2] + start.z]}>
      <Suspense fallback={null}>
        <SheetSprite
          sheet={sheet}
          clip={clip}
          animate={moving || acting}
          color={tint}
        />
      </Suspense>
    </group>
  );
}

export function VillageUnits({ village }: { village: Village }) {
  const buildings = village.buildings;
  const troops = village.troops;
  const townhallLevel = village.townhallLevel;
  const camps = useMemo(
    () => buildings.filter((b) => b.type === "army_camp"),
    [buildings],
  );
  const campCenters = useMemo(
    () =>
      camps.map((camp) => {
        const w = gridToWorld(camp.pos.x, camp.pos.z, BUILDINGS.army_camp.footprint);
        return [w.x, 0, w.z] as [number, number, number];
      }),
    [camps],
  );
  const minionCount = troops.find((t) => t.type === "minion")?.count ?? STARTER_MINIONS;
  const archerCount =
    townhallLevel >= TROOPS.archer.unlockTownhall
      ? (troops.find((t) => t.type === "archer")?.count ?? 0)
      : 0;
  const bullRiderCount =
    townhallLevel >= TROOPS.bull_rider.unlockTownhall
      ? (troops.find((t) => t.type === "bull_rider")?.count ?? 0)
      : 0;
  const giantCount =
    townhallLevel >= TROOPS.giant.unlockTownhall
      ? (troops.find((t) => t.type === "giant")?.count ?? 0)
      : 0;
  const housedMinions = Math.min(minionCount, camps.length * CAMP_MINION_CAP);
  const shownArchers = Math.min(4, archerCount);
  const shownBullRiders = Math.min(3, bullRiderCount);
  const shownGiants = Math.min(2, giantCount);
  const now = Date.now();
  const builderCount = Math.max(1, village.builderCount ?? 1);
  const upgradeJobs = useMemo(
    () =>
      buildings
        .filter((b) => b.state === "upgrading" && (b.upgradeEndsAt ?? 0) > now)
        .sort((a, b) => (a.upgradeEndsAt ?? 0) - (b.upgradeEndsAt ?? 0)),
    [buildings, now],
  );
  const builderHuts = useMemo(
    () => buildings.filter((b) => b.type === "builder_hut"),
    [buildings],
  );
  const builderSolids = useMemo(() => villageSolids(buildings), [buildings]);
  const campSolids = useMemo(() => {
    const base = villageSolids(buildings, ["army_camp"]);
    return campCenters.map((center) => ({
      rects: base.rects,
      circles: [
        ...base.circles,
        { x: center[0] + TENT.x, z: center[2] + TENT.z, r: TENT.r },
        { x: center[0] + DUMMY.x, z: center[2] + DUMMY.z, r: DUMMY.r },
      ],
    }));
  }, [buildings, campCenters]);
  useEffect(() => () => clearAgents(), []);

  const campSpotter = (seed: number) => campSpot(seed, CAMP_IDLE_RADIUS);
  const villageSpotter = (seed: number) => {
    const pick = buildings[Math.floor(hash(seed) * buildings.length)] ?? buildings[0];
    const spot = buildingWorkSpot(pick, seed + 0.37);
    return { x: spot.x, z: spot.z, faceX: spot.faceX, faceZ: spot.faceZ };
  };

  return (
    <group>
      {campCenters.map((center, campIndex) => {
        const start = campIndex * CAMP_MINION_CAP;
        const campMinions = Math.min(
          CAMP_MINION_CAP,
          Math.max(0, housedMinions - start),
        );
        const campArchers = campIndex === 0 ? shownArchers : 0;
        const campBullRiders = campIndex === 0 ? shownBullRiders : 0;
        const campGiants = campIndex === 0 ? shownGiants : 0;
        return (
          <group key={`camp-${campIndex}`}>
            {Array.from({ length: campMinions }, (_, i) => (
              <Wanderer
                key={`minion-${campIndex}-${i}`}
                id={`minion-${campIndex}-${i}`}
                origin={center}
                seed={campIndex * 40 + i * 11.17}
                sheet={MINION_SPRITE}
                clipFor={minionClip}
                solids={campSolids[campIndex]}
                speed={0.7}
                nextTarget={campSpotter}
                leash={CAMP_LEASH}
                combat={MINION_COMBAT}
                stationed
              />
            ))}
            {Array.from({ length: campArchers }, (_, i) => (
              <Wanderer
                key={`archer-${campIndex}-${i}`}
                id={`archer-${campIndex}-${i}`}
                origin={center}
                seed={200 + i * 13.41}
                sheet={ARCHER_SPRITE}
                clipFor={archerClip}
                solids={campSolids[campIndex]}
                speed={0.7}
                actChance={0.08}
                nextTarget={campSpotter}
                leash={CAMP_LEASH}
                combat={ARCHER_COMBAT}
                stationed
              />
            ))}
            {Array.from({ length: campBullRiders }, (_, i) => (
              <Wanderer
                key={`bull-rider-${campIndex}-${i}`}
                id={`bull-rider-${campIndex}-${i}`}
                origin={center}
                seed={320 + i * 17.23}
                sheet={BULL_RIDER_SPRITE}
                clipFor={bullRiderClip}
                solids={campSolids[campIndex]}
                speed={0.78}
                nextTarget={campSpotter}
                leash={CAMP_LEASH}
                combat={BULL_RIDER_COMBAT}
                stationed
              />
            ))}
            {Array.from({ length: campGiants }, (_, i) => (
              <Wanderer
                key={`giant-${campIndex}-${i}`}
                id={`giant-${campIndex}-${i}`}
                origin={center}
                seed={410 + i * 19.31}
                sheet={GIANT_SPRITE}
                clipFor={giantClip}
                solids={campSolids[campIndex]}
                speed={0.55}
                nextTarget={campSpotter}
                leash={CAMP_LEASH}
                combat={GIANT_COMBAT}
                stationed
              />
            ))}
          </group>
        );
      })}
      {buildings.length > 0 &&
        Array.from({ length: builderCount }, (_, i) => {
          const site = upgradeJobs[i];
          const hut = builderHuts[i] ?? builderHuts[0];
          const home = hut ? upgradeWorkSpot(hut) : null;
          const spot = site ? { ...upgradeWorkSpot(site), work: true } : null;
          const idleRoute = hut
            ? (nextSeed: number) => buildingWorkSpot(hut, nextSeed)
            : villageSpotter;
          return (
            <Wanderer
              key={`builder-${i}`}
              id={`builder-${i}`}
              origin={WORLD_ORIGIN}
              seed={i * 19.7 + 3.3}
              sheet={BUILDER_SPRITE}
              clipFor={builderClip}
              solids={builderSolids}
              speed={site ? 1.08 : 0.86}
              radius={0.42}
              actChance={site ? 1 : 0}
              nextTarget={idleRoute}
              combat={BUILDER_COMBAT}
              spawnAt={home ?? undefined}
              job={spot ?? undefined}
            />
          );
        })}
    </group>
  );
}
