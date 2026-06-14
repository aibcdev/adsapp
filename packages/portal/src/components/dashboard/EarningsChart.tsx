import { useMemo, useState } from "react";

type Activity = { amount: number; createdAt: string };

type Range = "24h" | "7d" | "30d";

function rangeMs(range: Range) {
  if (range === "24h") return 24 * 60 * 60 * 1000;
  if (range === "7d") return 7 * 24 * 60 * 60 * 1000;
  return 30 * 24 * 60 * 60 * 1000;
}

export function EarningsChart({ activity }: { activity: Activity[] }) {
  const [range, setRange] = useState<Range>("7d");

  const { points, total, count, linePath, areaPath } = useMemo(() => {
    const since = Date.now() - rangeMs(range);
    const filtered = activity.filter((a) => new Date(a.createdAt).getTime() >= since);
    const buckets = new Map<string, number>();
    for (const a of filtered) {
      const d = new Date(a.createdAt);
      const key = range === "24h" ? `${d.getHours()}:00` : d.toISOString().slice(0, 10);
      buckets.set(key, (buckets.get(key) || 0) + a.amount);
    }
    const entries = [...buckets.entries()].slice(-12);
    const max = Math.max(0.001, ...entries.map(([, v]) => v));
    const chartPoints = entries.map(([label, value], i) => {
      const w = 360;
      const h = 100;
      const pad = 8;
      const x = pad + (i / Math.max(1, entries.length - 1)) * (w - pad * 2);
      const y = h - pad - (value / max) * (h - pad * 2);
      return { label, value, x, y, h: (value / max) * 100 };
    });

    const line =
      chartPoints.length > 0
        ? chartPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ")
        : "";
    const area =
      chartPoints.length > 0
        ? `${line} L ${chartPoints[chartPoints.length - 1].x.toFixed(1)} 92 L ${chartPoints[0].x.toFixed(1)} 92 Z`
        : "";

    return {
      points: chartPoints,
      total: filtered.reduce((s, a) => s + a.amount, 0),
      count: filtered.length,
      linePath: line,
      areaPath: area,
    };
  }, [activity, range]);

  return (
    <div className="aibc-card flex h-full flex-col p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-brand-heading text-xl text-zinc-900">Earnings activity</h2>
          <p className="text-sm text-zinc-500">Credit over the selected window.</p>
        </div>
        <div className="flex rounded-lg border border-zinc-200 bg-zinc-50 p-1 text-xs">
          {(["24h", "7d", "30d"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`rounded-md px-3 py-1.5 font-medium ${
                range === r ? "bg-white text-emerald-700 shadow-sm" : "text-zinc-500"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {points.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-sm text-zinc-400">No credited events in this window.</div>
      ) : (
        <div className="relative flex-1 pt-2">
          <svg viewBox="0 0 360 100" className="h-32 w-full" preserveAspectRatio="none" aria-hidden>
            <defs>
              <linearGradient id="earn-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
              </linearGradient>
            </defs>
            {areaPath ? <path d={areaPath} fill="url(#earn-fill)" /> : null}
            {linePath ? (
              <path d={linePath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            ) : null}
            {points.map((p) => (
              <circle key={p.label} cx={p.x} cy={p.y} r="3.5" fill="#10b981" />
            ))}
          </svg>
          <div className="mt-2 flex justify-between gap-1">
            {points.map((p) => (
              <span key={p.label} className="flex-1 truncate text-center font-mono text-[9px] text-zinc-400">
                {p.label}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="mt-4 font-mono text-xs text-zinc-500">
        ${total.toFixed(4)} across {count} events
      </p>
    </div>
  );
}
