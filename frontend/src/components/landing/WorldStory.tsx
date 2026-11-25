import { useScrollProgress } from "@/hooks/useScrollProgress";

const BEATS = [
  {
    kicker: "THE VEIN",
    title: "Gold is the scarce vein.",
    body: "Mines drip while you sleep. Vaults hold the hoard. Attackers can skim a fifth — never the whole pile.",
    wash: "from-[#1a1408] via-[#0c0e12] to-[#0c0e12]",
    glow: "rgba(240,193,75,0.16)",
  },
  {
    kicker: "THE HALL",
    title: "Town Hall is the only rank that matters.",
    body: "Level 1 to 10. Each step unlocks troops, towers, clans, and raids. Same hall. Same fight.",
    wash: "from-[#10180c] via-[#0c0e12] to-[#0c0e12]",
    glow: "rgba(163,230,53,0.14)",
  },
  {
    kicker: "THE CLAN",
    title: "Villages band. Then they march.",
    body: "Form a clan when the hall is ready. Coordinate raids. Keep the vein in the family.",
    wash: "from-[#0c1420] via-[#0c0e12] to-[#0c0e12]",
    glow: "rgba(96,165,250,0.14)",
  },
];

export function WorldStory() {
  const { ref, progress } = useScrollProgress();
  const index = Math.min(BEATS.length - 1, Math.floor(progress * BEATS.length + 0.001));
  const local = progress * BEATS.length - index;

  return (
    <section ref={ref} className="relative h-[320vh] w-full">
      <div className="sticky top-14 flex h-[calc(100vh-56px)] w-full items-center overflow-hidden">
        {BEATS.map((beat, i) => {
          const active = i === index;
          const passed = i < index;
          const opacity = passed ? 0 : active ? 1 : 0;
          const y = passed ? -40 : active ? (1 - local) * 24 : 50;
          return (
            <div
              key={beat.kicker}
              className={`absolute inset-0 flex items-center bg-gradient-to-br ${beat.wash} px-6 md:px-16`}
              style={{
                opacity,
                transform: `translate3d(0, ${y}px, 0) scale(${active ? 1 : 0.985})`,
                transition: "opacity 500ms cubic-bezier(0.22,1,0.36,1), transform 700ms cubic-bezier(0.22,1,0.36,1)",
              }}
            >
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: `radial-gradient(circle at 70% 40%, ${beat.glow}, transparent 42%)`,
                }}
              />
              <div className="relative mx-auto w-full max-w-6xl">
                <p className="text-xl tracking-[0.4em] text-raid-yellow">{beat.kicker}</p>
                <h2 className="mt-4 max-w-5xl text-5xl leading-[0.95] md:text-8xl">
                  {beat.title}
                </h2>
                <p className="mt-8 max-w-2xl text-2xl leading-snug text-white/70">
                  {beat.body}
                </p>
              </div>
            </div>
          );
        })}
        <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 gap-2">
          {BEATS.map((beat, i) => (
            <span
              key={beat.kicker}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === index ? "w-10 bg-raid-yellow" : "w-3 bg-white/25"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
