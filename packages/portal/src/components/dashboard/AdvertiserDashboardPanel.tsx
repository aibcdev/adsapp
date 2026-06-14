import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PartnerDashboardShell } from "./DashboardHubShell";
import {
  fetchAdvertiserBalance,
  fetchAdvertiserCampaigns,
  startAdvertiserDeposit,
  type AdvertiserCampaign,
} from "../../lib/advertiserApi";

export function AdvertiserDashboardPanel() {
  const [balance, setBalance] = useState(0);
  const [campaigns, setCampaigns] = useState<AdvertiserCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState(500);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [b, c] = await Promise.all([fetchAdvertiserBalance(), fetchAdvertiserCampaigns()]);
      setBalance(b.balance);
      setCampaigns(c);
    } catch {
      setBalance(0);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const deposit = async () => {
    setBusy(true);
    try {
      const { url } = await startAdvertiserDeposit(depositAmount);
      window.location.href = url;
    } finally {
      setBusy(false);
    }
  };

  const totalSpend = campaigns.reduce((s, c) => s + (c.spend || 0), 0);
  const totalImpressions = campaigns.reduce((s, c) => s + (c.impressions || 0), 0);

  return (
    <PartnerDashboardShell eyebrow="Advertiser portal" title="Campaigns & balance">
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Prepaid balance</p>
          <p className="mt-2 text-3xl font-bold text-zinc-900">${balance.toFixed(2)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Total spend</p>
          <p className="mt-2 text-3xl font-bold text-zinc-900">${totalSpend.toFixed(2)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Impressions</p>
          <p className="mt-2 text-3xl font-bold text-zinc-900">{totalImpressions.toLocaleString()}</p>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap items-end gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div>
          <label className="text-xs font-medium text-zinc-600">Add funds (USD)</label>
          <input
            type="number"
            min={50}
            step={50}
            value={depositAmount}
            onChange={(e) => setDepositAmount(Number(e.target.value))}
            className="mt-1 block w-32 rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void deposit()}
          className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {busy ? "Redirecting…" : "Add funds via Stripe"}
        </button>
        <Link to="/advertisers#launch" className="ml-auto text-sm font-semibold text-emerald-700 hover:underline">
          Launch new campaign →
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 px-5 py-4">
          <h2 className="font-semibold text-zinc-900">Your campaigns</h2>
        </div>
        {loading ? (
          <p className="p-6 text-sm text-zinc-500">Loading…</p>
        ) : campaigns.length === 0 ? (
          <p className="p-6 text-sm text-zinc-600">
            No campaigns yet.{" "}
            <Link to="/advertisers#launch" className="font-semibold text-emerald-700 hover:underline">
              Create your first campaign
            </Link>
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-5 py-3">Brand</th>
                  <th className="px-5 py-3">Line</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Impressions</th>
                  <th className="px-5 py-3">Spend</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id} className="border-t border-zinc-100">
                    <td className="px-5 py-3 font-medium">{c.brandName || "—"}</td>
                    <td className="max-w-xs truncate px-5 py-3 text-zinc-600">{c.adLine}</td>
                    <td className="px-5 py-3 capitalize">{c.status}</td>
                    <td className="px-5 py-3">{c.impressions?.toLocaleString() ?? 0}</td>
                    <td className="px-5 py-3">${(c.spend ?? 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PartnerDashboardShell>
  );
}
