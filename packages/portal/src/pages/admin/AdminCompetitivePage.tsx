import { useEffect, useState } from "react";
import { AdminGate } from "../../components/admin/AdminGate";

type Row = {
  id: number;
  title: string;
  status: string;
  owner: string;
  eta: string;
  fluxFix: string;
};

export function AdminCompetitivePage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    void fetch("/kickbacks-tracker.json")
      .then((r) => r.json())
      .then(setRows)
      .catch(() => setErr("Could not load tracker"));
  }, []);

  return (
    <AdminGate>
      {() => (
        <div>
          <h2 className="font-instrument-serif text-2xl text-white">Competitive tracker</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Cross-track vs{" "}
            <a
              href="https://github.com/andrewmccalip/kickbacks.ai/issues"
              className="text-emerald-400 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              kickbacks.ai issues
            </a>
            . Edit <code className="text-zinc-300">public/kickbacks-tracker.json</code> to update.
          </p>
          {err ? <p className="mt-4 text-sm text-red-400">{err}</p> : null}
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-zinc-500">
                <tr>
                  <th className="pb-2">#</th>
                  <th className="pb-2">Title</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Owner</th>
                  <th className="pb-2">ETA</th>
                  <th className="pb-2">Flux fix</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-zinc-800">
                    <td className="py-3 font-mono text-zinc-400">#{r.id}</td>
                    <td className="py-3">{r.title}</td>
                    <td className="py-3">{r.status}</td>
                    <td className="py-3">{r.owner}</td>
                    <td className="py-3">{r.eta}</td>
                    <td className="py-3 max-w-xs text-zinc-400">{r.fluxFix}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminGate>
  );
}
