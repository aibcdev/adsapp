import type { ReactNode } from "react";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function FaqSection({
  title = "Common questions",
  intro,
  items,
  alwaysOpen = false,
  id,
}: {
  title?: string;
  intro?: string;
  items: { q: string; a: ReactNode }[];
  /** Keep every answer in the HTML. Used by /faq so crawlers can read the page without JavaScript. */
  alwaysOpen?: boolean;
  id?: string;
}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id={id} className="border-t border-zinc-200 bg-zinc-50/50 py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-6 md:px-12">
        <h2 className="text-center font-brand-heading text-3xl text-zinc-900">{title}</h2>
        {intro ? <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-zinc-600">{intro}</p> : null}
        <div className="mt-8 space-y-3">
          {items.map((item, i) =>
            alwaysOpen ? (
              <article key={item.q} className="rounded-xl border border-zinc-200 bg-white px-5 py-4">
                <h3 className="font-semibold text-zinc-900">{item.q}</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600">{item.a}</p>
              </article>
            ) : (
              <div key={item.q} className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
                <button
                  type="button"
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="font-semibold text-zinc-900">{item.q}</span>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-zinc-400 transition ${open === i ? "rotate-180" : ""}`} />
                </button>
                {open === i ? <p className="border-t border-zinc-100 px-5 py-4 text-sm leading-relaxed text-zinc-600">{item.a}</p> : null}
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
