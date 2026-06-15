type CampaignRow = {
  id: string;
  ad_line: string;
  brand_name: string | null;
  buyer_email: string | null;
  bid_usd: number;
  spend: number;
  impressions_served: number;
  impressions_target: number;
  status: string;
  isSample: boolean;
};

export function AdminCampaignsPanel({ campaigns }: { campaigns: CampaignRow[] }) {
  if (campaigns.length === 0) {
    return (
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <h3 className="font-instrument-serif text-xl text-white">All campaigns</h3>
        <p className="mt-4 text-sm text-zinc-500">No campaigns yet.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
      <h3 className="font-instrument-serif text-xl text-white">All campaigns</h3>
      <p className="mt-1 text-sm text-zinc-500">
        Paying advertisers only count toward KPIs. Sample rows are demo inventory.
      </p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="pb-3 pr-4">Brand</th>
              <th className="pb-3 pr-4">Ad line</th>
              <th className="pb-3 pr-4">Buyer</th>
              <th className="pb-3 pr-4 text-right">Bid / 1k</th>
              <th className="pb-3 pr-4 text-right">Spend</th>
              <th className="pb-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((row) => (
              <tr key={row.id} className="border-t border-zinc-800">
                <td className="py-3 pr-4">
                  <p className="font-medium text-zinc-100">{row.brand_name || "—"}</p>
                  {row.isSample ? (
                    <span className="mt-1 inline-block rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] uppercase text-amber-400">
                      Sample
                    </span>
                  ) : null}
                </td>
                <td className="max-w-xs py-3 pr-4 text-zinc-300">{row.ad_line}</td>
                <td className="py-3 pr-4 font-mono text-xs text-zinc-400">
                  {row.buyer_email || "—"}
                </td>
                <td className="py-3 pr-4 text-right font-mono text-zinc-200">
                  ${row.bid_usd.toFixed(2)}
                </td>
                <td className="py-3 pr-4 text-right font-mono text-zinc-200">
                  ${row.spend.toFixed(2)}
                </td>
                <td className="py-3 text-right font-mono text-xs uppercase text-zinc-400">
                  {row.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
