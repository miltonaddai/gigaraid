import { useEffect, useState } from "react";
import vikingFace from "../../../assets/viking-face.svg";
import { PlayerNav } from "@/components/player/PlayerNav";
import { clamp } from "@/lib/utils";

const RANGE = 280;

function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

export function LandingNav({ onPlayClick }: { onPlayClick: () => void }) {
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      const raw = clamp(window.scrollY / RANGE, 0, 1);
      setAmount(easeInOut(raw));
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const inset = 14 * amount;
  const width = `min(100%, ${Math.round(window.innerWidth - inset * 2 - amount * (window.innerWidth - 944))}px)`;

  return (
    <div
      className="sticky top-0 z-30 flex justify-center"
      style={{
        paddingTop: inset,
        paddingLeft: inset,
        paddingRight: inset,
      }}
    >
      <header
        className="grid h-14 w-full grid-cols-[1fr_auto_1fr] items-center backdrop-blur-xl"
        style={{
          width,
          maxWidth: 920 + (1 - amount) * 4000,
          borderRadius: 28 * amount,
          border: `1px solid rgba(255,255,255,${0.15 * amount})`,
          background: `rgba(8,10,14,${0.52 + amount * 0.22})`,
          paddingLeft: 24 - amount * 4,
          paddingRight: 24 - amount * 4,
          boxShadow: `0 ${12 * amount}px ${48 * amount}px rgba(0,0,0,${0.4 * amount})`,
        }}
      >
        <nav className="hidden items-center gap-5 text-lg text-white/70 md:flex">
          <a href="#how-to-play" className="hover:text-white">
            How to play
          </a>
          <a href="#the-loop" className="hover:text-white">
            The loop
          </a>
        </nav>
        <a
          href="#top"
          className="flex translate-y-[3px] items-center gap-2 text-[1.75rem] leading-none"
        >
          <img src={vikingFace} alt="" className="block h-7 w-7 shrink-0" />
          <span className="leading-none">GigaRaid</span>
        </a>
        <div className="flex h-full items-center justify-end">
          <PlayerNav onSignInClick={onPlayClick} />
        </div>
      </header>
    </div>
  );
}
