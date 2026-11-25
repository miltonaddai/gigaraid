import { useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  ClampToEdgeWrapping,
  DoubleSide,
  LinearFilter,
  PlaneGeometry,
  SRGBColorSpace,
  Vector3,
  type Mesh,
  type Texture,
} from "three";
import type { SpriteClip, SpriteSheet } from "@/game/assets/sprites";

function sheetMap(source: Texture, sheet: SpriteSheet) {
  const map = source.clone();
  map.colorSpace = SRGBColorSpace;
  map.wrapS = ClampToEdgeWrapping;
  map.wrapT = ClampToEdgeWrapping;
  map.magFilter = LinearFilter;
  map.minFilter = LinearFilter;
  map.generateMipmaps = false;
  map.repeat.set(1 / sheet.columns, 1 / sheet.rows);
  map.needsUpdate = true;
  return map;
}

export function SheetSprite({
  sheet,
  clip,
  animate = false,
  width,
  height,
  color = "#ffffff",
}: {
  sheet: SpriteSheet;
  clip: SpriteClip;
  animate?: boolean;
  width?: number;
  height?: number;
  color?: string;
}) {
  const source = useTexture(sheet.url);
  const map = useMemo(() => sheetMap(source, sheet), [source, sheet]);
  const mesh = useRef<Mesh>(null);
  const worldPos = useMemo(() => new Vector3(), []);
  const { camera } = useThree();
  const w = width ?? sheet.width;
  const h = height ?? sheet.height;
  const ground = sheet.ground ?? 0;
  const padBottom = sheet.padBottom ?? 0;
  const push = (sheet.isoPush ?? 0) / Math.SQRT2;
  const shiftX = sheet.shiftX ?? 0;
  const shiftZ = sheet.shiftZ ?? 0;
  const mode = sheet.billboard ?? "full";
  const geometry = useMemo(() => {
    const geo = new PlaneGeometry(w, h);
    geo.translate(0, h / 2 - padBottom * h, 0);
    return geo;
  }, [w, h, padBottom]);

  useFrame(({ clock }) => {
    const node = mesh.current;
    if (node) {
      node.getWorldPosition(worldPos);
      if (mode === "iso") {
        node.lookAt(worldPos.x - 1, worldPos.y - 0.82, worldPos.z - 1);
      } else if (mode === "yaw") {
        node.lookAt(camera.position.x, worldPos.y, camera.position.z);
      } else {
        node.lookAt(camera.position);
      }
      if (sheet.isoYaw) node.rotateY(sheet.isoYaw);
    }
    const frames = animate ? clip.frames : 1;
    const fps = clip.fps ?? 8;
    const frame = frames > 1 ? Math.floor(clock.elapsedTime * fps) % frames : 0;
    map.offset.set(
      (clip.col + frame) / sheet.columns,
      1 - (clip.row + 1) / sheet.rows,
    );
  });

  return (
    <mesh ref={mesh} position={[push + shiftX, ground, push + shiftZ]} geometry={geometry}>
      <meshBasicMaterial
        map={map}
        color={color}
        transparent
        side={DoubleSide}
        toneMapped={false}
        depthWrite={false}
      />
    </mesh>
  );
}

export function SpriteShadow({ radius = 0.28 }: { radius?: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
      <circleGeometry args={[radius, 16]} />
      <meshBasicMaterial color="#000" transparent opacity={0.25} />
    </mesh>
  );
}
