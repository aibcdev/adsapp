import { SUPPORTED_PLATFORMS } from "../lib/platforms";

export function PlatformGrid({ title, subtitle }: { title?: string; subtitle?: string }) {
  return (
    <section className="border-b border-zinc-200 bg-white py-16">
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        {title ? (
          <div className="mb-10 text-center">
            <h2 className="font-brand-heading text-3xl tracking-tight text-zinc-900 md:text-4xl">{title}</h2>
            {subtitle ? <p className="mx-auto mt-3 max-w-2xl text-zinc-600">{subtitle}</p> : null}
          </div>
        ) : null}
        <div className="flex flex-wrap justify-center gap-3">
          {SUPPORTED_PLATFORMS.map((p) => (
            <div
              key={p.id}
              title={p.note}
              className="group flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 transition hover:border-emerald-400"
            >
              <span className="text-sm font-medium text-zinc-800">{p.name}</span>
              {p.note ? (
                <span className="hidden font-mono text-[10px] text-zinc-500 group-hover:inline">{p.note}</span>
              ) : null}
            </div>
          ))}
        </div>
        <p className="mt-8 text-center font-mono text-xs text-zinc-500">
          One extension · single-line spinner ads · works across the tools you already use
        </p>
      </div>
    </section>
  );
}
