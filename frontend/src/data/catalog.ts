import type {
  BuildingId,
  DockTab,
  ResourceId,
  SpellId,
  TroopId,
  Village,
  VillageBuilding,
} from "@/types/game";

export const GRID_SIZE = 22;
export const TILE_SIZE = 1.6;
export const LAND_TILES = 52;
export const PLAYABLE_SIZE = GRID_SIZE * TILE_SIZE;
export const LAND_SIZE = LAND_TILES * TILE_SIZE;
export const LAND_PAD = (LAND_TILES - GRID_SIZE) / 2;

export const RESOURCE_META: Record<
  ResourceId,
  { label: string; color: string; short: string }
> = {
  gold: { label: "Gold", color: "#F5C542", short: "GOLD" },
  elixir: { label: "Elixir", color: "#B56BFF", short: "ELX" },
  ore: { label: "Ore", color: "#C9CED6", short: "ORE" },
};

export interface BuildingDef {
  id: BuildingId;
  name: string;
  description: string;
  footprint: number;
  unlockTownhall: number;
  cost: Partial<Record<ResourceId, number>>;
  hp: number;
  range?: number;
  dps?: number;
  produces?: { resource: ResourceId; perMinute: number };
}

export const BUILDINGS: Record<BuildingId, BuildingDef> = {
  townhall: {
    id: "townhall",
    name: "Town Hall",
    description: "Heart of the village. Upgrade to unlock the roster.",
    footprint: 2,
    unlockTownhall: 1,
    cost: { gold: 0 },
    hp: 1400,
  },
  builder_hut: {
    id: "builder_hut",
    name: "Builder Hut",
    description: "Your builder lives here. Idle hands wait by the door.",
    footprint: 2,
    unlockTownhall: 1,
    cost: { gold: 0 },
    hp: 350,
  },
  gold_mine: {
    id: "gold_mine",
    name: "Gold Mine",
    description: "Miners pull gold from the vein. Guard it or lose it.",
    footprint: 2,
    unlockTownhall: 1,
    cost: { gold: 120 },
    hp: 500,
    produces: { resource: "gold", perMinute: 18 },
  },
  storage: {
    id: "storage",
    name: "Gold Vault",
    description: "Hoard mined gold. Attackers can only skim a fixed cut.",
    footprint: 2,
    unlockTownhall: 1,
    cost: { gold: 150 },
    hp: 650,
  },
  cannon: {
    id: "cannon",
    name: "Cannon",
    description: "Close-range iron. First line against ground raids.",
    footprint: 2,
    unlockTownhall: 1,
    cost: { gold: 90 },
    hp: 420,
    range: 5,
    dps: 18,
  },
  army_camp: {
    id: "army_camp",
    name: "Army Camp",
    description: "Training yard. Holds 20 minions. More camps, bigger roster.",
    footprint: 3,
    unlockTownhall: 1,
    cost: { gold: 180, elixir: 40 },
    hp: 500,
  },
  elixir_storage: {
    id: "elixir_storage",
    name: "Elixir Maker",
    description: "Brews purple elixir for troops and spells.",
    footprint: 2,
    unlockTownhall: 1,
    cost: { gold: 200, elixir: 80 },
    hp: 600,
    produces: { resource: "elixir", perMinute: 12 },
  },
  land_bow: {
    id: "land_bow",
    name: "Land Bow",
    description: "Siege bow that punishes clumps before they reach the hall.",
    footprint: 2,
    unlockTownhall: 4,
    cost: { gold: 340 },
    hp: 720,
    range: 8,
    dps: 32,
  },
};

export interface TroopDef {
  id: TroopId;
  name: string;
  description: string;
  unlockTownhall: number;
  housing: number;
  cost: Partial<Record<ResourceId, number>>;
  hp: number;
  dps: number;
  speed: number;
  range: number;
}

export const TROOPS: Record<TroopId, TroopDef> = {
  minion: {
    id: "minion",
    name: "Minion",
    description: "Weakest line. Every village starts with five.",
    unlockTownhall: 1,
    housing: 1,
    cost: { elixir: 10 },
    hp: 40,
    dps: 8,
    speed: 1.4,
    range: 0.6,
  },
  archer: {
    id: "archer",
    name: "Archer",
    description: "Packs a punch. Dies if anything looks at them.",
    unlockTownhall: 2,
    housing: 1,
    cost: { elixir: 30 },
    hp: 28,
    dps: 16,
    speed: 1.5,
    range: 3.2,
  },
  giant: {
    id: "giant",
    name: "Giant",
    description: "Tallest, toughest, slowest. Eats tower fire.",
    unlockTownhall: 3,
    housing: 5,
    cost: { elixir: 120 },
    hp: 280,
    dps: 22,
    speed: 0.7,
    range: 0.7,
  },
  bull_rider: {
    id: "bull_rider",
    name: "Bull Rider",
    description: "Fast smash. Tears through walls and storage.",
    unlockTownhall: 5,
    housing: 4,
    cost: { elixir: 160 },
    hp: 160,
    dps: 40,
    speed: 1.8,
    range: 0.6,
  },
  bear: {
    id: "bear",
    name: "War Bear",
    description: "Hired muscle. Only giants out-tank them.",
    unlockTownhall: 6,
    housing: 8,
    cost: { elixir: 240 },
    hp: 320,
    dps: 36,
    speed: 1.0,
    range: 0.7,
  },
  wizard: {
    id: "wizard",
    name: "Wizard",
    description: "Fire-throwing demons. Splash from mid range.",
    unlockTownhall: 4,
    housing: 4,
    cost: { elixir: 200 },
    hp: 70,
    dps: 48,
    speed: 1.2,
    range: 3.6,
  },
};

export interface SpellDef {
  id: SpellId;
  name: string;
  description: string;
  unlockTownhall: number;
  cost: Partial<Record<ResourceId, number>>;
}

export const SPELLS: Record<SpellId, SpellDef> = {
  damage: {
    id: "damage",
    name: "Ruin",
    description: "Weakens buildings in a radius.",
    unlockTownhall: 4,
    cost: { elixir: 80 },
  },
  heal: {
    id: "heal",
    name: "Mend",
    description: "Heals your warband while they take fire.",
    unlockTownhall: 4,
    cost: { elixir: 80 },
  },
  freeze: {
    id: "freeze",
    name: "Frost",
    description: "Locks defenses and troops for a short window.",
    unlockTownhall: 5,
    cost: { elixir: 120 },
  },
};

export const DOCK: {
  id: DockTab;
  label: string;
  unlockTownhall: number;
  accent: string;
}[] = [
  { id: "build", label: "Build", unlockTownhall: 1, accent: "#4ADE80" },
  { id: "army", label: "Army", unlockTownhall: 1, accent: "#C4A574" },
  { id: "clan", label: "Clan", unlockTownhall: 1, accent: "#60A5FA" },
  { id: "shop", label: "Shop", unlockTownhall: 1, accent: "#F5E642" },
];

export const STARTER_MINIONS = 5;
export const CAMP_MINION_CAP = 20;
export const STORAGE_CAPACITY = { 1: 1500, 2: 3500 } as const;
export const MAX_BUILDING_LEVEL = 10;
export const MAX_BUILDERS = 5;
export const STARTER_BUILDERS = 1;
export const BUILDER_HIRE_COST = [250, 750, 2000, 5000] as const;

export const UPGRADABLE = [
  "townhall",
  "cannon",
  "gold_mine",
  "storage",
  "army_camp",
] as const;

export type UpgradableId = (typeof UPGRADABLE)[number];

export function isUpgradable(type: BuildingId): type is UpgradableId {
  return (UPGRADABLE as readonly string[]).includes(type);
}

export function upgradeCost(type: BuildingId, level: number): number | null {
  if (!isUpgradable(type) || level >= MAX_BUILDING_LEVEL) return null;
  const base: Record<UpgradableId, number> = {
    townhall: 400,
    cannon: 80,
    gold_mine: 110,
    storage: 120,
    army_camp: 140,
  };
  return Math.round(base[type] * 1.65 ** (level - 1));
}

export function upgradeDurationMs(type: BuildingId, level: number): number {
  const base: Record<UpgradableId, number> = {
    townhall: 90_000,
    cannon: 22_000,
    gold_mine: 26_000,
    storage: 28_000,
    army_camp: 32_000,
  };
  if (!isUpgradable(type)) return 20_000;
  return base[type] * level;
}

export function builderHireCost(currentCount: number): number | null {
  if (currentCount < 1 || currentCount >= MAX_BUILDERS) return null;
  return BUILDER_HIRE_COST[currentCount - 1] ?? null;
}

export function busyBuilderCount(
  buildings: VillageBuilding[],
  now = Date.now(),
) {
  return buildings.filter(
    (b) => b.state === "upgrading" && (b.upgradeEndsAt ?? 0) > now,
  ).length;
}

export function freeBuilders(village: Village, now = Date.now()) {
  return Math.max(
    0,
    (village.builderCount ?? STARTER_BUILDERS) - busyBuilderCount(village.buildings, now),
  );
}
