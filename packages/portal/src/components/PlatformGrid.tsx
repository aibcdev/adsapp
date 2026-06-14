import { SUPPORTED_PLATFORMS } from "../lib/platforms";
import { PLATFORM_LOGO_BY_ID } from "../lib/platformLogos";

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
          {SUPPORTED_PLATFORMS.map((p) => {
            const logo = PLATFORM_LOGO_BY_ID[p.id];

            return (
              <div
                key={p.id}
                title={p.note}
                className="group flex min-w-[7rem] flex-col items-center gap-1.5 rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 transition hover:border-emerald-400"
              >
                <div className="flex h-8 w-8 items-center justify-center">
                  <img
                    src={logo}
                    alt=""
                    aria-hidden
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <span className="text-center text-xs font-medium text-zinc-800">{p.name}</span>
                {p.note ? (
                  <span className="hidden text-center font-mono text-[10px] text-zinc-500 group-hover:inline">{p.note}</span>
                ) : null}
              </div>
            );
          })}
        </div>
        <p className="mt-8 text-center font-mono text-xs text-zinc-500">
          One extension · single-line spinner ads · works across the tools you already use
        </p>
      </div>
    </section>
  );
}
