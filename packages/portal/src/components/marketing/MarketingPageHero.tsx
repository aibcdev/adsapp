import { Link } from "react-router-dom";
import type { ReactNode } from "react";

export function MarketingPageHero({
  eyebrow,
  title,
  description,
  primaryCta,
  primaryHref = "/#install",
  stats,
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
  primaryCta?: string;
  primaryHref?: string;
  stats?: { label: string; value: string }[];
}) {
  return (
    <section className="relative overflow-hidden border-b border-zinc-200 pt-32 pb-16 lg:pt-40 lg:pb-20">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />
      <div className="relative mx-auto max-w-4xl px-6 text-center md:px-12">
        <p className="font-mono text-xs uppercase tracking-widest text-emerald-600">{eyebrow}</p>
        <h1 className="mt-4 font-brand-heading text-4xl leading-tight text-zinc-900 md:text-5xl lg:text-6xl">{title}</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600">{description}</p>
        {primaryCta ? (
          <Link
            to={primaryHref}
            className="mt-8 inline-flex rounded-xl bg-emerald-600 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            {primaryCta}
          </Link>
        ) : null}
        {stats?.length ? (
          <div className="mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-zinc-200 bg-white px-4 py-3">
                <p className="text-xl font-bold text-zinc-900">{s.value}</p>
                <p className="mt-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500">{s.label}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
