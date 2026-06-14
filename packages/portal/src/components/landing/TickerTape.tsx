export type LeaderboardRow = {
  rank: number;
  display_name: string;
  ad_line: string;
  bid_usd: number;
  impressions_remaining: number;
  status: string;
};

export function TickerTape({ rows }: { rows: LeaderboardRow[] }) {
  const items =
    rows.length > 0
      ? rows.slice(0, 12).map((r) => ({
          brand: r.display_name,
          line: r.ad_line,
        }))
      : [{ brand: "aibc", line: "Live auction — place your bid" }];

  const doubled = [...items, ...items];

  return (
    <div className="overflow-hidden border-b border-zinc-800 bg-zinc-900/60 py-2">
      <div className="tape-track flex whitespace-nowrap font-mono text-xs">
        {doubled.map((item, i) => (
          <span key={i} className="mx-6 inline-flex items-center gap-2">
            <span className="font-semibold text-emerald-400">{item.brand.toUpperCase()}</span>
            <span className="text-zinc-500">{item.line}</span>
            <span className="text-zinc-700">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
