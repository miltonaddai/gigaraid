import { useEffect, useRef } from "react";

export function useReveal<T extends HTMLElement = HTMLDivElement>(
  threshold = 0.16,
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          el.classList.add("is-in");
          io.unobserve(el);
        }
      },
      { threshold, rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return ref;
}
