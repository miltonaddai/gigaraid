import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  BUILDINGS,
  CAMP_MINION_CAP,
  GRID_SIZE,
  MAX_BUILDERS,
  STARTER_BUILDERS,
  STARTER_MINIONS,
  TROOPS,
  builderHireCost,
  freeBuilders,
  isUpgradable,
  upgradeCost,
  upgradeDurationMs,
} from "@/data/catalog";
import { persistVillage } from "@/lib/villageSync";
import { uid } from "@/lib/utils";
import type {
  BuildingId,
  DockTab,
  GameSettings,
  GridPos,
  TroopId,
  Village,
} from "@/types/game";

const STARTER_SHIELD_MS = 24 * 60 * 60 * 1000;

function createStarterVillage(name: string, playerId: string): Village {
  const now = Date.now();
  return {
    id: uid("vil"),
    name,
    ownerWallet: playerId,
    townhallLevel: 1,
    xp: 15,
    xpToNext: 100,
    resources: { gold: 250, elixir: 120, ore: 40 },
    buildings: [
      {
        instanceId: uid("b"),
        type: "townhall",
        level: 1,
        pos: { x: 10, z: 10 },
        state: "idle",
        hp: BUILDINGS.townhall.hp,
        maxHp: BUILDINGS.townhall.hp,
        builtAt: now,
      },
      {
        instanceId: uid("b"),
        type: "cannon",
        level: 1,
        pos: { x: 7, z: 8 },
        state: "idle",
        hp: BUILDINGS.cannon.hp,
        maxHp: BUILDINGS.cannon.hp,
        builtAt: now,
      },
      {
        instanceId: uid("b"),
        type: "gold_mine",
        level: 1,
        pos: { x: 13, z: 12 },
        state: "idle",
        hp: BUILDINGS.gold_mine.hp,
        maxHp: BUILDINGS.gold_mine.hp,
        builtAt: now,
      },
      {
        instanceId: uid("b"),
        type: "elixir_storage",
        level: 1,
        pos: { x: 13, z: 15 },
        state: "idle",
        hp: BUILDINGS.elixir_storage.hp,
        maxHp: BUILDINGS.elixir_storage.hp,
        builtAt: now,
      },
      {
        instanceId: uid("b"),
        type: "storage",
        level: 1,
        pos: { x: 14, z: 8 },
        state: "idle",
        hp: BUILDINGS.storage.hp,
        maxHp: BUILDINGS.storage.hp,
        builtAt: now,
      },
      {
        instanceId: uid("b"),
        type: "army_camp",
        level: 1,
        pos: { x: 6, z: 13 },
        state: "idle",
        hp: BUILDINGS.army_camp.hp,
        maxHp: BUILDINGS.army_camp.hp,
        builtAt: now,
      },
      {
        instanceId: uid("b"),
        type: "builder_hut",
        level: 1,
        pos: { x: 16, z: 14 },
        state: "idle",
        hp: BUILDINGS.builder_hut.hp,
        maxHp: BUILDINGS.builder_hut.hp,
        builtAt: now,
      },
    ],
    troops: [
      {
        instanceId: uid("t"),
        type: "minion",
        count: STARTER_MINIONS,
        level: 1,
      },
    ],
    quests: [
      { id: "q1", title: "Upgrade a building", current: 0, target: 1 },
      { id: "q2", title: "Collect 500 gold", current: 250, target: 500 },
      { id: "q3", title: "Reach Level 2", current: 15, target: 100 },
    ],
    shieldEndsAt: now + STARTER_SHIELD_MS,
    createdAt: now,
    builderCount: STARTER_BUILDERS,
  };
}

const LEGACY_CURRENCY = "bitcoin";
const LEGACY_MINE = "bitcoin_mine";

function migrateCurrency(village: Village): Village {
  const raw = village.resources as Village["resources"] &
    Partial<Record<string, number>>;
  const hasLegacy =
    raw[LEGACY_CURRENCY] !== undefined ||
    village.buildings.some((b) => (b.type as string) === LEGACY_MINE);
  if (!hasLegacy) return village;
  const { [LEGACY_CURRENCY]: legacyAmount, ...rest } = raw;
  return {
    ...village,
    resources: {
      gold: rest.gold ?? legacyAmount ?? 0,
      elixir: rest.elixir ?? 0,
      ore: rest.ore ?? 0,
    },
    buildings: village.buildings.map((b) =>
      (b.type as string) === LEGACY_MINE ? { ...b, type: "gold_mine" as const } : b,
    ),
    quests: village.quests.map((q) =>
      q.id === "q2" ? { ...q, title: "Collect 500 gold" } : q,
    ),
  };
}

function normalizeRoster(input: Village): Village {
  const village = migrateCurrency(input);
  let buildings = village.buildings.filter(
    (b) =>
      (b.type as string) !== "trencher_hut" &&
      (b.type as string) !== "defense_tower",
  );
  for (const type of ["gold_mine", "elixir_storage"] as const) {
    if (buildings.some((building) => building.type === type)) continue;
    const draft = { ...village, buildings };
    const pos = findEmptyPlot(draft, BUILDINGS[type].footprint, 2);
    if (pos) buildings = [...buildings, makeBuilding(type, pos)];
  }
  let troops = village.troops
    .map((t) =>
      t.type === "minion" && t.count === 10 ? { ...t, count: STARTER_MINIONS } : t,
    )
    .filter(
      (t) =>
        t.type !== "archer" || village.townhallLevel >= TROOPS.archer.unlockTownhall,
    );
  if (!troops.some((t) => t.type === "minion")) {
    troops = [
      ...troops,
      { instanceId: uid("t"), type: "minion", count: STARTER_MINIONS, level: 1 },
    ];
  }
  const camps = Math.max(
    1,
    buildings.filter((b) => b.type === "army_camp").length,
  );
  const minionCap = camps * CAMP_MINION_CAP;
  troops = troops.map((t) =>
    t.type === "minion" && t.count > minionCap ? { ...t, count: minionCap } : t,
  );
  const same =
    troops.length === village.troops.length &&
    troops.every((t, i) => t.count === village.troops[i]?.count && t.type === village.troops[i]?.type);
  const roster =
    same && buildings.length === village.buildings.length
      ? village
      : { ...village, troops, buildings };
  const builderCount = Math.max(
    STARTER_BUILDERS,
    Math.min(MAX_BUILDERS, roster.builderCount ?? STARTER_BUILDERS),
  );
  const quests = roster.quests.map((q) =>
    q.id === "q1" && q.title !== "Upgrade a building"
      ? { ...q, title: "Upgrade a building", current: 0 }
      : q,
  );
  const questsSame = quests.every(
    (q, i) => q.title === roster.quests[i]?.title && q.current === roster.quests[i]?.current,
  );
  if (builderCount === roster.builderCount && questsSame && roster === village) {
    return village;
  }
  return { ...roster, builderCount, quests };
}

function cellsFor(pos: GridPos, footprint: number) {
  const cells: string[] = [];
  for (let x = 0; x < footprint; x += 1) {
    for (let z = 0; z < footprint; z += 1) {
      cells.push(`${pos.x + x}:${pos.z + z}`);
    }
  }
  return cells;
}

function makeBuilding(type: BuildingId, pos: GridPos): Village["buildings"][number] {
  const def = BUILDINGS[type];
  return {
    instanceId: uid("b"),
    type,
    level: 1,
    pos,
    state: "idle",
    hp: def.hp,
    maxHp: def.hp,
    builtAt: Date.now(),
  };
}

function occupiedSet(village: Village) {
  const set = new Set<string>();
  for (const b of village.buildings) {
    const fp = BUILDINGS[b.type].footprint;
    for (const c of cellsFor(b.pos, fp)) set.add(c);
  }
  return set;
}

export function canPlace(
  village: Village,
  type: BuildingId,
  pos: GridPos,
) {
  const fp = BUILDINGS[type].footprint;
  if (pos.x < 0 || pos.z < 0) return false;
  if (pos.x + fp > GRID_SIZE || pos.z + fp > GRID_SIZE) return false;
  const taken = occupiedSet(village);
  return cellsFor(pos, fp).every((c) => !taken.has(c));
}

export function canMove(village: Village, instanceId: string, pos: GridPos) {
  const building = village.buildings.find((b) => b.instanceId === instanceId);
  if (!building) return false;
  const fp = BUILDINGS[building.type].footprint;
  if (pos.x < 0 || pos.z < 0) return false;
  if (pos.x + fp > GRID_SIZE || pos.z + fp > GRID_SIZE) return false;
  const taken = new Set<string>();
  for (const other of village.buildings) {
    if (other.instanceId === instanceId) continue;
    for (const cell of cellsFor(other.pos, BUILDINGS[other.type].footprint)) {
      taken.add(cell);
    }
  }
  return cellsFor(pos, fp).every((cell) => !taken.has(cell));
}

export function findEmptyPlot(
  village: Village,
  footprint: number,
  minRadius = 5,
): GridPos | null {
  const taken = occupiedSet(village);
  const hall = village.buildings.find((b) => b.type === "townhall");
  const cx = hall?.pos.x ?? 8;
  const cz = hall?.pos.z ?? 8;
  for (let radius = minRadius; radius < GRID_SIZE; radius += 1) {
    for (let x = cx + radius; x >= cx - radius; x -= 1) {
      for (let z = cz + radius; z >= cz - radius; z -= 1) {
        if (x < 0 || z < 0 || x + footprint > GRID_SIZE || z + footprint > GRID_SIZE) continue;
        const pos = { x, z };
        if (cellsFor(pos, footprint).every((cell) => !taken.has(cell))) return pos;
      }
    }
  }
  return minRadius > 2 ? findEmptyPlot(village, footprint, 2) : null;
}

interface GameState {
  village: Village | null;
  settings: GameSettings;
  settingsOpen: boolean;
  tutorialStep: number;
  tutorialSkipped: boolean;
  activeTab: DockTab | null;
  placing: BuildingId | null;
  selectedBuildingId: string | null;
  movingBuildingId: string | null;
  moveHover: GridPos | null;
  lastValidMove: GridPos | null;
  lastTick: number;
  onboardedWallets: string[];
  setVillageName: (name: string, playerId: string) => void;
  markOnboarded: (playerId: string) => void;
  hasOnboarded: (playerId: string) => boolean;
  hydrateVillage: (village: Village) => void;
  openSettings: (open: boolean) => void;
  updateSettings: (patch: Partial<GameSettings>) => void;
  setTab: (tab: DockTab | null) => void;
  startPlacing: (type: BuildingId) => void;
  cancelPlacing: () => void;
  placeBuilding: (pos: GridPos) => boolean;
  selectBuilding: (id: string | null) => void;
  startMoving: (id: string) => void;
  setMoveHover: (pos: GridPos | null) => void;
  finishMoving: () => boolean;
  cancelMoving: () => void;
  skipTutorial: () => void;
  nextTutorial: () => void;
  tickProduction: () => void;
  completeUpgrades: () => void;
  startUpgrade: (instanceId: string) => boolean;
  trainTroop: (type: TroopId) => boolean;
  consumeTroop: (type: TroopId) => boolean;
  hireBuilder: () => boolean;
  syncRemote: () => Promise<void>;
  ensureArmyCamp: () => void;
  ensureBuilderHuts: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      village: null,
      settings: {
        music: 70,
        sfx: 85,
        battleAlerts: true,
        screenShake: false,
        graphics: "high",
      },
      settingsOpen: false,
      tutorialStep: 1,
      tutorialSkipped: false,
      activeTab: null,
      placing: null,
      selectedBuildingId: null,
      movingBuildingId: null,
      moveHover: null,
      lastValidMove: null,
      lastTick: Date.now(),
      onboardedWallets: [],

      setVillageName: (name, playerId) => {
        const trimmed = name.trim() || "Ravenholm";
        const existing = get().village;
        if (existing && existing.ownerWallet === playerId) {
          set({ village: { ...existing, name: trimmed } });
          void get().syncRemote();
          return;
        }
        set({
          village: createStarterVillage(trimmed, playerId),
          tutorialStep: 1,
          tutorialSkipped: true,
        });
        void get().syncRemote();
      },

      markOnboarded: (playerId) =>
        set((s) => {
          const seen = s.onboardedWallets ?? [];
          return {
            onboardedWallets: seen.includes(playerId) ? seen : [...seen, playerId],
            tutorialSkipped: true,
          };
        }),

      hasOnboarded: (playerId) => (get().onboardedWallets ?? []).includes(playerId),

      hydrateVillage: (village) => set({ village: normalizeRoster(village) }),

      openSettings: (open) => set({ settingsOpen: open }),

      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      setTab: (tab) =>
        set({
          activeTab: tab,
          placing: tab === "build" ? get().placing : null,
        }),

      startPlacing: (type) =>
        set({
          placing: type,
          activeTab: "build",
          movingBuildingId: null,
          moveHover: null,
        }),

      cancelPlacing: () => set({ placing: null }),

      placeBuilding: (pos) => {
        const { village, placing } = get();
        if (!village || !placing) return false;
        const def = BUILDINGS[placing];
        if (village.townhallLevel < def.unlockTownhall) return false;
        if (!canPlace(village, placing, pos)) return false;
        const cost = def.cost;
        const res = { ...village.resources };
        for (const key of Object.keys(cost) as (keyof typeof cost)[]) {
          const need = cost[key] ?? 0;
          if ((res[key] ?? 0) < need) return false;
          res[key] = (res[key] ?? 0) - need;
        }

        const building = {
          instanceId: uid("b"),
          type: placing,
          level: 1,
          pos,
          state: "idle" as const,
          hp: def.hp,
          maxHp: def.hp,
          builtAt: Date.now(),
        };

        set({
          village: {
            ...village,
            resources: res,
            buildings: [...village.buildings, building],
            xp: village.xp + 8,
          },
          placing: null,
          selectedBuildingId: building.instanceId,
        });
        void get().syncRemote();
        return true;
      },

      selectBuilding: (id) => set({ selectedBuildingId: id }),

      startMoving: (id) => {
        const building = get().village?.buildings.find((b) => b.instanceId === id);
        const pos = building?.pos ?? null;
        set({
          movingBuildingId: id,
          selectedBuildingId: id,
          moveHover: pos,
          lastValidMove: pos,
          placing: null,
        });
      },

      setMoveHover: (pos) => {
        const { village, movingBuildingId, moveHover, lastValidMove } = get();
        if (moveHover?.x === pos?.x && moveHover?.z === pos?.z) return;
        const valid =
          village && movingBuildingId && pos && canMove(village, movingBuildingId, pos)
            ? pos
            : lastValidMove;
        set({ moveHover: pos, lastValidMove: valid });
      },

      finishMoving: () => {
        const { village, movingBuildingId, moveHover, lastValidMove } = get();
        if (!village || !movingBuildingId) {
          set({ movingBuildingId: null, moveHover: null, lastValidMove: null });
          return false;
        }
        const dest =
          moveHover && canMove(village, movingBuildingId, moveHover)
            ? moveHover
            : lastValidMove;
        if (!dest || !canMove(village, movingBuildingId, dest)) {
          set({ movingBuildingId: null, moveHover: null, lastValidMove: null });
          return false;
        }
        set({
          village: {
            ...village,
            buildings: village.buildings.map((b) =>
              b.instanceId === movingBuildingId ? { ...b, pos: dest } : b,
            ),
          },
          movingBuildingId: null,
          moveHover: null,
          lastValidMove: null,
        });
        void get().syncRemote();
        return true;
      },

      cancelMoving: () =>
        set({ movingBuildingId: null, moveHover: null, lastValidMove: null }),

      skipTutorial: () => set({ tutorialSkipped: true }),

      nextTutorial: () =>
        set((s) => ({
          tutorialStep: s.tutorialStep >= 5 ? 5 : s.tutorialStep + 1,
          tutorialSkipped: s.tutorialStep >= 5,
        })),

      completeUpgrades: () => {
        const { village } = get();
        if (!village) return;
        const now = Date.now();
        let changed = false;
        let xpGain = 0;
        const buildings = village.buildings.map((b) => {
          if (b.state !== "upgrading" || (b.upgradeEndsAt ?? 0) > now) return b;
          changed = true;
          xpGain += 12;
          const nextLevel = b.level + 1;
          const hp = Math.round(BUILDINGS[b.type].hp * (1 + 0.12 * (nextLevel - 1)));
          return {
            ...b,
            level: nextLevel,
            state: "idle" as const,
            upgradeEndsAt: undefined,
            hp,
            maxHp: hp,
          };
        });
        if (!changed) return;
        const hall = buildings.find((b) => b.type === "townhall");
        const quests = village.quests.map((q) =>
          q.id === "q1" ? { ...q, current: Math.min(q.target, q.current + 1) } : q,
        );
        set({
          village: {
            ...village,
            buildings,
            townhallLevel: hall?.level ?? village.townhallLevel,
            xp: village.xp + xpGain,
            quests,
          },
        });
        void get().syncRemote();
      },

      startUpgrade: (instanceId) => {
        const { village } = get();
        if (!village) return false;
        const building = village.buildings.find((b) => b.instanceId === instanceId);
        if (!building || !isUpgradable(building.type)) return false;
        if (building.state === "upgrading") return false;
        const cost = upgradeCost(building.type, building.level);
        if (cost == null || village.resources.gold < cost) return false;
        if (freeBuilders(village) < 1) return false;
        const endsAt = Date.now() + upgradeDurationMs(building.type, building.level);
        set({
          village: {
            ...village,
            resources: {
              ...village.resources,
              gold: village.resources.gold - cost,
            },
            buildings: village.buildings.map((b) =>
              b.instanceId === instanceId
                ? { ...b, state: "upgrading", upgradeEndsAt: endsAt }
                : b,
            ),
          },
        });
        void get().syncRemote();
        return true;
      },

      trainTroop: (type) => {
        const { village } = get();
        if (!village) return false;
        const troop = TROOPS[type];
        if (village.townhallLevel < troop.unlockTownhall) return false;

        const camps = Math.max(
          1,
          village.buildings.filter((b) => b.type === "army_camp").length,
        );
        const capacity = camps * CAMP_MINION_CAP;
        const housingUsed = village.troops.reduce(
          (total, stack) => total + stack.count * TROOPS[stack.type].housing,
          0,
        );
        if (housingUsed + troop.housing > capacity) return false;

        const resources = { ...village.resources };
        for (const [resource, amount] of Object.entries(troop.cost)) {
          const id = resource as keyof typeof resources;
          const cost = amount ?? 0;
          if (resources[id] < cost) return false;
          resources[id] -= cost;
        }

        const existing = village.troops.find((stack) => stack.type === type);
        const troops = existing
          ? village.troops.map((stack) =>
              stack.type === type ? { ...stack, count: stack.count + 1 } : stack,
            )
          : [
              ...village.troops,
              { instanceId: uid("t"), type, count: 1, level: 1 },
            ];
        set({ village: { ...village, resources, troops } });
        void get().syncRemote();
        return true;
      },

      consumeTroop: (type) => {
        const { village } = get();
        if (!village) return false;
        const stack = village.troops.find((troop) => troop.type === type);
        if (!stack || stack.count < 1) return false;
        set({
          village: {
            ...village,
            troops: village.troops.map((troop) =>
              troop.type === type
                ? { ...troop, count: troop.count - 1 }
                : troop,
            ),
          },
        });
        void get().syncRemote();
        return true;
      },

      hireBuilder: () => {
        const { village } = get();
        if (!village) return false;
        const count = village.builderCount ?? STARTER_BUILDERS;
        const cost = builderHireCost(count);
        if (cost == null || village.resources.gold < cost) return false;
        const hutPos = findEmptyPlot(village, BUILDINGS.builder_hut.footprint, 2);
        set({
          village: {
            ...village,
            builderCount: count + 1,
            resources: {
              ...village.resources,
              gold: village.resources.gold - cost,
            },
            buildings: hutPos
              ? [...village.buildings, makeBuilding("builder_hut", hutPos)]
              : village.buildings,
          },
        });
        void get().syncRemote();
        return true;
      },

      tickProduction: () => {
        get().completeUpgrades();
        const { village, lastTick } = get();
        if (!village) return;
        const now = Date.now();
        const minutes = (now - lastTick) / 60000;
        if (minutes < 0.05) return;
        const resources = { ...village.resources };
        for (const b of village.buildings) {
          const prod = BUILDINGS[b.type].produces;
          if (!prod) continue;
          resources[prod.resource] += prod.perMinute * minutes * b.level;
        }
        const quests = village.quests.map((q) =>
          q.id === "q2"
            ? { ...q, current: Math.min(q.target, resources.gold) }
            : q.id === "q3"
              ? { ...q, current: Math.min(q.target, village.xp) }
              : q,
        );
        set({ village: { ...village, resources, quests }, lastTick: now });
      },

      syncRemote: async () => {
        const { village } = get();
        if (!village) return;
        await persistVillage(village);
      },

      ensureArmyCamp: () => {
        const raw = get().village;
        if (!raw) return;
        const village = normalizeRoster(raw);
        if (village !== raw) set({ village });
        const hall = village.buildings.find((b) => b.type === "townhall");
        const camp = village.buildings.find((b) => b.type === "army_camp");
        const tooClose =
          camp &&
          hall &&
          Math.max(Math.abs(camp.pos.x - hall.pos.x), Math.abs(camp.pos.z - hall.pos.z)) < 5;
        if (camp && !tooClose) return;
        const search = camp
          ? { ...village, buildings: village.buildings.filter((b) => b.instanceId !== camp.instanceId) }
          : village;
        const pos = findEmptyPlot(search, BUILDINGS.army_camp.footprint);
        if (!pos) return;
        const now = Date.now();
        const next = camp
          ? village.buildings.map((b) => (b.instanceId === camp.instanceId ? { ...b, pos } : b))
          : [
              ...village.buildings,
              {
                instanceId: uid("b"),
                type: "army_camp" as const,
                level: 1,
                pos,
                state: "idle" as const,
                hp: BUILDINGS.army_camp.hp,
                maxHp: BUILDINGS.army_camp.hp,
                builtAt: now,
              },
            ];
        set({ village: { ...village, buildings: next } });
        void get().syncRemote();
      },

      ensureBuilderHuts: () => {
        const village = get().village;
        if (!village) return;
        const need = Math.max(STARTER_BUILDERS, village.builderCount ?? STARTER_BUILDERS);
        let buildings = village.buildings;
        let search = village;
        let added = false;
        const have = buildings.filter((b) => b.type === "builder_hut").length;
        for (let i = have; i < need; i += 1) {
          const pos = findEmptyPlot(search, BUILDINGS.builder_hut.footprint, 3);
          if (!pos) break;
          buildings = [...buildings, makeBuilding("builder_hut", pos)];
          search = { ...search, buildings };
          added = true;
        }
        if (!added) return;
        set({ village: { ...village, buildings } });
        void get().syncRemote();
      },
    }),
    {
      name: "gigaraid-village",
      partialize: (s) => ({
        village: s.village,
        settings: s.settings,
        tutorialStep: s.tutorialStep,
        tutorialSkipped: s.tutorialSkipped,
        lastTick: s.lastTick,
        onboardedWallets: s.onboardedWallets,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.village) state.village = normalizeRoster(state.village);
      },
    },
  ),
);
