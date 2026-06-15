type MarketplaceRow = {
  id: string;
  label: string;
  note: string;
  total: number;
  today: number | null;
  week: number | null;
  month: number | null;
  lastSyncedAt: number | null;
  error?: string;
};

type DownloadsPayload = {
  marketplaces: MarketplaceRow[];
  totals: { total: number; today: number | null; week: number | null; month: number | null };
  lastSyncedAt: number | null;
};

function fmt(n: number | null): string {
  if (n === null) return "—";
  return n.toLocaleString();
}

function fmtTime(ms: number | null): string {
  if (!ms) return "Not synced yet";
  return new Date(ms).toLocaleString();
}

export function MarketplaceDownloadsPanel({ downloads }: { downloads: DownloadsPayload }) {
  const { marketplaces, totals, lastSyncedAt } = downloads;

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-instrument-serif text-xl text-white">Extension downloads</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Per-store install counts from each registry. Combined total is not deduplicated.
          </p>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
          Synced {fmtTime(lastSyncedAt)}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">All time</p>
          <p className="mt-2 font-brand-heading text-3xl text-white">{totals.total.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Today</p>
          <p className="mt-2 font-brand-heading text-3xl text-emerald-400">{fmt(totals.today)}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">7 days</p>
          <p className="mt-2 font-brand-heading text-3xl text-white">{fmt(totals.week)}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">This month</p>
          <p className="mt-2 font-brand-heading text-3xl text-white">{fmt(totals.month)}</p>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="pb-3 pr-4">Marketplace</th>
              <th className="pb-3 pr-4 text-right">Total</th>
              <th className="pb-3 pr-4 text-right">Today</th>
              <th className="pb-3 pr-4 text-right">7 days</th>
              <th className="pb-3 text-right">Month</th>
            </tr>
          </thead>
          <tbody>
            {marketplaces.map((row) => (
              <tr key={row.id} className="border-t border-zinc-800">
                <td className="py-3 pr-4">
                  <p className="font-medium text-zinc-100">{row.label}</p>
                  <p className="text-xs text-zinc-500">{row.note}</p>
                  {row.error ? <p className="text-xs text-red-400">{row.error}</p> : null}
                </td>
                <td className="py-3 pr-4 text-right font-mono text-zinc-200">{row.total.toLocaleString()}</td>
                <td className="py-3 pr-4 text-right font-mono text-emerald-400">{fmt(row.today)}</td>
                <td className="py-3 pr-4 text-right font-mono text-zinc-300">{fmt(row.week)}</td>
                <td className="py-3 text-right font-mono text-zinc-300">{fmt(row.month)}</td>
              </tr>
            ))}
            <tr className="border-t border-zinc-700 bg-zinc-950/40 font-semibold">
              <td className="py-3 pr-4 text-white">Total</td>
              <td className="py-3 pr-4 text-right font-mono text-white">{totals.total.toLocaleString()}</td>
              <td className="py-3 pr-4 text-right font-mono text-emerald-400">{fmt(totals.today)}</td>
              <td className="py-3 pr-4 text-right font-mono text-zinc-200">{fmt(totals.week)}</td>
              <td className="py-3 text-right font-mono text-zinc-200">{fmt(totals.month)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
