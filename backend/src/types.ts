export interface Resources {
  gold: number;
  elixir: number;
  ore: number;
}

export interface VillagePayload {
  id: string;
  name: string;
  ownerWallet: string;
  townhallLevel: number;
  xp: number;
  xpToNext: number;
  resources: Resources;
  buildings: unknown[];
  troops: unknown[];
  quests: unknown[];
  shieldEndsAt: number;
  createdAt: number;
}
