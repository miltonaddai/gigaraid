import { useNavigate } from "react-router-dom";
import heroImage from "../../assets/bg-image.jpg";
import heroVideo from "../../assets/video-bg.mp4";
import { HowToPlay } from "@/components/landing/HowToPlay";
import { LandingNav } from "@/components/landing/LandingNav";
import { FinalCta, TheLoop } from "@/components/landing/MoreSections";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { WorldStory } from "@/components/landing/WorldStory";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth";
import { useGameStore } from "@/store/gameStore";
import { Gamepad2 } from "lucide-react";

export function LandingPage() {
  const { connected, playerId } = useAuth();
  const navigate = useNavigate();
  const hasOnboarded = useGameStore((s) => s.hasOnboarded);
  const village = useGameStore((s) => s.village);

  function goPlay() {
    const ready =
      connected && hasOnboarded(playerId) && village?.ownerWallet === playerId;
    navigate(ready ? "/play" : "/onboard");
  }

  return (
    <div id="top" className="relative bg-[#0c0e12] text-white">
      <LandingNav onPlayClick={goPlay} />

      <section className="relative flex min-h-[calc(100vh-56px)] w-full flex-col justify-center overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/30 to-transparent" />
        <div className="relative z-10 px-8 pb-16 md:px-16">
          <div className="max-w-xl space-y-1 text-5xl leading-none md:text-7xl">
            <div className="text-raid-mint">Build Your Village</div>
            <div className="text-raid-orange">Join a Clan</div>
            <div className="text-raid-cream">Accumulate Resources</div>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button className="w-48" size="lg" onClick={goPlay}>
              Play <Gamepad2 className="h-5 w-5" />
            </Button>
            <a
              href="#how-to-play"
              className="text-xl text-white/70 underline-offset-4 hover:text-white hover:underline"
            >
              How to play
            </a>
          </div>
        </div>
      </section>

      <HowToPlay />
      <WorldStory />
      <TheLoop />
      <FinalCta onPlay={goPlay} />
      <SiteFooter />
    </div>
  );
}
