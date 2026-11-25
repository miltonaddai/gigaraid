import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { HudIconBadge, HudPanel } from "@/components/hud/HudPrimitives";
import { formatTime } from "@/lib/utils";

export function ShieldBadge({ endsAt }: { endsAt: number }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);
  const left = Math.max(0, Math.floor((endsAt - now) / 1000));
  if (left <= 0) return null;
  return (
    <HudPanel className="flex items-center gap-2.5 rounded-full px-2.5 py-1.5">
      <HudIconBadge icon={ShieldCheck} color="#7dd3fc" size="sm" />
      <div>
        <div className="text-[10px] font-semibold tracking-wider text-sky-200/80 uppercase">
          Beginner shield
        </div>
        <div className="text-sm font-semibold leading-none text-sky-100 tabular-nums">
          {formatTime(left)}
        </div>
      </div>
    </HudPanel>
  );
}
