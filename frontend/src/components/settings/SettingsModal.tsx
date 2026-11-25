import { LogOut, Monitor, Settings, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HudIconBadge, HudPanel } from "@/components/hud/HudPrimitives";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/providers/auth";
import { useGameStore } from "@/store/gameStore";
import type { GameSettings, GraphicsQuality } from "@/types/game";

const QUALITY: GraphicsQuality[] = ["low", "med", "high"];

export function SettingsModal() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const open = useGameStore((s) => s.settingsOpen);
  const settings = useGameStore((s) => s.settings);
  const openSettings = useGameStore((s) => s.openSettings);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const [draft, setDraft] = useState<GameSettings>(settings);

  useEffect(() => {
    if (open) setDraft(settings);
  }, [open, settings]);

  if (!open) return null;

  return (
    <div className="font-hud absolute inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
      <HudPanel className="relative w-full max-w-lg px-7 py-6">
        <button
          type="button"
          aria-label="Close settings"
          className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/8 text-white/65 hover:text-white"
          onClick={() => openSettings(false)}
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-3">
          <HudIconBadge icon={Settings} color="#f5e642" />
          <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
        </div>

        <section className="mt-6 space-y-4">
          <ToggleRow
            label="Battle alerts"
            checked={draft.battleAlerts}
            onCheckedChange={(v) => setDraft({ ...draft, battleAlerts: v })}
          />
          <ToggleRow
            label="Screen shake"
            checked={draft.screenShake}
            onCheckedChange={(v) => setDraft({ ...draft, screenShake: v })}
          />
          <div className="flex items-center justify-between gap-4">
            <span className="inline-flex items-center gap-2 text-sm font-medium">
              <Monitor className="h-4 w-4 text-white/50" />
              Graphics
            </span>
            <div className="flex gap-1.5">
              {QUALITY.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setDraft({ ...draft, graphics: q })}
                  className={`rounded-full px-3 py-1 text-[12px] font-semibold tracking-wide uppercase ${
                    draft.graphics === q
                      ? "bg-raid-yellow text-black"
                      : "bg-white/8 text-white/70 hover:text-white"
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-8 flex gap-3">
          <Button
            variant="outline"
            className="font-hud flex-1 text-sm font-semibold"
            onClick={() => openSettings(false)}
          >
            Cancel
          </Button>
          <Button
            className="font-hud flex-[2] text-sm font-semibold"
            onClick={() => {
              updateSettings(draft);
              openSettings(false);
            }}
          >
            Save changes
          </Button>
        </div>
        <div className="mt-4 border-t border-white/10 pt-4">
          <Button
            variant="outline"
            className="font-hud w-full border-red-400/35 text-sm font-semibold text-red-200 hover:bg-red-500/10"
            onClick={() => {
              openSettings(false);
              signOut();
              navigate("/", { replace: true });
            }}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </HudPanel>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium">{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
