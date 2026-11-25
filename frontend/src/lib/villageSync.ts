import { api } from "@/lib/api";
import { useGameStore } from "@/store/gameStore";
import type { Village } from "@/types/game";

export async function persistVillage(village: Village) {
  try {
    await api.saveVillage(village);
  } catch {
    return;
  }
}

export async function hydrateVillageForPlayer(playerId: string) {
  let remote: Village | null = null;
  try {
    remote = (await api.getVillage(playerId)).village;
  } catch {
    remote = null;
  }

  const store = useGameStore.getState();
  const local = store.village;

  if (remote) {
    store.hydrateVillage(remote);
    store.markOnboarded(playerId);
    return remote;
  }

  if (local?.ownerWallet === playerId) {
    store.markOnboarded(playerId);
    void persistVillage(local);
    return local;
  }

  return null;
}
