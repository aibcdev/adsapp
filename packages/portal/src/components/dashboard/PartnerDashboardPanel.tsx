import { useEffect, useState } from "react";
import { PartnerDashboardShell } from "./DashboardHubShell";
import { fetchPartnerDashboard, type PartnerDashboard } from "../../lib/advertiserApi";

export function PartnerDashboardPanel() {
  const [data, setData] = useState<PartnerDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    void fetchPartnerDashboard()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const copyLink = async () => {
    if (!data?.referralLink) return;
    await navigator.clipboard.writeText(data.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <p className="text-sm text-zinc-500">Loading partner dashboard…</p>;
  if (!data) return null;

  return (
    <PartnerDashboardShell eyebrow="Partner program" title="Referral & commission">
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Commission rate</p>
          <p className="mt-2 text-3xl font-bold text-zinc-900">
            {((data.tierUnlocked ? data.commissionTierPct : data.commissionBasePct) * 100).toFixed(0)}%
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {data.tierUnlocked
              ? `${(data.commissionBasePct * 100).toFixed(0)}% on the first $${data.commissionTierThresholdUsd.toLocaleString()} combined; ${(data.commissionTierPct * 100).toFixed(0)}% only on spend after that`
              : `${(data.commissionTierPct * 100).toFixed(0)}% after $${data.commissionTierThresholdUsd.toLocaleString()} combined settled spend ($${data.spendUntilTierUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })} to go)`}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Settled spend</p>
          <p className="mt-2 text-3xl font-bold text-zinc-900">${data.totalReferredSpend.toFixed(2)}</p>
          <p className="mt-1 text-xs text-zinc-500">Delivered ads only — not unused account balance</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Commission earned</p>
          <p className="mt-2 text-3xl font-bold text-emerald-700">${data.totalCommissionEarned.toFixed(2)}</p>
        </div>
      </div>

      <div className="mb-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-zinc-900">Your referral link</p>
        <p className="mt-1 text-sm text-zinc-600">
          Share with advertisers — {(data.commissionBasePct * 100).toFixed(0)}% on the first $
          {data.commissionTierThresholdUsd.toLocaleString()} of settled ad spend combined across all referred clients;
          {(data.commissionTierPct * 100).toFixed(0)}% only on spend after that. Commission is on delivered ads, not
          unused account balance.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <code className="flex-1 rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-800">{data.referralLink}</code>
          <button
            type="button"
            onClick={() => void copyLink()}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 px-5 py-4">
          <h2 className="font-semibold text-zinc-900">Referred advertisers ({data.referrals.length})</h2>
        </div>
        {data.referrals.length === 0 ? (
          <p className="p-6 text-sm text-zinc-600">No referrals yet. Share your link to get started.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {data.referrals.map((r) => (
                <tr key={r.clientId} className="border-t border-zinc-100">
                  <td className="px-5 py-3">{r.email || "—"}</td>
                  <td className="px-5 py-3 text-zinc-600">{new Date(r.attributedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </PartnerDashboardShell>
  );
}
