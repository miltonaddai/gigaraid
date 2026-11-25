import { STORAGE_CAPACITY } from "@/data/catalog";
import type { BuildingId, TroopId, VillageBuilding } from "@/types/game";

export interface SpriteClip {
  row: number;
  col: number;
  frames: number;
  fps?: number;
}

export interface SpriteSheet {
  url: string;
  columns: number;
  rows: number;
  width: number;
  height: number;
  idle: SpriteClip;
  move?: SpriteClip;
  billboard?: "full" | "yaw" | "iso";
  ground?: number;
  padBottom?: number;
  /** Shift the 2D card toward the camera so it sits on the ground plot. */
  isoPush?: number;
  /** Extra local yaw after iso/yaw facing, in radians. */
  isoYaw?: number;
  /** Extra world XZ shift after isoPush. */
  shiftX?: number;
  shiftZ?: number;
}

const CHAR_FULL = "/sprites/characters-full";

function dir8Clip(
  moving: boolean,
  acting: boolean,
  facing: number,
  moveRow: number,
  actRow: number,
): SpriteClip {
  if (moving) return { row: moveRow + facing, col: 0, frames: 8, fps: 10 };
  if (acting) return { row: actRow + facing, col: 0, frames: 9, fps: 8 };
  return { row: 0, col: facing, frames: 1 };
}

export const MINION_SPRITE: SpriteSheet = {
  url: `${CHAR_FULL}/minion.png`,
  columns: 9,
  rows: 17,
  width: 1.8,
  height: 1.8,
  idle: { row: 0, col: 1, frames: 1 },
  move: { row: 9, col: 0, frames: 8, fps: 10 },
};

export function minionFacing(dx: number, dz: number) {
  if (dx === 0 && dz === 0) return 1;
  const oct = Math.round(Math.atan2(dx, dz) / (Math.PI / 4));
  return ((oct % 8) + 8) % 8;
}

export function minionClip(
  moving: boolean,
  acting: boolean,
  facing: number,
): SpriteClip {
  return dir8Clip(moving, acting, facing, 9, 1);
}

export const ARCHER_SPRITE: SpriteSheet = {
  url: `${CHAR_FULL}/archer.png`,
  columns: 9,
  rows: 17,
  width: 1.9,
  height: 1.9,
  idle: { row: 0, col: 1, frames: 1 },
};

export function archerClip(
  moving: boolean,
  shooting: boolean,
  facing: number,
): SpriteClip {
  return dir8Clip(moving, shooting, facing, 1, 9);
}

export const BUILDER_SPRITE: SpriteSheet = {
  url: `${CHAR_FULL}/builder.png`,
  columns: 9,
  rows: 17,
  width: 2.05,
  height: 2.05,
  idle: { row: 0, col: 1, frames: 1 },
};

export function builderClip(
  moving: boolean,
  working: boolean,
  facing: number,
): SpriteClip {
  return dir8Clip(moving, working, facing, 9, 1);
}

export const BULL_RIDER_SPRITE: SpriteSheet = {
  url: `${CHAR_FULL}/bull-rider.png`,
  columns: 9,
  rows: 17,
  width: 2.15,
  height: 2.15,
  idle: { row: 0, col: 1, frames: 1 },
};

export function bullRiderClip(
  moving: boolean,
  striking: boolean,
  facing: number,
): SpriteClip {
  return dir8Clip(moving, striking, facing, 1, 9);
}

export const GIANT_SPRITE: SpriteSheet = {
  url: "/sprites/giant/A_hulking_giant_with_a-Idle.png",
  columns: 9,
  rows: 17,
  width: 2.7,
  height: 2.7,
  idle: { row: 0, col: 1, frames: 1 },
};

export function giantClip(
  moving: boolean,
  striking: boolean,
  facing: number,
): SpriteClip {
  return dir8Clip(moving, striking, facing, 9, 1);
}

export const CANNON_SPRITE: SpriteSheet = {
  url: "/sprites/cannon/rusty_cannon_on_360_swivel.png",
  columns: 8,
  rows: 1,
  width: 2.8,
  height: 2.8,
  idle: { row: 0, col: 1, frames: 1 },
  billboard: "yaw",
  ground: 0.04,
  padBottom: 0.09,
  isoPush: 1,
};

export const TOWNHALL_SPRITE: SpriteSheet = {
  url: "/sprites/townhall/level_one_village_townhall_-_c.png",
  columns: 8,
  rows: 1,
  width: 4.5,
  height: 4.2,
  idle: { row: 0, col: 1, frames: 1 },
  billboard: "yaw",
  ground: 0.06,
  padBottom: 0.12,
  isoPush: 1.7,
};

export function townhallSprite(level: number): SpriteSheet {
  if (level < 2) return TOWNHALL_SPRITE;
  if (level >= 3) {
    return {
      url: "/sprites/townhall/Level_3_townhall_big_castle_st.png",
      columns: 8,
      rows: 1,
      width: 6.1,
      height: 5.8,
      idle: { row: 0, col: 1, frames: 1 },
      billboard: "yaw",
      ground: 0.04,
      padBottom: 0.015,
      isoPush: 2.35,
    };
  }
  return {
    url: "/sprites/townhall/level_two_medieval_townhall.png",
    columns: 8,
    rows: 1,
    width: 5.5,
    height: 5.25,
    idle: { row: 0, col: 1, frames: 1 },
    billboard: "yaw",
    ground: 0.03,
    padBottom: 0.05,
    isoPush: 2.15,
  };
}

export const MINE_SPRITE: SpriteSheet = {
  url: "/sprites/mine/ground_mining_pump.png",
  columns: 9,
  rows: 9,
  width: 3.2,
  height: 2.9,
  idle: { row: 2, col: 0, frames: 9, fps: 7 },
  billboard: "yaw",
  ground: 0.06,
  padBottom: 0.14,
  isoPush: 1.05,
};

export function mineSprite(level: number): SpriteSheet {
  if (level < 2) return MINE_SPRITE;
  return {
    url: "/sprites/mine/ground_mining_pump_lvl2.png",
    columns: 9,
    rows: 9,
    width: 3.5,
    height: 3.2,
    idle: { row: 2, col: 0, frames: 9, fps: 7 },
    billboard: "yaw",
    ground: 0.04,
    padBottom: 0.118,
    isoPush: 1.15,
  };
}

export const ELIXIR_MAKER_SPRITE: SpriteSheet = {
  url: "/sprites/elixir-maker/Elixir_maker_with_purple_fluid.png",
  columns: 8,
  rows: 1,
  width: 3.1,
  height: 3.1,
  idle: { row: 0, col: 7, frames: 1 },
  billboard: "full",
  ground: 0.04,
  padBottom: 0.08,
  isoPush: 1.15,
};

export type StorageFill = "empty" | "half" | "full";

const STORAGE_URLS: Record<1 | 2, Record<StorageFill, string>> = {
  1: {
    empty: "/sprites/storage/lvl1-empty/large_Gold_coin_storage_-_wood.png",
    half: "/sprites/storage/lvl1-half/large_Gold_coin_storage_-_wood.png",
    full: "/sprites/storage/large_Gold_coin_storage_-_wood.png",
  },
  2: {
    empty: "/sprites/storage/lvl2-empty/large_Gold_coin_storage_-_wood.png",
    half: "/sprites/storage/lvl2-half/large_Gold_coin_storage_-_wood.png",
    full: "/sprites/storage/lvl2-full/large_Gold_coin_storage_-_wood.png",
  },
};

export function storageCapacity(level: number) {
  return level >= 2 ? STORAGE_CAPACITY[2] : STORAGE_CAPACITY[1];
}

export function storageFill(
  gold: number,
  buildings: VillageBuilding[],
): StorageFill {
  const cap = buildings
    .filter((b) => b.type === "storage")
    .reduce((sum, b) => sum + storageCapacity(b.level), 0);
  const ratio = cap > 0 ? gold / cap : 0;
  if (ratio < 0.12) return "empty";
  if (ratio < 0.72) return "half";
  return "full";
}

export function storageSprite(level: number, fill: StorageFill): SpriteSheet {
  const tier = level >= 2 ? 2 : 1;
  const large = tier === 2;
  return {
    url: STORAGE_URLS[tier][fill],
    columns: 8,
    rows: 1,
    width: large ? 4.15 : 3.55,
    height: large ? 3.85 : 3.3,
    idle: { row: 0, col: 1, frames: 1 },
    billboard: "yaw",
    ground: 0.04,
    padBottom: large ? 0.06 : 0.09,
    isoPush: large ? 1.75 : 1.55,
  };
}

export const BUILDING_SPRITES: Partial<Record<BuildingId, SpriteSheet>> = {
  cannon: CANNON_SPRITE,
  elixir_storage: ELIXIR_MAKER_SPRITE,
};

export const TROOP_SPRITES: Partial<Record<TroopId, SpriteSheet>> = {
  minion: MINION_SPRITE,
  archer: ARCHER_SPRITE,
  bull_rider: BULL_RIDER_SPRITE,
  giant: GIANT_SPRITE,
};
