import type { BuildingId, TroopId } from "@/types/game";

/**
 * Drop a Tripo / Meshy / Kenney GLB into `frontend/public/models`
 * and set the path here. Empty string = use the procedural mesh.
 *
 * Example:
 *   townhall: "/models/townhall.glb"
 */
export const BUILDING_MODELS: Record<BuildingId, string> = {
  townhall: "",
  builder_hut: "",
  gold_mine: "",
  army_camp: "",
  storage: "",
  elixir_storage: "",
  cannon: "",
  land_bow: "",
};

export const TROOP_MODELS: Record<TroopId, string> = {
  minion: "",
  archer: "",
  giant: "",
  bull_rider: "",
  bear: "",
  wizard: "",
};

export const HERO_MODEL = "";
