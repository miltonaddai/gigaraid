import {
  BowArrow,
  Bug,
  Castle,
  CircleDollarSign,
  Coins,
  Crosshair,
  Flame,
  FlaskConical,
  Gem,
  Ghost,
  Hammer,
  House,
  HeartPulse,
  Landmark,
  Mountain,
  PawPrint,
  Pickaxe,
  Shield,
  ShoppingBag,
  Snowflake,
  Sparkles,
  Tent,
  Users,
  Warehouse,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { BuildingId, DockTab, ResourceId, SpellId, TroopId } from "@/types/game";

export const RESOURCE_ICONS: Record<ResourceId, LucideIcon> = {
  gold: Coins,
  elixir: FlaskConical,
  ore: Gem,
};

export const RESOURCE_TINT: Record<ResourceId, string> = {
  gold: "#F5C542",
  elixir: "#C084FC",
  ore: "#D4D4D8",
};

export const DOCK_ICONS: Record<DockTab, LucideIcon> = {
  build: Hammer,
  army: Shield,
  clan: Users,
  shop: ShoppingBag,
};

export const BUILDING_ICONS: Record<BuildingId, LucideIcon> = {
  townhall: Castle,
  builder_hut: House,
  gold_mine: Pickaxe,
  army_camp: Tent,
  storage: Warehouse,
  elixir_storage: FlaskConical,
  cannon: Crosshair,
  land_bow: BowArrow,
};

export const TROOP_ICONS: Record<TroopId, LucideIcon> = {
  minion: Bug,
  archer: BowArrow,
  giant: Mountain,
  bull_rider: Zap,
  bear: PawPrint,
  wizard: Ghost,
};

export const SPELL_ICONS: Record<SpellId, LucideIcon> = {
  damage: Flame,
  heal: HeartPulse,
  freeze: Snowflake,
};

export const SHOP_ICONS = {
  Pouch: CircleDollarSign,
  Crate: Landmark,
  Hoard: Sparkles,
} as const;
