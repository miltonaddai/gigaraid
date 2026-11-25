import { Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HudIconBadge, HudPanel } from "@/components/hud/HudPrimitives";
import { useGameStore } from "@/store/gameStore";

const STEPS = [
  {
    title: "Upgrade your village",
    body: "You start with one builder. Click the hall, cannon, vault, or camp to upgrade it. Hire extra builders in the Shop.",
  },
  {
    title: "Stake a Gold Mine",
    body: "Gold is the scarce resource in this world. Mines drip coin while you are online or away.",
  },
  {
    title: "Raise a Cannon",
    body: "Raids are automatic. Defenses shoot the nearest troop. Place them to cover storage.",
  },
  {
    title: "Train the warband",
    body: "You start with 5 minions. They stay in the Army Camp. Each camp holds 20. Archers unlock at Town Hall 2.",
  },
  {
    title: "Raid same-level halls",
    body: "Matchmaking only pairs equal Town Halls. Loot is a fixed cut — never a total wipe.",
  },
];

export function TutorialOverlay() {
  const step = useGameStore((s) => s.tutorialStep);
  const skipped = useGameStore((s) => s.tutorialSkipped);
  const nextTutorial = useGameStore((s) => s.nextTutorial);
  const skipTutorial = useGameStore((s) => s.skipTutorial);
  const setTab = useGameStore((s) => s.setTab);

  if (skipped) return null;
  const data = STEPS[step - 1] ?? STEPS[0];

  return (
    <>
      <button
        type="button"
        onClick={skipTutorial}
        className="hud-glass absolute top-4 right-20 z-30 rounded-full px-3.5 py-1.5 text-[12px] font-semibold text-white/70 hover:text-white"
      >
        Skip tutorial
      </button>
      <HudPanel className="absolute top-1/2 left-1/2 z-30 w-[min(420px,90vw)] -translate-x-1/2 -translate-y-[60%] px-6 py-5">
        <div className="flex items-center gap-2">
          <HudIconBadge icon={Lightbulb} color="#a3e635" size="sm" />
          <div className="text-[11px] font-semibold tracking-wider text-raid-lime uppercase">
            Step {step} of 5
          </div>
        </div>
        <h3 className="mt-2 text-xl font-semibold tracking-tight text-raid-yellow">{data.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-white/75">{data.body}</p>
        <div className="mt-5 flex items-center justify-between">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-5 rounded-full ${
                  i < step ? "bg-raid-lime" : "bg-white/20"
                }`}
              />
            ))}
          </div>
          <Button
            className="font-hud h-9 px-4 text-sm font-semibold"
            onClick={() => {
              if (step === 2) setTab("build");
              nextTutorial();
            }}
          >
            Next
          </Button>
        </div>
      </HudPanel>
    </>
  );
}
