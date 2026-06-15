import { useEffect, useState } from "react";
import { AdminGate } from "../../components/admin/AdminGate";
import { adminFetch } from "../../lib/adminApi";

type Limits = {
  maxRequestsPerDay: number;
  maxRequestsPerWeek: number;
  maxUsdPerDay: number;
  minPayoutUsd: number;
  hourlyCapUsd: number;
  dailyCapUsd: number;
  foundingMemberCap: number;
  foundingBonusMultiplier: number;
  referralQualifyUsd: number;
  referralBonusUsd: number;
};

export function AdminLimitsPage() {
  const [limits, setLimits] = useState<Limits | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    void adminFetch("/v1/admin/limits")
      .then(async (res) => {
        const body = (await res.json()) as Limits | { error?: string };
        if (!res.ok) throw new Error("error" in body ? body.error : "Failed");
        setLimits(body as Limits);
      })
      .catch((e) => setErr(e instanceof Error ? e.message : "Failed"));
  }, []);

  return (
    <AdminGate>
      {err ? (
        <p className="text-sm text-red-400">{err}</p>
      ) : !limits ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : (
        <div>
          <h2 className="font-instrument-serif text-2xl text-white">Limits</h2>
          <p className="mt-2 text-sm text-zinc-400">Read-only. Override via env vars on the API server.</p>
          <dl className="mt-6 space-y-3">
            {[
              ["Min payout", `$${limits.minPayoutUsd}`],
              ["Earning cap / hour", `$${limits.hourlyCapUsd}`],
              ["Earning cap / day", `$${limits.dailyCapUsd}`],
              ["Withdrawals / day", String(limits.maxRequestsPerDay)],
              ["Withdrawals / week", String(limits.maxRequestsPerWeek)],
              ["Max withdrawal / day", `$${limits.maxUsdPerDay}`],
              ["Founding cap", String(limits.foundingMemberCap)],
              ["Founding bonus", `+${Math.round((limits.foundingBonusMultiplier - 1) * 100)}%`],
              ["Referral qualify", `$${limits.referralQualifyUsd} lifetime`],
              ["Referral bonus", `$${limits.referralBonusUsd}`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-zinc-800 pb-2 text-sm">
                <dt className="text-zinc-400">{k}</dt>
                <dd className="font-mono text-zinc-200">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </AdminGate>
  );
}
