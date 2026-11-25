import { Map } from "lucide-react";
import { GRID_SIZE } from "@/data/catalog";
import { HudPanel } from "@/components/hud/HudPrimitives";
import type { VillageBuilding } from "@/types/game";

const COLORS: Record<string, string> = {
  townhall: "#f5e642",
  cannon: "#9ca3af",
  gold_mine: "#f0c14b",
  storage: "#eab308",
  elixir_storage: "#a855f7",
  builder_hut: "#e07a2f",
  army_camp: "#c4a574",
  land_bow: "#78716c",
};

export function Minimap({ buildings }: { buildings: VillageBuilding[] }) {
  return (
    <HudPanel className="relative h-[7.5rem] w-[7.5rem] overflow-hidden p-1.5">
      <div className="relative h-full w-full overflow-hidden rounded-xl bg-[#2f5a24]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-size-[12px_12px]" />
        {buildings.map((b) => (
          <span
            key={b.instanceId}
            className="absolute rounded-[3px] shadow-[0_0_0_1px_rgba(0,0,0,0.35)]"
            style={{
              left: `${(b.pos.x / GRID_SIZE) * 100}%`,
              top: `${(b.pos.z / GRID_SIZE) * 100}%`,
              width: 8,
              height: 8,
              background: COLORS[b.type] ?? "#fff",
            }}
          />
        ))}
        <span className="absolute right-1.5 bottom-1.5 inline-flex items-center gap-1 rounded-full bg-black/45 px-1.5 py-0.5 text-[9px] font-semibold tracking-wider text-white/70 uppercase">
          <Map className="h-2.5 w-2.5" strokeWidth={2.4} />
          Map
        </span>
      </div>
    </HudPanel>
  );
}
