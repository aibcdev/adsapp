import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function AdvertiserCtaBand() {
  return (
    <section className="relative overflow-hidden border-t border-zinc-900/50 bg-zinc-950 py-24">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />
      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <h2 className="font-instrument-serif text-4xl text-white md:text-5xl">Want to reach coders?</h2>
        <p className="mt-4 text-lg text-zinc-400">
          One line ad. Pay per view. Live auction on our advertiser page.
        </p>
        <Link
          to="/advertisers"
          className="mt-10 inline-flex items-center gap-2 rounded-full bg-white px-10 py-4 text-lg font-semibold text-black transition hover:bg-zinc-200"
        >
          Advertise with AIBC Media
          <ArrowRight size={20} />
        </Link>
      </div>
    </section>
  );
}
