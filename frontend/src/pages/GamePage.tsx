import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { GameHUD } from "@/components/hud/GameHUD";
import { VillageCanvas } from "@/game/VillageCanvas";
import { useAuth } from "@/providers/auth";
import { useGameStore } from "@/store/gameStore";

export function GamePage() {
  const { connected, playerId } = useAuth();
  const village = useGameStore((s) => s.village);
  const hasOnboarded = useGameStore((s) => s.hasOnboarded);
  const tickProduction = useGameStore((s) => s.tickProduction);
  const completeUpgrades = useGameStore((s) => s.completeUpgrades);

  useEffect(() => {
    tickProduction();
    const id = window.setInterval(tickProduction, 4000);
    return () => window.clearInterval(id);
  }, [tickProduction]);

  useEffect(() => {
    completeUpgrades();
    const id = window.setInterval(completeUpgrades, 400);
    return () => window.clearInterval(id);
  }, [completeUpgrades]);

  if (!connected) return <Navigate to="/onboard" replace />;
  if (!hasOnboarded(playerId) || village?.ownerWallet !== playerId) {
    return <Navigate to="/onboard" replace />;
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <VillageCanvas />
      <GameHUD />
    </div>
  );
}
