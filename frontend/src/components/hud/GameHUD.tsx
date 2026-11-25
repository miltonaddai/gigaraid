import { Settings } from "lucide-react";
import { BottomDock } from "@/components/hud/BottomDock";
import { Minimap } from "@/components/hud/Minimap";
import { PlayerCard } from "@/components/hud/PlayerCard";
import { QuestPanel } from "@/components/hud/QuestPanel";
import { ResourceBar } from "@/components/hud/ResourceBar";
import { SelectedBuildingPanel } from "@/components/hud/SelectedBuildingPanel";
import { ShieldBadge } from "@/components/hud/ShieldBadge";
import { BuildMenu } from "@/components/panels/BuildMenu";
import { SidePanels } from "@/components/panels/SidePanels";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { TutorialOverlay } from "@/components/tutorial/TutorialOverlay";
import { useGameStore } from "@/store/gameStore";

export function GameHUD() {
  const village = useGameStore((s) => s.village);
  const tab = useGameStore((s) => s.activeTab);
  const selectedId = useGameStore((s) => s.selectedBuildingId);
  const openSettings = useGameStore((s) => s.openSettings);
  if (!village) return null;
  const selected = village.buildings.find((b) => b.instanceId === selectedId);

  return (
    <div className="font-hud pointer-events-none absolute inset-0 z-10 antialiased">
      <div className="pointer-events-auto absolute top-4 left-4 flex flex-col items-start gap-2">
        <ResourceBar resources={village.resources} village={village} />
        <PlayerCard village={village} />
        <ShieldBadge endsAt={village.shieldEndsAt} />
      </div>

      <div className="pointer-events-auto absolute top-4 right-4 flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={() => openSettings(true)}
          aria-label="Open settings"
          className="hud-glass flex h-11 w-11 items-center justify-center !rounded-full text-white/80 transition hover:text-white"
        >
          <Settings className="h-5 w-5" strokeWidth={2} />
        </button>
        <QuestPanel quests={village.quests} />
      </div>

      <div className="pointer-events-auto absolute bottom-4 left-1/2 -translate-x-1/2">
        <BottomDock townhallLevel={village.townhallLevel} />
      </div>

      <div className="pointer-events-auto absolute right-4 bottom-4 flex flex-col items-end gap-2">
        {selected && <SelectedBuildingPanel building={selected} village={village} />}
        <Minimap buildings={village.buildings} />
      </div>

      <div className="pointer-events-auto">
        {tab === "build" && <BuildMenu />}
        <SidePanels />
        <TutorialOverlay />
        <SettingsModal />
      </div>
    </div>
  );
}
