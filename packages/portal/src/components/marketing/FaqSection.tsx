import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function FaqSection({
  title = "Common questions",
  items,
}: {
  title?: string;
  items: { q: string; a: string }[];
}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="border-t border-zinc-200 bg-zinc-50/50 py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-6 md:px-12">
        <h2 className="mb-8 text-center font-brand-heading text-3xl text-zinc-900">{title}</h2>
        <div className="space-y-3">
          {items.map((item, i) => (
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
          ))}
        </div>
      </div>
    </section>
  );
}
