import { Lock } from "lucide-react";
import { DOCK } from "@/data/catalog";
import { DOCK_ICONS } from "@/components/hud/hudIcons";
import { HudPanel } from "@/components/hud/HudPrimitives";
import { useGameStore } from "@/store/gameStore";

export function BottomDock({ townhallLevel }: { townhallLevel: number }) {
  const active = useGameStore((s) => s.activeTab);
  const setTab = useGameStore((s) => s.setTab);

  return (
    <HudPanel className="flex items-center gap-1 rounded-full px-1.5 py-1.5">
      {DOCK.map((item) => {
        const locked = townhallLevel < item.unlockTownhall;
        const Icon = DOCK_ICONS[item.id];
        const isOn = active === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              if (locked) return;
              setTab(isOn ? null : item.id);
            }}
            className={`group relative flex w-[4.5rem] flex-col items-center gap-1 rounded-full px-2 py-1.5 transition ${
              isOn
                ? "bg-white/10"
                : locked
                  ? "opacity-45"
                  : "hover:bg-white/6"
            }`}
          >
            <span
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full transition"
              style={{
                background: locked
                  ? "rgb(255 255 255 / 0.06)"
                  : `linear-gradient(180deg, ${item.accent}40, ${item.accent}12)`,
                boxShadow: isOn
                  ? `0 0 0 2px ${item.accent}, 0 0 18px ${item.accent}55`
                  : `inset 0 0 0 1px ${item.accent}44`,
                color: locked ? "#d4d4d8" : item.accent,
              }}
            >
              {locked ? (
                <Lock className="h-4 w-4" strokeWidth={2.2} />
              ) : (
                <Icon className="h-4.5 w-4.5" strokeWidth={2.15} />
              )}
            </span>
            <span
              className={`text-[10px] font-semibold tracking-wider uppercase ${
                isOn ? "text-white" : "text-white/55"
              }`}
            >
              {item.label}
            </span>
            {locked && (
              <span className="absolute -top-0.5 -right-0.5 rounded-full bg-black/70 px-1 text-[9px] font-semibold text-white/70">
                {item.unlockTownhall}
              </span>
            )}
          </button>
        );
      })}
    </HudPanel>
  );
}
