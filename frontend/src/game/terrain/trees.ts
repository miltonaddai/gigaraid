import { GRID_SIZE, LAND_PAD, LAND_SIZE, LAND_TILES, TILE_SIZE } from "@/data/catalog";

function hash(x: number, z: number) {
  const n = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

export function treePositions() {
  const spots: { x: number; z: number }[] = [];
  const origin = -LAND_SIZE / 2;
  for (let lx = 0; lx < LAND_TILES; lx += 1) {
    for (let lz = 0; lz < LAND_TILES; lz += 1) {
      const gx = lx - LAND_PAD;
      const gz = lz - LAND_PAD;
      const outside =
        gx < -1 || gz < -1 || gx >= GRID_SIZE + 1 || gz >= GRID_SIZE + 1;
      if (!outside) continue;
      if (hash(lx, lz) < 0.91) continue;
      spots.push({
        x: origin + lx * TILE_SIZE + TILE_SIZE / 2,
        z: origin + lz * TILE_SIZE + TILE_SIZE / 2,
      });
    }
  }
  return spots;
}
