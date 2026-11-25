import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { CanvasTexture, DoubleSide, SRGBColorSpace, type Mesh } from "three";
import { formatUpgradeClock } from "@/lib/utils";

export function UpgradeTimer({
  endsAt,
  height = 2.8,
}: {
  endsAt: number;
  height?: number;
}) {
  const mesh = useRef<Mesh>(null);
  const lastLabel = useRef("");
  const { camera } = useThree();
  const { canvas, texture } = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 72;
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    return { canvas, texture };
  }, []);

  useEffect(() => () => texture.dispose(), [texture]);

  useFrame(() => {
    const node = mesh.current;
    if (node) node.lookAt(camera.position);
    const label = formatUpgradeClock(endsAt - Date.now());
    if (label === lastLabel.current) return;
    lastLabel.current = label;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(10, 12, 16, 0.78)";
    ctx.beginPath();
    ctx.roundRect(8, 10, 240, 52, 18);
    ctx.fill();
    ctx.strokeStyle = "rgba(245, 230, 66, 0.7)";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "#f5e642";
    ctx.font = "700 34px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, 128, 38);
    texture.needsUpdate = true;
  });

  const push = 0.28;
  return (
    <mesh ref={mesh} position={[push, height, push]}>
      <planeGeometry args={[1.7, 0.48]} />
      <meshBasicMaterial
        map={texture}
        transparent
        depthWrite={false}
        side={DoubleSide}
      />
    </mesh>
  );
}
