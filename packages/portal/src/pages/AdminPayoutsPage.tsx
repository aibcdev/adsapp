import { useEffect, useState } from "react";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";

const API = import.meta.env.VITE_AIBC_API || "https://api.aibcmedia.com";

type PayoutRow = {
  id: string;
  clientId: string;
  amount: number;
  rail: string;
  handle: string;
  status: string;
  createdAt: string;
  email: string | null;
};

export function AdminPayoutsPage() {
  const [key, setKey] = useState(() => sessionStorage.getItem("aibc_admin_key") || "");
  const [input, setInput] = useState("");
  const [rows, setRows] = useState<PayoutRow[]>([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async (adminKey: string) => {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`${API}/v1/admin/payouts?status=requested`, {
        headers: { Authorization: `Bearer ${adminKey}`, Accept: "application/json" },
      });
      const body = (await res.json()) as PayoutRow[] | { error?: string };
      if (!res.ok) throw new Error("error" in body ? body.error : "Failed to load");
      setRows(body as PayoutRow[]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (key) void load(key);
  }, [key]);

  const unlock = () => {
    sessionStorage.setItem("aibc_admin_key", input.trim());
    setKey(input.trim());
  };

  const mark = async (id: string, status: "paid" | "failed") => {
    if (!key) return;
    await fetch(`${API}/v1/admin/payouts/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ status }),
    });
    await load(key);
  };

  if (!key) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <SiteHeader />
        <div className="mx-auto max-w-md px-6 py-32">
          <h1 className="font-instrument-serif text-2xl text-white">Admin · Payouts</h1>
          <p className="mt-2 text-sm text-zinc-400">Enter your AIBC_ADMIN_KEY to view the payout queue.</p>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="mt-6 w-full rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 py-2"
            placeholder="Admin key"
          />
          <button type="button" onClick={unlock} className="aibc-btn-primary mt-4 w-full">
            Unlock
          </button>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <SiteHeader />
      <div className="mx-auto max-w-4xl px-6 py-32 md:px-12">
        <h1 className="font-instrument-serif text-3xl text-white">Payout queue</h1>
        <p className="mt-2 text-sm text-zinc-400">Mark paid after sending via Wise / PayPal / UPI.</p>
        {err ? <p className="mt-4 text-sm text-red-400">{err}</p> : null}
        {busy ? <p className="mt-4 text-sm text-zinc-500">Loading…</p> : null}
        <ul className="mt-8 space-y-4">
          {rows.length === 0 && !busy ? (
            <li className="text-zinc-500">No pending payout requests.</li>
          ) : (
            rows.map((r) => (
              <li key={r.id} className="aibc-card flex flex-wrap items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-mono text-lg text-emerald-400">${r.amount.toFixed(2)}</p>
                  <p className="text-sm text-zinc-300">
                    {r.rail}: {r.handle}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {r.email || r.clientId} · {new Date(r.createdAt).toLocaleString()}
                  </p>
                </div>
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
              </li>
            ))
          )}
        </ul>
      </div>
      <SiteFooter />
    </div>
  );
}
