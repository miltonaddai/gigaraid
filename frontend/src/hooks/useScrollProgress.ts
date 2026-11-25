import { useEffect, useRef, useState } from "react";
import { clamp } from "@/lib/utils";

export function useScrollProgress() {
  const ref = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const travel = el.offsetHeight - window.innerHeight;
      if (travel <= 0) {
        setProgress(0);
        return;
      }
      setProgress(clamp(-rect.top / travel, 0, 1));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return { ref, progress };
}
