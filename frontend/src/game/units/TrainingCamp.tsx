import { TILE_SIZE } from "@/data/catalog";

export const CAMP_FOOTPRINT = 3;
export const CAMP_RADIUS = (CAMP_FOOTPRINT * TILE_SIZE) / 2 + 0.15;
export const CAMP_WALK_RADIUS = CAMP_RADIUS * 0.68;

const STAKES = 12;

export function TrainingCamp() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.028, 0]} receiveShadow>
        <circleGeometry args={[CAMP_RADIUS + 0.28, 40]} />
        <meshLambertMaterial color="#5a3a1c" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]} receiveShadow>
        <circleGeometry args={[CAMP_RADIUS + 0.12, 40]} />
        <meshLambertMaterial color="#8a6230" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.055, 0]} receiveShadow>
        <circleGeometry args={[CAMP_RADIUS, 40]} />
        <meshLambertMaterial color="#3dce3a" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]} receiveShadow>
        <ringGeometry args={[CAMP_RADIUS * 0.42, CAMP_RADIUS * 0.78, 32]} />
        <meshLambertMaterial color="#52dc48" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.062, 0]} receiveShadow>
        <circleGeometry args={[CAMP_RADIUS * 0.36, 24]} />
        <meshLambertMaterial color="#6ae852" />
      </mesh>
      {Array.from({ length: STAKES }, (_, i) => {
        const a = (i / STAKES) * Math.PI * 2 + 0.12;
        const r = CAMP_RADIUS + 0.08;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * r, 0.26, Math.sin(a) * r]}
            castShadow
          >
            <cylinderGeometry args={[0.05, 0.06, 0.44, 5]} />
            <meshToonMaterial color="#4a2f16" />
          </mesh>
        );
      })}
      <group position={[-1.45, 0, -1.25]}>
        <mesh position={[0, 0.82, 0]} castShadow>
          <coneGeometry args={[0.7, 1.28, 5]} />
          <meshToonMaterial color="#e6d2a8" />
        </mesh>
        <mesh position={[0.08, 0.02, 0.02]}>
          <cylinderGeometry args={[0.055, 0.055, 0.6, 6]} />
          <meshToonMaterial color="#4a2f16" />
        </mesh>
        <mesh position={[0.78, 0.58, 0.18]} castShadow>
          <coneGeometry args={[0.46, 0.9, 5]} />
          <meshToonMaterial color="#c4a574" />
        </mesh>
        <mesh position={[-0.18, 1.58, -0.06]}>
          <cylinderGeometry args={[0.028, 0.028, 0.6, 6]} />
          <meshToonMaterial color="#d4d4d4" />
        </mesh>
        <mesh position={[0.02, 1.76, -0.06]}>
          <boxGeometry args={[0.26, 0.16, 0.02]} />
          <meshToonMaterial color="#c0392b" />
        </mesh>
      </group>
      <mesh position={[0.2, 0.42, 0.08]} castShadow>
        <cylinderGeometry args={[0.075, 0.1, 0.78, 6]} />
        <meshToonMaterial color="#8a5a32" />
      </mesh>
      <mesh position={[0.2, 0.86, 0.08]} rotation={[0, 0.4, 0.18]} castShadow>
        <boxGeometry args={[0.32, 0.46, 0.08]} />
        <meshToonMaterial color="#d4b44a" />
      </mesh>
    </group>
  );
}
