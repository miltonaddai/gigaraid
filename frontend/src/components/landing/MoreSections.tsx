import { Button } from "@/components/ui/button";
import { useReveal } from "@/hooks/useReveal";
import { Gamepad2 } from "lucide-react";

const PILLARS = [
  {
    title: "Automatic war",
    body: "You place. They hunt. Archers and wizards hold range. Giants eat the tower fire.",
  },
  {
    title: "Fair loot",
    body: "A raid never wipes the vault. Twenty percent is the law of this dirt.",
  },
  {
    title: "Shop",
    body: "Gold packs to speed up your village. Coming soon.",
  },
];

export function TheLoop() {
  const head = useReveal<HTMLDivElement>();
  const list = useReveal<HTMLDivElement>();

  return (
    <section
      id="the-loop"
      className="relative flex min-h-screen w-full flex-col justify-center bg-[#11141a] px-6 py-24 md:px-16"
    >
      <div ref={head} className="reveal mx-auto w-full max-w-6xl">
        <p className="text-xl tracking-[0.35em] text-raid-orange">THE LOOP</p>
        <h2 className="mt-3 max-w-4xl text-5xl leading-[0.95] md:text-8xl">
          Built like the bases you already know.
        </h2>
      </div>
      <div
        ref={list}
        className="waterfall mx-auto mt-16 flex w-full max-w-6xl flex-col gap-0 border-t border-white/10"
      >
        {PILLARS.map((item, i) => (
          <div
            key={item.title}
            className="grid gap-4 border-b border-white/10 py-10 md:grid-cols-[120px_1fr_1.4fr] md:items-end"
          >
            <span className="text-3xl text-white/25">0{i + 1}</span>
            <h3 className="text-4xl text-raid-cream">{item.title}</h3>
            <p className="text-2xl leading-snug text-white/60">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function FinalCta({ onPlay }: { onPlay: () => void }) {
  const box = useReveal<HTMLDivElement>();

  return (
    <section
      id="play"
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#07080b] px-6"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(245,230,66,0.12),transparent_50%)]" />
      <div ref={box} className="reveal relative mx-auto w-full max-w-4xl text-center">
        <p className="text-xl tracking-[0.35em] text-raid-yellow">YOUR MOVE</p>
        <h2 className="mt-4 text-6xl leading-[0.92] md:text-9xl">
          Raise the hall.
          <br />
          Guard the vein.
        </h2>
        <Button className="mt-12" size="lg" onClick={onPlay}>
          Play <Gamepad2 className="h-5 w-5" />
        </Button>
      </div>
    </section>
  );
}
