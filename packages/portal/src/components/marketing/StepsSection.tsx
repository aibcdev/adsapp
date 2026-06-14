import type { ReactNode } from "react";

export function StepsSection({
  title,
  subtitle,
  steps,
}: {
  title: string;
  subtitle?: string;
  steps: { num: string; title: string; body: string; icon?: ReactNode }[];
}) {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        <div className="mb-12 text-center">
          <h2 className="font-brand-heading text-3xl text-zinc-900 md:text-4xl">{title}</h2>
          {subtitle ? <p className="mx-auto mt-3 max-w-xl text-zinc-600">{subtitle}</p> : null}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step) => (
            <div key={step.num} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                {step.icon ? (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    {step.icon}
                  </div>
                ) : (
                  <span className="font-mono text-xs font-bold text-emerald-600">{step.num}</span>
                )}
                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Step {step.num}</span>
              </div>
              <h3 className="text-lg font-bold text-zinc-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
