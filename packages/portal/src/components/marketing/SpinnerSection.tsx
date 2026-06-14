import { SpinnerComparison } from "../landing/SpinnerComparison";
import { HeroInstallCta } from "../landing/InstallButtons";

export function SpinnerSection({ monthlyUsd }: { monthlyUsd: number }) {
  return (
    <section id="spinner" className="border-b border-zinc-900/50 bg-zinc-950 py-24 md:py-32">
      <div className="mx-auto max-w-4xl px-6 text-center md:px-12">
        <div className="mb-12">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            One line only
          </div>
          <h2 className="font-instrument-serif text-4xl tracking-tight text-white md:text-5xl">
            Same spot as the spinner
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-zinc-400">
            Not a popup. Not a banner. One sponsored line where the loading text was.
          </p>
        </div>

        <SpinnerComparison previewText="Linear — issue tracking built for speed →" />

        <div id="install" className="mt-16 scroll-mt-24">
          <HeroInstallCta monthlyUsd={monthlyUsd} />
        </div>
      </div>
    </section>
  );
}
