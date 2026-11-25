import { Canvas } from "@react-three/fiber";
import { cameraInput } from "@/game/camera/VillageCamera";
import { VillageWorld } from "@/game/VillageWorld";
import { useGameStore } from "@/store/gameStore";

export function VillageCanvas() {
  const graphics = useGameStore((s) => s.settings.graphics);
  const dpr = graphics === "high" ? [1, 2] : graphics === "med" ? [1, 1.5] : [1, 1];

  return (
    <Canvas
      shadows={graphics !== "low"}
      dpr={dpr as [number, number]}
      orthographic
      camera={{ position: [36, 30, 36], zoom: 58, near: 0.1, far: 400 }}
      onPointerMissed={() => {
        if (cameraInput.didPan || cameraInput.didMoveAsset) return;
        useGameStore.getState().selectBuilding(null);
      }}
      style={{ position: "absolute", inset: 0, touchAction: "none" }}
    >
      <VillageWorld />
    </Canvas>
  );
}
