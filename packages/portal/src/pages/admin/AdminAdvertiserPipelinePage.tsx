import { useEffect, useState } from "react";
import { AdminGate } from "../../components/admin/AdminGate";
import { adminFetch } from "../../lib/adminApi";

type Application = {
  id: string;
  company: string;
  website: string | null;
  budget: string | null;
  email: string;
  status: string;
  createdAt: string;
};

const STATUSES = ["new", "contacted", "qualified", "closed"] as const;

function PipelineInner() {
  const [rows, setRows] = useState<Application[]>([]);
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      const res = await adminFetch("/v1/admin/advertiser-applications");
      const body = (await res.json()) as Application[] | { error?: string };
      if (!res.ok) throw new Error("error" in body ? body.error : "Failed to load");
      setRows(body as Application[]);
      setErr("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const setStatus = async (id: string, status: string) => {
    const res = await adminFetch(`/v1/admin/advertiser-applications/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    if (!res.ok) return;
    void load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-instrument-serif text-2xl text-white">Advertiser pipeline</h2>
        <p className="mt-1 text-sm text-zinc-500">Inbound founding advertiser applications</p>
      </div>

      {err ? <p className="text-sm text-red-400">{err}</p> : null}

      {rows.length === 0 ? (
        <p className="text-sm text-zinc-500">No applications yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-800">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900/80 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Budget</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Applied</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-zinc-800/80">
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{r.company}</p>
                    {r.website ? (
                      <a href={r.website} className="text-xs text-emerald-400 hover:underline" target="_blank" rel="noreferrer">
                        {r.website}
                      </a>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{r.email}</td>
                  <td className="px-4 py-3 text-zinc-400">{r.budget || "—"}</td>
                  <td className="px-4 py-3">
                    <select
                      value={r.status}
                      onChange={(e) => void setStatus(r.id, e.target.value)}
                      className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function AdminAdvertiserPipelinePage() {
  return (
    <AdminGate>
      <PipelineInner />
    </AdminGate>
  );
}
