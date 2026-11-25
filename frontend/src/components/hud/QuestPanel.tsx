import { Circle, CircleCheck, ScrollText } from "lucide-react";
import { HudIconBadge, HudPanel } from "@/components/hud/HudPrimitives";
import type { Quest } from "@/types/game";

export function QuestPanel({ quests }: { quests: Quest[] }) {
  const allComplete =
    quests.length === 0 || quests.every((quest) => quest.current >= quest.target);
  if (allComplete) return null;

  return (
    <HudPanel className="w-64 px-3.5 py-3">
      <div className="mb-2.5 flex items-center gap-2">
        <HudIconBadge icon={ScrollText} color="#f5e642" size="sm" />
        <span className="text-[11px] font-semibold tracking-wider text-white/60 uppercase">
          Starter quests
        </span>
      </div>
      <ul className="space-y-2.5">
        {quests.map((q) => {
          const done = q.current >= q.target;
          const pct = Math.min(100, (q.current / q.target) * 100);
          return (
            <li key={q.id}>
              <div className="flex items-start gap-2">
                {done ? (
                  <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-raid-lime" strokeWidth={2.2} />
                ) : (
                  <Circle className="mt-0.5 h-4 w-4 shrink-0 text-white/30" strokeWidth={2} />
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] leading-snug font-medium">{q.title}</div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/8">
                    <div
                      className={`h-full rounded-full ${done ? "bg-raid-lime" : "bg-white/35"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="mt-1 text-[11px] text-white/40 tabular-nums">
                    {Math.floor(q.current)}/{q.target}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </HudPanel>
  );
}
