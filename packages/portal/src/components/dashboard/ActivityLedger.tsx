import { useMemo, useState } from "react";

type Row = {
  id: string;
  type: string;
  adId: string;
  amount: number;
  createdAt: string;
};

export function ActivityLedger({
  rows,
  loaded,
  loading,
  onRetrieve,
}: {
  rows: Row[];
  loaded: boolean;
  loading: boolean;
  onRetrieve: () => void;
}) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (typeFilter !== "all" && r.type !== typeFilter) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return r.adId.toLowerCase().includes(q) || r.type.toLowerCase().includes(q) || r.id.toLowerCase().includes(q);
    });
  }, [rows, query, typeFilter]);

  return (
    <section className="aibc-card p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-brand-heading text-xl text-zinc-900">Activity ledger</h2>
          <p className="text-sm text-zinc-500">Search and filter credited events.</p>
        </div>
        <span className="rounded-full border border-zinc-200 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
          {loaded ? `${filtered.length} rows` : "Not retrieved"}
        </span>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search advertiser, event id, event type…"
          className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
        >
          <option value="all">All events</option>
          <option value="impression">Impressions</option>
          <option value="click">Clicks</option>
        </select>
      </div>

      {!loaded ? (
        <div className="rounded-xl border border-dashed border-zinc-200 py-12 text-center">
          <p className="text-sm text-zinc-500">No activity loaded. Retrieves the last 200 credited events.</p>
          <button
            type="button"
            disabled={loading}
            onClick={onRetrieve}
            className="mt-4 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? "Loading…" : "Retrieve activity"}
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-500">No matching events.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                <th className="py-2 pr-4">Time</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Ad</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-zinc-50">
                  <td className="py-2 pr-4 font-mono text-xs text-zinc-500">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                  <td className="py-2 pr-4 capitalize text-zinc-700">{r.type}</td>
                  <td className="py-2 pr-4 font-mono text-xs text-zinc-500">{r.adId}</td>
                  <td className="py-2 text-right font-medium text-emerald-700">+${r.amount.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
