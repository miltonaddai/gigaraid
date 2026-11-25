import { Flag, ShoppingBag, Sparkles, Users, X } from "lucide-react";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  CAMP_MINION_CAP,
  SPELLS,
  TROOPS,
} from "@/data/catalog";
import { Button } from "@/components/ui/button";
import { TroopPortrait } from "@/components/hud/AssetPortrait";
import { SPELL_ICONS, SHOP_ICONS, TROOP_ICONS } from "@/components/hud/hudIcons";
import {
  HudIconBadge,
  HudPanel,
  ResourceCost,
} from "@/components/hud/HudPrimitives";
import { TROOP_SPRITES } from "@/game/assets/sprites";
import { useGameStore } from "@/store/gameStore";

export function SidePanels() {
  const tab = useGameStore((s) => s.activeTab);
  if (tab === "build") return null;
  if (tab === "army") return <ArmyPanel />;
  if (tab === "clan") return <ClanPanel />;
  if (tab === "shop") return <ShopPanel />;
  return null;
}

function Shell({
  title,
  icon,
  color,
  children,
}: {
  title: string;
  icon: LucideIcon;
  color: string;
  children: ReactNode;
}) {
  const setTab = useGameStore((s) => s.setTab);
  return (
    <HudPanel className="absolute bottom-28 left-1/2 z-20 w-[min(640px,94vw)] -translate-x-1/2 px-5 py-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <HudIconBadge icon={icon} color={color} />
          <span className="text-lg font-semibold tracking-tight">{title}</span>
        </div>
        <button
          type="button"
          aria-label="Close panel"
          onClick={() => setTab(null)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/8 text-white/60 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {children}
    </HudPanel>
  );
}

function ArmyPanel() {
  const village = useGameStore((s) => s.village);
  const trainTroop = useGameStore((s) => s.trainTroop);
  if (!village) return null;
  const camps = Math.max(
    1,
    village.buildings.filter((b) => b.type === "army_camp").length,
  );
  const capacity = camps * CAMP_MINION_CAP;
  const housingUsed = village.troops.reduce(
    (total, stack) => total + stack.count * TROOPS[stack.type].housing,
    0,
  );

  return (
    <Shell title="Army" icon={Flag} color="#C4A574">
      <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/4 px-3 py-2">
        <div>
          <div className="text-xs font-semibold tracking-wide text-white/80 uppercase">
            Training roster
          </div>
          <div className="text-[11px] text-white/45">
            A new fighter unlocks with each Town Hall tier.
          </div>
        </div>
        <div className="rounded-full bg-black/35 px-3 py-1 text-xs font-semibold tabular-nums">
          Housing {housingUsed}/{capacity}
        </div>
      </div>
      <div className="grid max-h-[43vh] grid-cols-2 gap-2 overflow-y-auto pr-1 md:grid-cols-3">
        {Object.values(TROOPS)
          .sort((a, b) => a.unlockTownhall - b.unlockTownhall)
          .map((t) => {
          const owned = village.troops.find((x) => x.type === t.id)?.count ?? 0;
          const locked = village.townhallLevel < t.unlockTownhall;
          const Icon = TROOP_ICONS[t.id];
          const canAfford = Object.entries(t.cost).every(
            ([resource, amount]) =>
              village.resources[resource as keyof typeof village.resources] >=
              (amount ?? 0),
          );
          const hasSpace = housingUsed + t.housing <= capacity;
          return (
            <div
              key={t.id}
              className={`group overflow-hidden rounded-2xl border bg-black/25 p-2.5 transition ${
                locked
                  ? "border-white/6 opacity-45"
                  : "border-white/10 hover:border-raid-yellow/30"
              }`}
            >
              <div className="relative flex h-20 items-center justify-center overflow-hidden rounded-xl bg-[radial-gradient(circle_at_50%_70%,rgb(245_230_66/0.16),transparent_65%)]">
                <TroopPortrait
                  type={t.id}
                  className="h-20 w-20 transition-transform group-hover:scale-110"
                />
                {!TROOP_SPRITES[t.id] && (
                  <Icon className="h-8 w-8 text-white/35" strokeWidth={1.5} />
                )}
                <span className="absolute top-1.5 right-1.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px]">
                  x{owned}
                </span>
              </div>
              <div className="mt-2 flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-[10px] text-white/40">{t.housing} housing</div>
                </div>
                <HudIconBadge
                  icon={Icon}
                  color={locked ? "#a1a1aa" : "#e4e4e7"}
                  size="sm"
                />
              </div>
              {locked ? (
                <div className="mt-2 rounded-lg bg-white/5 py-1.5 text-center text-[11px] text-white/55">
                  Unlocks at Town Hall {t.unlockTownhall}
                </div>
              ) : (
                <>
                  <div className="mt-2">
                    <ResourceCost cost={t.cost} />
                  </div>
                  <Button
                    className="font-hud mt-2 h-8 w-full text-xs font-semibold"
                    disabled={!canAfford || !hasSpace}
                    onClick={() => trainTroop(t.id)}
                  >
                    {!hasSpace ? "Camp full" : canAfford ? "Train" : "Need resources"}
                  </Button>
                </>
              )}
            </div>
          );
          })}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-white/55">
        <Sparkles className="h-3.5 w-3.5" />
        Spells
        {Object.values(SPELLS).map((s) => {
          const Icon = SPELL_ICONS[s.id];
          return (
            <span
              key={s.id}
              className="inline-flex items-center gap-1 rounded-full bg-white/6 px-2 py-0.5"
            >
              <Icon className="h-3 w-3" />
              {s.name}
            </span>
          );
        })}
      </div>
    </Shell>
  );
}

function ClanPanel() {
  return (
    <Shell title="Clan" icon={Users} color="#60A5FA">
      <p className="text-sm leading-relaxed text-white/70">
        Villages can form clans from Town Hall 1 to coordinate raids and prepare
        for seasonal wars. Clan chat and shared reinforcements are coming next.
      </p>
    </Shell>
  );
}

function ShopPanel() {
  return (
    <Shell title="Shop" icon={ShoppingBag} color="#F5E642">
      <p className="text-sm text-white/65">
        Gold packs are coming soon. Purchases are disabled in this build.
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          { name: "Pouch", gold: 500 },
          { name: "Crate", gold: 2500 },
          { name: "Hoard", gold: 10000 },
        ].map((p) => {
          const Icon = SHOP_ICONS[p.name as keyof typeof SHOP_ICONS];
          return (
            <div
              key={p.name}
              className="rounded-2xl border border-raid-yellow/25 bg-black/30 p-3"
            >
              <HudIconBadge icon={Icon} color="#F5E642" />
              <div className="mt-2 text-sm font-semibold text-raid-yellow">{p.name}</div>
              <div className="text-[13px] tabular-nums">{p.gold.toLocaleString()} gold</div>
            </div>
          );
        })}
      </div>
    </Shell>
  );
}
