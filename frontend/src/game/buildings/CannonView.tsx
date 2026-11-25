import { Suspense, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { CANNON_SPRITE, minionFacing } from "@/game/assets/sprites";
import { damageAgent, nearestHostile } from "@/game/units/unitCollision";
import { SheetSprite } from "@/game/units/SheetSprite";

const TARGET_SCAN_INTERVAL = 0.45;
const IDLE_SWEEP_INTERVAL = 3.5;
const SWEEP_FRAME_INTERVAL = 0.12;
const FIRE_INTERVAL = 0.9;

export function CannonView({
  x,
  z,
  range,
  dps,
}: {
  x: number;
  z: number;
  range: number;
  dps: number;
}) {
  const [facing, setFacing] = useState(CANNON_SPRITE.idle.col);
  const state = useRef({
    facing: CANNON_SPRITE.idle.col,
    nextScan: 0,
    nextSweep: IDLE_SWEEP_INTERVAL,
    nextSweepFrame: 0,
    sweepFramesLeft: 0,
    nextFire: 0,
  });

  useFrame(({ clock }) => {
    const now = clock.elapsedTime;
    const scan = state.current;

    if (now >= scan.nextScan) {
      scan.nextScan = now + TARGET_SCAN_INTERVAL;
      const target = nearestHostile(x, z, "friend", range);
      if (target) {
        scan.sweepFramesLeft = 0;
        scan.nextSweep = now + IDLE_SWEEP_INTERVAL;
        const nextFacing = minionFacing(target.agent.x - x, target.agent.z - z);
        if (scan.facing !== nextFacing) {
          scan.facing = nextFacing;
          setFacing(nextFacing);
        }
        if (now >= scan.nextFire) {
          damageAgent(target.id, dps * FIRE_INTERVAL);
          scan.nextFire = now + FIRE_INTERVAL;
        }
      } else if (scan.sweepFramesLeft === 0 && now >= scan.nextSweep) {
        scan.sweepFramesLeft = CANNON_SPRITE.columns;
        scan.nextSweepFrame = now;
      }
    }

    if (scan.sweepFramesLeft > 0 && now >= scan.nextSweepFrame) {
      scan.facing = (scan.facing + 1) % CANNON_SPRITE.columns;
      scan.sweepFramesLeft -= 1;
      scan.nextSweepFrame = now + SWEEP_FRAME_INTERVAL;
      setFacing(scan.facing);
      if (scan.sweepFramesLeft === 0) {
        scan.nextSweep = now + IDLE_SWEEP_INTERVAL;
      }
    }
  });

  return (
    <Suspense fallback={null}>
      <SheetSprite
        sheet={CANNON_SPRITE}
        clip={{ row: CANNON_SPRITE.idle.row, col: facing, frames: 1 }}
      />
    </Suspense>
  );
}
