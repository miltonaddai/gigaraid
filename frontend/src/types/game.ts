export type ResourceId = "gold" | "elixir" | "ore";

export type BuildingId =
  | "townhall"
  | "builder_hut"
  | "gold_mine"
  | "army_camp"
  | "storage"
  | "elixir_storage"
  | "cannon"
  | "land_bow";

export type TroopId =
  | "minion"
  | "archer"
  | "giant"
  | "bull_rider"
  | "bear"
  | "wizard";

export type SpellId = "damage" | "heal" | "freeze";

export type DockTab = "build" | "army" | "clan" | "shop";

export type GraphicsQuality = "low" | "med" | "high";

export type BuildingState = "ghost" | "building" | "idle" | "upgrading";

export interface GridPos {
  x: number;
  z: number;
}

export interface VillageBuilding {
  instanceId: string;
  type: BuildingId;
  level: number;
  pos: GridPos;
  state: BuildingState;
  hp: number;
  maxHp: number;
  builtAt: number;
  upgradeEndsAt?: number;
}

export interface VillageTroop {
  instanceId: string;
  type: TroopId;
  count: number;
  level: number;
}

export interface Resources {
  gold: number;
  elixir: number;
  ore: number;
}

export interface Quest {
  id: string;
  title: string;
  current: number;
  target: number;
}

export interface GameSettings {
  music: number;
  sfx: number;
  battleAlerts: boolean;
  screenShake: boolean;
  graphics: GraphicsQuality;
}

export interface Village {
  id: string;
  name: string;
  ownerWallet: string;
  townhallLevel: number;
  xp: number;
  xpToNext: number;
  resources: Resources;
  buildings: VillageBuilding[];
  troops: VillageTroop[];
  quests: Quest[];
  shieldEndsAt: number;
  createdAt: number;
  builderCount: number;
}
