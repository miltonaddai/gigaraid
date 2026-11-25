import vikingFace from "../../../assets/viking-face.svg";

export function SiteFooter() {
  return (
    <footer className="relative w-full border-t border-white/[0.06] bg-[#050608]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-raid-yellow/25 to-transparent" />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12 md:flex-row md:items-end md:justify-between md:px-8">
        <div>
          <div className="flex items-center gap-2 text-xl leading-none text-white/80">
            <img src={vikingFace} alt="" className="block h-5 w-5 opacity-70" />
            <span>GigaRaid</span>
          </div>
          <p className="mt-3 max-w-sm text-lg leading-snug text-white/35">
            Survive. Expand. Hoard. A village builder.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-lg text-white/40">
          <a href="#how-to-play" className="hover:text-white/80">
            How to play
          </a>
          <a href="#the-loop" className="hover:text-white/80">
            The loop
          </a>
          <a href="#play" className="hover:text-white/80">
            Play
          </a>
        </nav>
      </div>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 border-t border-white/[0.05] px-6 py-5 text-base text-white/25 md:flex-row md:items-center md:justify-between md:px-8">
        <span>© {new Date().getFullYear()} GigaRaid</span>
      </div>
    </footer>
  );
}
