import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CountryPicker } from "../advertiser/CountryPicker";
import { formatCountryList } from "../../lib/countries";
import { PartnerDashboardShell } from "./DashboardHubShell";
import { PartnerDashboardPanel } from "./PartnerDashboardPanel";
import {
  createAdvertiserBrand,
  fetchAdvertiserBalance,
  fetchAdvertiserBrands,
  fetchAdvertiserCampaigns,
  fetchAdvertiserProfile,
  fetchAdvertiserSummary,
  startAdvertiserDeposit,
  type AdvertiserBrand,
  type AdvertiserCampaign,
  type AdvertiserSummary,
} from "../../lib/advertiserApi";

type SubView = "campaigns" | "partner";

export function AdvertiserDashboardPanel() {
  const [subView, setSubView] = useState<SubView>("campaigns");
  const [isPartner, setIsPartner] = useState(false);
  const [brands, setBrands] = useState<AdvertiserBrand[]>([]);
  const [activeBrandId, setActiveBrandId] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [campaigns, setCampaigns] = useState<AdvertiserCampaign[]>([]);
  const [summary, setSummary] = useState<AdvertiserSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState(500);
  const [busy, setBusy] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [showAddBrand, setShowAddBrand] = useState(false);
  const [launchCountries, setLaunchCountries] = useState<string[]>([]);
  const [showLaunchForm, setShowLaunchForm] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [profile, b, brandList, s] = await Promise.all([
        fetchAdvertiserProfile(),
        fetchAdvertiserBalance(),
        fetchAdvertiserBrands(),
        fetchAdvertiserSummary(),
      ]);
      setIsPartner(profile.isPartner);
      setBalance(b.balance);
      setBrands(brandList);
      setSummary(s);
      const c = await fetchAdvertiserCampaigns(activeBrandId || undefined);
      setCampaigns(c);
    } catch {
      setBalance(0);
      setCampaigns([]);
      setBrands([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [activeBrandId]);

  const deposit = async () => {
    setBusy(true);
    try {
      const { url } = await startAdvertiserDeposit(depositAmount);
      window.location.href = url;
    } finally {
      setBusy(false);
    }
  };

  const addBrand = async () => {
    if (!newBrandName.trim()) return;
    setBusy(true);
    try {
      await createAdvertiserBrand(newBrandName.trim());
      setNewBrandName("");
      setShowAddBrand(false);
      await load();
    } finally {
      setBusy(false);
    }
  };

  if (subView === "partner" && isPartner) {
    return (
      <div className="space-y-6">
        <SubNav subView={subView} isPartner={isPartner} onSubView={setSubView} />
        <PartnerDashboardPanel />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SubNav subView={subView} isPartner={isPartner} onSubView={setSubView} />

      <PartnerDashboardShell eyebrow="Advertiser portal" title="Campaigns & analytics">
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: "Balance", value: `$${balance.toFixed(2)}` },
            { label: "Spend", value: `$${(summary?.spend ?? campaigns.reduce((s, c) => s + c.spend, 0)).toFixed(2)}` },
            { label: "Impressions", value: (summary?.impressions ?? 0).toLocaleString() },
            { label: "Clicks", value: (summary?.clicks ?? 0).toLocaleString() },
            { label: "CTR", value: `${((summary?.ctr ?? 0) * 100).toFixed(2)}%` },
          ].map((k) => (
            <div key={k.label} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{k.label}</p>
              <p className="mt-2 text-2xl font-bold text-zinc-900">{k.value}</p>
            </div>
          ))}
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-zinc-200 pb-4">
          <button
            type="button"
            onClick={() => setActiveBrandId(null)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
              activeBrandId === null ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-700"
            }`}
          >
            All brands
          </button>
          {brands.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setActiveBrandId(b.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                activeBrandId === b.id ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-700"
              }`}
            >
              {b.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowAddBrand(true)}
            className="rounded-full border border-dashed border-zinc-300 px-4 py-1.5 text-sm font-semibold text-zinc-600 hover:border-emerald-400"
          >
            + Add brand
          </button>
        </div>

        {showAddBrand ? (
          <div className="mb-6 flex flex-wrap gap-3 rounded-2xl border border-zinc-200 bg-white p-4">
            <input
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              placeholder="Brand name"
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => void addBrand()}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Save brand
            </button>
            <button type="button" onClick={() => setShowAddBrand(false)} className="text-sm text-zinc-500">
              Cancel
            </button>
          </div>
        ) : null}

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
          <button
            type="button"
            onClick={() => setShowLaunchForm((v) => !v)}
            className="ml-auto text-sm font-semibold text-emerald-700 hover:underline"
          >
            {showLaunchForm ? "Hide launch options" : "Launch new campaign →"}
          </button>
        </div>

        {showLaunchForm ? (
          <div className="mb-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <CountryPicker selected={launchCountries} onChange={setLaunchCountries} />
            <p className="mt-4 text-sm text-zinc-600">
              Selected: {formatCountryList(launchCountries)}
            </p>
            <Link
              to={`/advertisers#launch${activeBrandId ? `?brand=${activeBrandId}` : ""}`}
              className="mt-4 inline-block rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white"
              onClick={() => {
                if (launchCountries.length) {
                  sessionStorage.setItem("aibc_launch_countries", JSON.stringify(launchCountries));
                }
                if (activeBrandId) sessionStorage.setItem("aibc_launch_brand", activeBrandId);
              }}
            >
              Continue to campaign form
            </Link>
          </div>
        ) : null}

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
                    <th className="px-5 py-3">Geo</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Impressions</th>
                    <th className="px-5 py-3">Spend</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c) => (
                    <tr key={c.id} className="border-t border-zinc-100">
                      <td className="px-5 py-3 font-medium">{c.brandName || "—"}</td>
                      <td className="max-w-xs truncate px-5 py-3 text-zinc-600">{c.adLine}</td>
                      <td className="px-5 py-3 text-xs text-zinc-500">
                        {formatCountryList(c.targetCountries || [])}
                      </td>
                      <td className="px-5 py-3 capitalize">{c.status}</td>
                      <td className="px-5 py-3">{c.impressions?.toLocaleString() ?? 0}</td>
                      <td className="px-5 py-3">${(c.spend ?? 0).toFixed(2)}</td>
                      <td className="px-5 py-3">
                        <Link
                          to={`/dashboard/advertiser/campaigns/${c.id}`}
                          className="font-semibold text-emerald-700 hover:underline"
                        >
                          Analytics
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </PartnerDashboardShell>
    </div>
  );
}

function SubNav({
  subView,
  isPartner,
  onSubView,
}: {
  subView: SubView;
  isPartner: boolean;
  onSubView: (v: SubView) => void;
}) {
  if (!isPartner) return null;
  return (
    <div className="flex gap-2">
      {(["campaigns", "partner"] as SubView[]).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onSubView(v)}
          className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize ${
            subView === v ? "bg-emerald-600 text-white" : "bg-white text-zinc-700 ring-1 ring-zinc-200"
          }`}
        >
          {v === "partner" ? "Partner program" : "Campaigns"}
        </button>
      ))}
    </div>
  );
}
