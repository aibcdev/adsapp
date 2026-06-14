import { SponsorLogo, type SponsorBrand } from "./SponsorLogo";

export type SponsorLine = {
  brand: SponsorBrand;
  name: string;
  text: string;
};

type MockupProps = {
  title: string;
  subtitle: string;
  sponsor: SponsorLine;
  variant?: "vscode" | "cursor" | "dashboard" | "advertiser";
};

export function IdeMockup({ title, subtitle, sponsor, variant = "vscode" }: MockupProps) {
  const accent = variant === "cursor" ? "border-emerald-500/20" : "border-zinc-700";
  const bar = variant === "cursor" ? "bg-zinc-900" : "bg-zinc-900/80";

  return (
    <div className={`overflow-hidden rounded-xl border ${accent} bg-zinc-950 shadow-lg`}>
      <div className={`flex items-center gap-2 border-b border-zinc-800 px-4 py-2.5 ${bar}`}>
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
        <span className="ml-2 font-mono text-[10px] text-zinc-500">{title}</span>
      </div>
      <div className="p-4 font-mono text-xs leading-relaxed text-zinc-500">
        <p className="text-zinc-600">{subtitle}</p>
        <p className="mt-3 text-zinc-400">const app = await build();</p>
        <p className="mt-4 border-t border-zinc-800 pt-3 text-[10px] uppercase tracking-widest text-zinc-600">
          Native sponsor line
        </p>
        <div className="mt-1 flex items-center gap-2 text-sm text-zinc-200">
          <SponsorLogo brand={sponsor.brand} />
          <span className="text-emerald-400 underline decoration-emerald-500/30">
            {sponsor.name} — {sponsor.text}
          </span>
        </div>
      </div>
    </div>
  );
}

export function RevenueDashboardMockup() {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950 shadow-lg">
      <div className="border-b border-zinc-800 px-5 py-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Revenue share</p>
        <p className="mt-1 text-2xl font-semibold text-white">Member dashboard</p>
      </div>
      <div className="grid gap-px bg-zinc-800 sm:grid-cols-3">
        {[
          { label: "Today", value: "$0.00" },
          { label: "This month", value: "$0.00" },
          { label: "Payable", value: "$0.00" },
        ].map((s) => (
          <div key={s.label} className="bg-zinc-950 px-5 py-4">
            <p className="font-mono text-[10px] uppercase text-zinc-500">{s.label}</p>
            <p className="mt-1 text-sm font-medium text-emerald-400">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdvertiserDashboardMockup() {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950 shadow-lg">
      <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Advertiser</p>
          <p className="text-lg font-semibold text-white">Campaign overview</p>
        </div>
        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">Live</span>
      </div>
      <div className="grid gap-4 p-5 sm:grid-cols-2">
        {[
          { label: "Impressions", value: "12,480" },
          { label: "CTR", value: "3.4%" },
          { label: "Spend", value: "$842" },
          { label: "Rank", value: "#1" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3">
            <p className="font-mono text-[10px] uppercase text-zinc-500">{s.label}</p>
            <p className="mt-1 text-lg font-semibold text-white">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
