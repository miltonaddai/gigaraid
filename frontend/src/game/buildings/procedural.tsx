import { useMemo, type ComponentType } from "react";
import type { BuildingId } from "@/types/game";

const wood = "#8a5a32";
const darkWood = "#5c3a1e";
const stone = "#8d8f93";
const darkStone = "#5c6168";
const roof = "#2b4c7e";
const gold = "#f0c14b";
const elixir = "#8b3dff";
const canvas = "#d8c39a";
const iron = "#3a3d42";

function Box({
  args,
  position,
  color,
  rotation,
}: {
  args: [number, number, number];
  position?: [number, number, number];
  color: string;
  rotation?: [number, number, number];
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshToonMaterial color={color} />
    </mesh>
  );
}

function Cyl({
  args,
  position,
  color,
  rotation,
}: {
  args: [number, number, number, number?];
  position?: [number, number, number];
  color: string;
  rotation?: [number, number, number];
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <cylinderGeometry args={args} />
      <meshToonMaterial color={color} />
    </mesh>
  );
}

export function TownHallMesh() {
  return (
    <group>
      <Box args={[2.4, 0.28, 2.4]} position={[0, 0.14, 0]} color={darkStone} />
      <Box args={[2.1, 1.3, 2.1]} position={[0, 0.9, 0]} color="#c8b48a" />
      <Box args={[0.16, 1.3, 2.12]} position={[-0.7, 0.9, 0]} color={wood} />
      <Box args={[0.16, 1.3, 2.12]} position={[0.7, 0.9, 0]} color={wood} />
      <Box args={[0.55, 0.85, 0.12]} position={[0, 0.62, 1.06]} color={darkWood} />
      <mesh position={[0, 1.85, 0]} castShadow>
        <coneGeometry args={[1.7, 1.1, 4]} />
        <meshToonMaterial color={roof} />
      </mesh>
      <Box args={[0.7, 0.7, 0.7]} position={[0.7, 1.7, 0.55]} color="#c8b48a" />
      <mesh position={[0.7, 2.2, 0.55]} castShadow>
        <coneGeometry args={[0.55, 0.45, 4]} />
        <meshToonMaterial color={roof} />
      </mesh>
      <Box args={[0.06, 0.7, 0.06]} position={[0.95, 2.45, 0.55]} color="#d4d4d4" />
      <Box args={[0.28, 0.18, 0.02]} position={[1.08, 2.7, 0.55]} color="#c0392b" />
      <Box args={[0.7, 0.12, 0.35]} position={[0, 0.08, 1.35]} color={stone} />
    </group>
  );
}

export function CannonMesh() {
  return (
    <group>
      <Cyl args={[0.85, 0.85, 0.35, 10]} position={[0, 0.18, 0]} color={stone} />
      <Box args={[0.7, 0.35, 0.7]} position={[0, 0.42, 0]} color={darkWood} />
      <Cyl
        args={[0.16, 0.2, 1.15, 10]}
        position={[0.35, 0.62, 0]}
        rotation={[0, 0, Math.PI / 2]}
        color={iron}
      />
      <Cyl args={[0.12, 0.12, 0.5, 8]} position={[0, 0.35, 0]} color={darkWood} />
    </group>
  );
}

export function GoldMineMesh() {
  return (
    <group>
      <Box args={[1.6, 0.2, 1.6]} position={[0, 0.1, 0]} color="#6b4b2a" />
      <Box args={[0.12, 1.2, 0.12]} position={[-0.65, 0.7, -0.65]} color={wood} />
      <Box args={[0.12, 1.2, 0.12]} position={[0.65, 0.7, -0.65]} color={wood} />
      <Box args={[0.12, 1.2, 0.12]} position={[-0.65, 0.7, 0.65]} color={wood} />
      <Box args={[0.12, 1.2, 0.12]} position={[0.65, 0.7, 0.65]} color={wood} />
      <Box args={[1.6, 0.08, 1.6]} position={[0, 1.3, 0]} color={darkWood} />
      <mesh position={[0, 0.45, 0]} castShadow>
        <sphereGeometry args={[0.55, 10, 8]} />
        <meshToonMaterial color={gold} />
      </mesh>
      <mesh position={[0.25, 0.7, 0.1]} castShadow>
        <sphereGeometry args={[0.28, 8, 8]} />
        <meshToonMaterial color="#ffe27a" />
      </mesh>
    </group>
  );
}

export function StorageMesh({ fill = gold }: { fill?: string }) {
  return (
    <group>
      <Cyl args={[0.7, 0.78, 1.15, 12]} position={[0, 0.6, 0]} color={wood} />
      <Cyl args={[0.74, 0.74, 0.1, 12]} position={[0, 0.25, 0]} color={gold} />
      <Cyl args={[0.74, 0.74, 0.1, 12]} position={[0, 0.95, 0]} color={gold} />
      <mesh position={[0, 1.25, 0]} castShadow>
        <sphereGeometry args={[0.55, 10, 8]} />
        <meshToonMaterial color={fill} />
      </mesh>
    </group>
  );
}

export function ElixirStorageMesh() {
  return (
    <group>
      <Box args={[0.12, 1.3, 0.12]} position={[-0.55, 0.65, -0.55]} color={wood} />
      <Box args={[0.12, 1.3, 0.12]} position={[0.55, 0.65, -0.55]} color={wood} />
      <Box args={[0.12, 1.3, 0.12]} position={[-0.55, 0.65, 0.55]} color={wood} />
      <Box args={[0.12, 1.3, 0.12]} position={[0.55, 0.65, 0.55]} color={wood} />
      <mesh position={[0, 0.85, 0]} castShadow>
        <sphereGeometry args={[0.72, 16, 12]} />
        <meshToonMaterial color={elixir} />
      </mesh>
      <Box args={[1.3, 0.1, 1.3]} position={[0, 0.08, 0]} color={darkWood} />
    </group>
  );
}

export function BuilderHutMesh() {
  return (
    <group>
      <Box args={[1.45, 0.82, 1.3]} position={[0, 0.46, 0]} color="#c4a06a" />
      <mesh position={[0, 1.12, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[1.15, 0.72, 4]} />
        <meshToonMaterial color="#e07a2f" />
      </mesh>
      <Box args={[0.3, 0.48, 0.08]} position={[0, 0.34, 0.66]} color={darkWood} />
      <Box args={[0.16, 0.32, 0.16]} position={[0.32, 1.4, -0.12]} color="#6b3f1d" />
    </group>
  );
}

export function ArmyCampMesh() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[1.15, 24]} />
        <meshToonMaterial color="#4db83a" />
      </mesh>
      <mesh position={[-0.45, 0.7, 0.1]} castShadow>
        <coneGeometry args={[0.7, 1.2, 5]} />
        <meshToonMaterial color={canvas} />
      </mesh>
      <mesh position={[0.55, 0.55, -0.2]} castShadow>
        <coneGeometry args={[0.55, 0.95, 5]} />
        <meshToonMaterial color="#c4a574" />
      </mesh>
      <Box args={[0.06, 0.7, 0.06]} position={[-0.45, 0.35, 0.1]} color={darkWood} />
    </group>
  );
}

export function LandBowMesh() {
  return (
    <group>
      <Box args={[1.2, 0.2, 1.2]} position={[0, 0.12, 0]} color={stone} />
      <Box args={[0.15, 1.1, 0.15]} position={[-0.4, 0.7, 0]} color={wood} />
      <Box args={[0.15, 1.1, 0.15]} position={[0.4, 0.7, 0]} color={wood} />
      <Box args={[1.1, 0.12, 0.12]} position={[0, 1.25, 0]} color={darkWood} />
      <mesh position={[0, 1.15, 0.15]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.45, 0.05, 8, 14, Math.PI]} />
        <meshToonMaterial color="#2d2116" />
      </mesh>
    </group>
  );
}

const MESH: Record<BuildingId, ComponentType> = {
  townhall: TownHallMesh,
  cannon: CannonMesh,
  gold_mine: GoldMineMesh,
  storage: StorageMesh,
  elixir_storage: ElixirStorageMesh,
  builder_hut: BuilderHutMesh,
  army_camp: ArmyCampMesh,
  land_bow: LandBowMesh,
};

export function ProceduralBuilding({ type }: { type: BuildingId }) {
  const Mesh = useMemo(() => MESH[type], [type]);
  return <Mesh />;
}
