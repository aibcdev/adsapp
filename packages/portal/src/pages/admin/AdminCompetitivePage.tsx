import { useEffect, useState } from "react";
import { AdminGate } from "../../components/admin/AdminGate";

type TrackerIssue = {
  number: number;
  title: string;
  url: string;
  state: string;
  aibcStatus: string;
  aibcStatusLabel: string;
  aibcNote: string;
  aibcFix: string | null;
  updatedAt: string;
};

type Tracker = {
  syncedAt: string;
  source: string;
  openCount: number;
  summary: Record<string, number>;
  aibcAdvantages: string[];
  issues: TrackerIssue[];
};

const STATUS_COLORS: Record<string, string> = {
  fixed: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  in_progress: "bg-amber-500/20 text-amber-200 border-amber-500/40",
  partial: "bg-sky-500/20 text-sky-200 border-sky-500/40",
  backlog: "bg-zinc-700/50 text-zinc-400 border-zinc-600",
  wont_fix: "bg-zinc-800 text-zinc-500 border-zinc-700",
  n_a: "bg-zinc-800 text-zinc-500 border-zinc-700",
};

function SummaryPill({ label, count }: { label: string; count: number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-1 font-brand-heading text-2xl text-white">{count}</p>
    </div>
  );
}

function CompetitiveInner() {
  const [data, setData] = useState<Tracker | null>(null);
  const [err, setErr] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const load = () => {
    void fetch(`/kickbacks-tracker.json?t=${Date.now()}`)
      .then((r) => r.json())
      .then((d: Tracker) => {
        setData(d);
        setErr("");
      })
      .catch(() => setErr("Could not load tracker. Run npm run sync:kickbacks and redeploy."));
  };

  useEffect(() => {
    load();
  }, []);

  if (err && !data) return <p className="text-sm text-red-400">{err}</p>;
  if (!data) return <p className="text-sm text-zinc-500">Loading competitive tracker…</p>;

  const rows =
    filter === "all" ? data.issues : data.issues.filter((i) => i.aibcStatus === filter);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-instrument-serif text-2xl text-white">Competitive tracker</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Open issues from{" "}
            <a
              href={data.source}
              className="text-emerald-400 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              kickbacks.ai on GitHub
            </a>
            . Last sync: {new Date(data.syncedAt).toLocaleString()}.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-500"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <SummaryPill label="Their open issues" count={data.openCount} />
        <SummaryPill label="We fixed" count={data.summary.fixed ?? 0} />
        <SummaryPill label="In progress" count={data.summary.in_progress ?? 0} />
        <SummaryPill label="Backlog" count={data.summary.backlog ?? 0} />
        <SummaryPill label="Partial" count={data.summary.partial ?? 0} />
      </div>

      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
        <p className="font-mono text-[10px] uppercase tracking-wider text-emerald-400">AIBC advantages</p>
        <ul className="mt-2 list-inside list-disc text-sm text-emerald-100/90">
          {data.aibcAdvantages.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap gap-2">
        {["all", "fixed", "in_progress", "partial", "backlog"].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              filter === f ? "bg-white text-black" : "border border-zinc-700 text-zinc-400"
            }`}
          >
            {f === "all" ? "All" : f.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-zinc-800">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900/80 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Kickbacks issue</th>
              <th className="px-4 py-3">AIBC status</th>
              <th className="px-4 py-3">Note</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.number} className="border-b border-zinc-800/80 hover:bg-zinc-900/40">
                <td className="px-4 py-3 font-mono text-zinc-500">
                  <a href={row.url} target="_blank" rel="noreferrer" className="hover:text-emerald-400">
                    {row.number}
                  </a>
                </td>
                <td className="max-w-xs px-4 py-3 font-medium text-zinc-200">{row.title}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${STATUS_COLORS[row.aibcStatus] || STATUS_COLORS.backlog}`}
                  >
                    {row.aibcStatusLabel}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-zinc-500">
                  {row.aibcNote}
                  {row.aibcFix ? (
                    <span className="mt-1 block font-mono text-[10px] text-zinc-600">{row.aibcFix}</span>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-zinc-600">
        Auto-sync: run <code className="text-zinc-400">npm run sync:kickbacks</code> locally or via GitHub
        Actions weekly. Edit mappings in <code className="text-zinc-400">scripts/kickbacks-aibc-status.mjs</code>.
      </p>
    </div>
  );
}

export function AdminCompetitivePage() {
  return (
    <AdminGate>
      <CompetitiveInner />
    </AdminGate>
  );
}
