type AcquisitionRow = {
  source: string;
  medium: string;
  campaign: string;
  signups: number;
  signups7d: number;
};

type AcquisitionPayload = {
  rows: AcquisitionRow[];
  totals: {
    signupsWithEmail: number;
    attributed: number;
    direct: number;
    signups7d: number;
    attributed7d: number;
  };
};

export function AcquisitionSourcesPanel({ acquisition }: { acquisition: AcquisitionPayload }) {
  const { rows, totals } = acquisition;

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
      <div>
        <h3 className="font-instrument-serif text-xl text-white">Signup sources</h3>
        <p className="mt-1 text-sm text-zinc-500">
          Where signed-up users came from — Google Ads, TikTok, etc. (UTM tags on ad links)
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">From ads</p>
          <p className="mt-2 font-brand-heading text-3xl text-white">{totals.attributed.toLocaleString()}</p>
          <p className="mt-1 text-xs text-zinc-500">{totals.attributed7d} this week</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Direct / unknown</p>
          <p className="mt-2 font-brand-heading text-3xl text-white">{totals.direct.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Signups (7d)</p>
          <p className="mt-2 font-brand-heading text-3xl text-white">{totals.signups7d.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">All signups</p>
          <p className="mt-2 font-brand-heading text-3xl text-white">{totals.signupsWithEmail.toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              <th className="pb-3 pr-4">Source</th>
              <th className="pb-3 pr-4">Medium</th>
              <th className="pb-3 pr-4">Campaign</th>
              <th className="pb-3 pr-4 text-right">Signups</th>
              <th className="pb-3 text-right">7d</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-zinc-500">
                  No signups yet. Use tagged links like{" "}
                  <code className="text-emerald-400">?utm_source=google&utm_medium=cpc&utm_campaign=earn</code>
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={`${row.source}-${row.medium}-${row.campaign}`} className="border-t border-zinc-800">
                  <td className="py-3 pr-4 font-medium text-white">{row.source}</td>
                  <td className="py-3 pr-4 text-zinc-300">{row.medium}</td>
                  <td className="py-3 pr-4 text-zinc-400">{row.campaign}</td>
                  <td className="py-3 pr-4 text-right text-zinc-200">{row.signups.toLocaleString()}</td>
                  <td className="py-3 text-right text-zinc-400">{row.signups7d.toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
