import type { VillagePayload } from "../types.js";

const villages = new Map<string, VillagePayload>();

export async function loadVillage(wallet: string) {
  return [...villages.values()].find((v) => v.ownerWallet === wallet) ?? null;
}

export async function upsertVillage(village: VillagePayload) {
  villages.set(village.id, village);
  return village;
}
