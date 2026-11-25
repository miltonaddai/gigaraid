import { Router } from "express";
import { z } from "zod";
import { loadVillage, upsertVillage } from "../services/store.js";

export const villageRouter = Router();

villageRouter.get("/:wallet", async (req, res) => {
  try {
    const village = await loadVillage(req.params.wallet);
    res.json({ village });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

const villageSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(24),
  ownerWallet: z.string().min(3),
  townhallLevel: z.number().int().min(1).max(10),
  xp: z.number(),
  xpToNext: z.number(),
  resources: z.object({
    gold: z.number(),
    elixir: z.number(),
    ore: z.number(),
  }),
  buildings: z.array(z.unknown()),
  troops: z.array(z.unknown()),
  quests: z.array(z.unknown()),
  shieldEndsAt: z.number(),
  createdAt: z.number(),
});

villageRouter.post("/", async (req, res) => {
  const parsed = villageSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  try {
    const village = await upsertVillage(parsed.data);
    res.json({ village });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});
