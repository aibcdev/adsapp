import { useEffect, useState } from "react";
import { AdminGate } from "../../components/admin/AdminGate";
import { adminFetch } from "../../lib/adminApi";

type PayoutRow = {
  id: string;
  clientId: string;
  amount: number;
  referralBonus: number;
  rail: string;
  handle: string;
  status: string;
  createdAt: string;
  email: string | null;
  foundingMember: boolean;
};

type Stats = {
  pendingPayoutTotal: number;
  pendingPayoutCount: number;
  userCount: number;
  foundingCount: number;
  foundingCap: number;
};

export function AdminPayoutsPage() {
  const [tab, setTab] = useState<"requested" | "all">("requested");
  const [rows, setRows] = useState<PayoutRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async (status: string) => {
    setBusy(true);
    setErr("");
    try {
      const [payoutRes, statsRes] = await Promise.all([
        adminFetch(`/v1/admin/payouts?status=${status}`),
        adminFetch("/v1/admin/stats"),
      ]);
      const body = (await payoutRes.json()) as PayoutRow[] | { error?: string };
      if (!payoutRes.ok) throw new Error("error" in body ? body.error : "Failed");
      setRows(body as PayoutRow[]);
      if (statsRes.ok) setStats((await statsRes.json()) as Stats);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setBusy(false);
    }
  };

  const mark = async (id: string, status: "paid" | "failed") => {
    await adminFetch(`/v1/admin/payouts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load(tab);
  };

  useEffect(() => {
    void load(tab);
  }, [tab]);

  return (
    <AdminGate>
      <div>
        <h2 className="font-instrument-serif text-2xl text-white">Payouts</h2>
        {stats ? (
          <p className="mt-2 text-sm text-zinc-400">
            {stats.pendingPayoutCount} pending · ${stats.pendingPayoutTotal.toFixed(2)} · {stats.foundingCount}/
            {stats.foundingCap} founding
          </p>
        ) : null}
        <div className="mt-4 flex gap-2">
          {(["requested", "all"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setTab(s)}
              className={`rounded-full px-3 py-1 text-xs ${tab === s ? "bg-emerald-600 text-white" : "border border-zinc-700 text-zinc-400"}`}
            >
              {s === "requested" ? "Queue" : "History"}
            </button>
          ))}
        </div>
        {err ? <p className="mt-4 text-sm text-red-400">{err}</p> : null}
        {busy ? <p className="mt-4 text-sm text-zinc-500">Loading…</p> : null}
        <ul className="mt-6 space-y-4">
          {rows.length === 0 && !busy ? <li className="text-zinc-500">No payouts.</li> : null}
          {rows.map((r) => (
            <li key={r.id} className="aibc-card flex flex-wrap items-center justify-between gap-4 p-4">
              <div>
                <p className="font-mono text-lg text-emerald-400">
                  ${r.amount.toFixed(2)}
                  {r.referralBonus > 0 ? (
                    <span className="ml-2 text-xs text-amber-400">(+${r.referralBonus.toFixed(2)} referral)</span>
                  ) : null}
                </p>
                <p className="text-sm text-zinc-300">
                  {r.rail}: {r.handle}
                </p>
                <p className="text-xs text-zinc-500">
                  {r.email || r.clientId}
                  {r.foundingMember ? " · founding" : ""} · {r.status} · {new Date(r.createdAt).toLocaleString()}
                </p>
              </div>
              {r.status === "requested" ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void mark(r.id, "paid")}
                    className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black"
                  >
                    Mark paid
                  </button>
                  <button
                    type="button"
                    onClick={() => void mark(r.id, "failed")}
                    className="aibc-btn-secondary px-4 py-2 text-sm"
                  >
                    Failed
                  </button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </AdminGate>
  );
}
