import { useState } from "react";
import { useNavigate } from "react-router-dom";
import heroImage from "../../assets/bg-image.jpg";
import heroVideo from "../../assets/video-bg.mp4";
import vikingFace from "../../assets/viking-face.svg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlayerNav } from "@/components/player/PlayerNav";
import { hydrateVillageForPlayer } from "@/lib/villageSync";
import { USERNAME_MAX, normalizeUsername, useAuth } from "@/providers/auth";
import { useGameStore } from "@/store/gameStore";

const LORE = [
  {
    kicker: "STEP 1 OF 3",
    title: "Survive. Expand. Hoard.",
    body: "Every village starts with a Town Hall and five minions. Gold is the scarce vein in this world. Mines pull it. Vaults hold it. Raiders come for a cut — never the whole hoard.",
  },
  {
    kicker: "STEP 3 OF 3",
    title: "Place, then let them fight",
    body: "Attacks and defenses run on their own. Troops march to the nearest building. Towers and wizards hold range. Matchmaking is Town Hall vs Town Hall. Upgrade the hall to unlock Army, Clan, and Raid.",
  },
];

export function OnboardingPage() {
  const { username: savedUsername, signIn } = useAuth();
  const navigate = useNavigate();
  const village = useGameStore((s) => s.village);
  const setVillageName = useGameStore((s) => s.setVillageName);
  const markOnboarded = useGameStore((s) => s.markOnboarded);
  const [step, setStep] = useState(0);
  const [name, setName] = useState(village?.name ?? "Ravenholm");
  const [username, setUsername] = useState(savedUsername);
  const [busy, setBusy] = useState(false);
  const usernameReady = normalizeUsername(username).length > 0;

  async function finish() {
    if (busy || !usernameReady) return;
    setBusy(true);
    const playerId = signIn(username);
    const existing = await hydrateVillageForPlayer(playerId);
    if (!existing) setVillageName(name, playerId);
    markOnboarded(playerId);
    navigate("/play", { replace: true });
  }

  const lore = step === 0 ? LORE[0] : LORE[1];

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster={heroImage}
      >
        <source src={heroVideo} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/55" />

      <header className="relative z-20 grid h-14 grid-cols-[1fr_auto_1fr] items-center bg-black/45 px-6 backdrop-blur-sm">
        <div />
        <div className="flex translate-y-[3px] items-center gap-2 text-[1.75rem] leading-none">
          <img src={vikingFace} alt="" className="block h-7 w-7 shrink-0" />
          <span className="leading-none">GigaRaid</span>
        </div>
        <div className="flex h-full items-center justify-end">
          <PlayerNav />
        </div>
      </header>

      <main className="relative z-10 flex min-h-[calc(100vh-56px)] items-center justify-center p-6">
        <div className="panel w-full max-w-lg px-8 py-8">
          {step === 1 ? (
            <>
              <div className="text-raid-lime">STEP 2 OF 3</div>
              <h1 className="mt-2 text-4xl text-raid-yellow">Who&apos;s raiding?</h1>
              <p className="mt-3 text-xl text-white/75">
                Pick a username and name your village.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (usernameReady) setStep(2);
                }}
              >
                <label className="mt-6 block text-lg text-white/60" htmlFor="username">
                  Username
                </label>
                <Input
                  id="username"
                  className="mt-1 text-center"
                  maxLength={USERNAME_MAX}
                  autoFocus
                  autoComplete="off"
                  placeholder="Your name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <label className="mt-4 block text-lg text-white/60" htmlFor="village-name">
                  Village name
                </label>
                <Input
                  id="village-name"
                  className="mt-1 text-center"
                  maxLength={18}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Button
                  type="submit"
                  className="mt-5 w-full"
                  size="lg"
                  disabled={!usernameReady}
                >
                  Continue
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="text-raid-lime">{lore.kicker}</div>
              <h1 className="mt-2 text-4xl text-raid-yellow">{lore.title}</h1>
              <p className="mt-4 text-xl leading-snug text-white/80">{lore.body}</p>
              <Button
                className="mt-8 w-full"
                size="lg"
                disabled={busy}
                onClick={() => {
                  if (step === 0) setStep(1);
                  else void finish();
                }}
              >
                {step === 0 ? "Continue" : busy ? "Entering..." : "Enter village"}
              </Button>
            </>
          )}
          <div className="mt-5 flex justify-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`h-2.5 w-2.5 rounded-full ${
                  i <= step ? "bg-raid-lime" : "bg-white/25"
                }`}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
