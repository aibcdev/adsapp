import { Check, Minus } from "lucide-react";
import { AIBC_VS_OTHERS, marketingCopy } from "../../lib/marketingCopy";
import { BrandAccent } from "../brand/BrandAccent";

export function AibcVsOthersComparison() {
  return (
    <section className="border-t border-zinc-200 bg-zinc-50/80 px-6 py-16 md:px-12 md:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">Why switch</span>
          <h2 className="mt-3 font-brand-heading text-4xl text-zinc-950 md:text-5xl">
            AIBC vs <BrandAccent>others</BrandAccent>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base font-medium leading-relaxed text-zinc-600">
            Same idea — ads in the AI spinner — but a different bar on money, editors, and honesty.{" "}
            {marketingCopy.scaleAmbition}
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="grid grid-cols-[1fr_1fr_1fr] border-b border-zinc-200 bg-zinc-50/90">
            <div className="p-4 md:p-5" />
            <div className="border-l border-zinc-200 p-4 md:p-5">
              <p className="font-mono text-[10px] uppercase tracking-wider text-emerald-700">AIBC Media</p>
              <p className="mt-1 text-sm font-bold text-zinc-950">Built for scale</p>
            </div>
            <div className="border-l border-zinc-200 p-4 md:p-5">
              <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Others</p>
              <p className="mt-1 text-sm font-bold text-zinc-600">Typical alternatives</p>
            </div>
          </div>

          {AIBC_VS_OTHERS.map((row, i) => (
            <div
              key={row.label}
              className={`grid grid-cols-[1fr_1fr_1fr] border-b border-zinc-100 last:border-b-0 ${
                row.highlight ? "bg-emerald-50/40" : i % 2 === 0 ? "bg-white" : "bg-zinc-50/30"
              }`}
            >
              <div className="flex items-center p-4 md:p-5">
                <p className="text-sm font-semibold text-zinc-800">{row.label}</p>
              </div>
              <div className="flex gap-2 border-l border-zinc-100 p-4 md:p-5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                <p className="text-sm leading-relaxed text-zinc-700">{row.aibc}</p>
              </div>
              <div className="flex gap-2 border-l border-zinc-100 p-4 md:p-5">
                <Minus className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
                <p className="text-sm leading-relaxed text-zinc-500">{row.others}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed text-zinc-500">
          {marketingCopy.honestLaunch} {marketingCopy.transparentYield}
        </p>
      </div>
    </section>
  );
}
