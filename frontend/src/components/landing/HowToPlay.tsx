import { Hammer, Pickaxe, Shield, Swords } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";

const STEPS = [
  {
    n: "01",
    title: "Name your village",
    body: "Every claim starts with a Town Hall and five minions. The hall is the lock — raise it, and the roster opens.",
    Icon: Hammer,
    accent: "#f5e642",
  },
  {
    n: "02",
    title: "Mine the vein",
    body: "Gold is the scarce resource. Drop mines, fill vaults, and keep a cut ready. Elixir brews the warband.",
    Icon: Pickaxe,
    accent: "#f0c14b",
  },
  {
    n: "03",
    title: "Place the iron",
    body: "Cannons, towers, and land bows fire on their own. Cover storage. Leave no easy path to the hall.",
    Icon: Shield,
    accent: "#a3e635",
  },
  {
    n: "04",
    title: "Raid the same rank",
    body: "Matchmaking is Town Hall vs Town Hall. Troops march to the nearest building. You only ever lose a fixed cut.",
    Icon: Swords,
    accent: "#e88b3a",
  },
];

export function HowToPlay() {
  const head = useReveal<HTMLDivElement>();
  const grid = useReveal<HTMLDivElement>();

  return (
    <section
      id="how-to-play"
      className="relative flex min-h-[100svh] w-full flex-col justify-center overflow-hidden bg-[#0b0d11] px-6 py-16 md:px-16"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(163,230,53,0.08),transparent_40%),radial-gradient(circle_at_90%_80%,rgba(245,230,66,0.07),transparent_36%)]" />
      <div ref={head} className="reveal relative mx-auto w-full max-w-6xl">
        <p className="text-xl tracking-[0.35em] text-raid-lime">HOW TO PLAY</p>
        <h2 className="mt-2 max-w-4xl text-5xl leading-[0.95] text-white md:text-7xl">
          Four moves. Then the village fights for you.
        </h2>
      </div>
      <div
        ref={grid}
        className="waterfall relative mx-auto mt-10 grid w-full max-w-6xl gap-4 md:grid-cols-2"
      >
        {STEPS.map((step) => (
          <article
            key={step.n}
            className="group rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-4xl text-white/20">{step.n}</span>
              <span
                className="grid h-12 w-12 place-items-center rounded-2xl"
                style={{ background: step.accent }}
              >
                <step.Icon className="h-6 w-6 text-black" />
              </span>
            </div>
            <h3 className="mt-5 text-3xl text-raid-cream">{step.title}</h3>
            <p className="mt-3 max-w-md text-xl leading-snug text-white/65">{step.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
