export type PricePoint = { ts: string; bid_usd: number };

export function PriceChart({ points, range }: { points: PricePoint[]; range: "24h" | "all" }) {
  const filtered =
    range === "24h"
      ? points.filter((p) => Date.now() - new Date(p.ts).getTime() < 86_400_000)
      : points;

  const data = filtered.length ? filtered : points;
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center font-mono text-sm text-zinc-500">
        No market data yet
      </div>
    );
  }

  const w = 600;
  const h = 180;
  const pad = 24;
  const maxY = Math.max(...data.map((p) => p.bid_usd), 1) * 1.1;
  const minY = 0;

  const coords = data.map((p, i) => {
    const x = pad + (i / Math.max(data.length - 1, 1)) * (w - pad * 2);
    const y = h - pad - ((p.bid_usd - minY) / (maxY - minY)) * (h - pad * 2);
    return `${x},${y}`;
  });

  const area = `${pad},${h - pad} ${coords.join(" ")} ${w - pad},${h - pad}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-48 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#chartFill)" />
      <polyline fill="none" stroke="#10B981" strokeWidth="2.5" points={coords.join(" ")} />
    </svg>
  );
}
