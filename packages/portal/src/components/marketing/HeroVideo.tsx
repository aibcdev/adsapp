import { DEVELOPER_SHARE_PCT } from "@aibc/shared";
import { Link } from "react-router-dom";
import { ArrowDownRight } from "lucide-react";

export function HeroVideo() {
  return (
    <header className="relative h-screen w-full overflow-hidden bg-black">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full scale-105 object-cover opacity-50"
      >
        <source src="https://spark-labs.org/video/reel.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

      <div className="absolute bottom-0 left-0 flex w-full flex-col items-end justify-between px-6 py-12 md:flex-row md:px-12 md:py-20">
        <div className="fade-in-up max-w-[95rem] w-full">
          <p className="mb-6 font-mono text-xs uppercase tracking-widest text-emerald-500">For coders</p>
          <h1 className="mb-12 font-instrument-serif text-6xl leading-[0.9] tracking-tighter text-white md:text-8xl lg:text-9xl">
            Make Money Whilst You Code
            <br />
            <span className="text-zinc-500">Keep {DEVELOPER_SHARE_PCT}%. One line only.</span>
          </h1>

          <div className="flex w-full flex-col gap-12 text-lg font-light text-zinc-300 xl:flex-row xl:items-end">
            <p className="max-w-2xl text-lg leading-relaxed text-zinc-400 md:text-xl lg:text-2xl">
              Install free. One small ad line in your spinner while AI loads. No popups. We never read your code.
            </p>

            <div className="flex shrink-0 flex-col gap-6 pb-3 xl:ml-32">
              <a
                href="#install"
                className="w-fit rounded-full bg-white px-14 py-6 text-xl font-bold uppercase tracking-wider text-black shadow-[0_0_60px_rgba(255,255,255,0.2)] transition duration-300 hover:scale-105 hover:bg-zinc-200 hover:shadow-[0_0_80px_rgba(255,255,255,0.4)]"
              >
                Install free
              </a>
              <Link
                to="/advertisers"
                className="group ml-4 flex w-fit items-center gap-3 border-b border-white/30 pb-1 text-lg text-white transition-all duration-300 hover:ml-6 hover:border-white"
              >
                <span>For advertisers</span>
                <ArrowDownRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
