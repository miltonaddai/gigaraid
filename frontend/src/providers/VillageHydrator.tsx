import { useEffect, useRef } from "react";
import { hydrateVillageForPlayer } from "@/lib/villageSync";
import { useAuth } from "@/providers/auth";

export function VillageHydrator() {
  const { connected, playerId } = useAuth();
  const last = useRef("");

  useEffect(() => {
    if (!connected || !playerId) return;
    if (last.current === playerId) return;
    last.current = playerId;
    void hydrateVillageForPlayer(playerId);
  }, [connected, playerId]);

  return null;
}
