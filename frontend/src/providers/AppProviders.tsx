import type { ReactNode } from "react";
import { PlayerAuthProvider } from "@/providers/auth";
import { VillageHydrator } from "@/providers/VillageHydrator";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <PlayerAuthProvider>
      <VillageHydrator />
      {children}
    </PlayerAuthProvider>
  );
}
