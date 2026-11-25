import type { Village } from "@/types/game";

const BASE = import.meta.env.VITE_API_URL ?? "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  health: () => request<{ ok: boolean }>("/api/health"),
  getVillage: (playerId: string) =>
    request<{ village: Village | null }>(`/api/village/${encodeURIComponent(playerId)}`),
  saveVillage: (village: Village) =>
    request<{ village: Village }>("/api/village", {
      method: "POST",
      body: JSON.stringify(village),
    }),
};
