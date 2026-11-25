import { useGLTF } from "@react-three/drei";
import { Suspense, type ReactNode } from "react";

function LoadedModel({ url, scale = 1 }: { url: string; scale?: number }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene.clone()} scale={scale} />;
}

export function ModelOrFallback({
  url,
  scale,
  children,
}: {
  url?: string;
  scale?: number;
  children: ReactNode;
}) {
  if (!url) return <>{children}</>;
  return (
    <Suspense fallback={<>{children}</>}>
      <LoadedModel url={url} scale={scale} />
    </Suspense>
  );
}
