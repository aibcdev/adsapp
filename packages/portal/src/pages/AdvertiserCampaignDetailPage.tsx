import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { formatCountryList } from "../lib/countries";
import { fetchCampaignAnalytics, type CampaignAnalytics } from "../lib/advertiserApi";

function MiniBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="font-medium text-zinc-800">{label}</span>
        <span className="text-zinc-500">{value.toLocaleString()}</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-zinc-100">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function AdvertiserCampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<CampaignAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    void fetchCampaignAnalytics(id)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="app-shell min-h-screen bg-zinc-50">
        <SiteHeader />
        <p className="p-8 text-sm text-zinc-500">Loading analytics…</p>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="app-shell min-h-screen bg-zinc-50">
        <SiteHeader />
        <p className="p-8 text-sm text-zinc-600">
          Campaign not found.{" "}
          <Link to="/dashboard?tab=advertiser" className="font-semibold text-emerald-700 hover:underline">
            Back to dashboard
          </Link>
        </p>
      </div>
    );
  }

  const { campaign, totals, breakdowns, daily } = data;
  const countries = campaign.targetCountries ? (JSON.parse(campaign.targetCountries) as string[]) : [];
  const maxEditor = Math.max(...breakdowns.byEditor.map((x) => x.count), 1);
  const maxCountry = Math.max(...breakdowns.byCountry.map((x) => x.count), 1);
  const maxDaily = Math.max(...daily.map((d) => Math.max(d.impressions, d.clicks)), 1);

  return (
    <div className="app-shell min-h-screen bg-zinc-50">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-10 md:px-10">
    <div className="space-y-8">
      <div>
        <Link to="/dashboard?tab=advertiser" className="text-sm font-semibold text-emerald-700 hover:underline">
          ← All campaigns
        </Link>
        <h1 className="mt-3 font-brand-heading text-3xl text-zinc-950">{campaign.brandName || campaign.adLine}</h1>
        <p className="mt-1 text-sm text-zinc-600">{campaign.adLine}</p>
        <p className="mt-1 text-xs text-zinc-500">
          Targeting: {formatCountryList(countries)} · Status: {campaign.status}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Impressions", value: totals.impressions.toLocaleString() },
          { label: "Clicks", value: totals.clicks.toLocaleString() },
          { label: "CTR", value: `${(totals.ctr * 100).toFixed(2)}%` },
          { label: "Spend", value: `$${totals.spend.toFixed(2)}` },
          { label: "Avg CPM", value: `$${totals.avgCpm.toFixed(2)}` },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{k.label}</p>
            <p className="mt-2 text-2xl font-bold text-zinc-900">{k.value}</p>
          </div>
        ))}
      </div>

      {daily.length > 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-zinc-900">Daily performance (30 days)</h2>
          <div className="mt-4 space-y-3">
            {daily.slice(-14).map((d) => (
              <div key={d.date} className="grid grid-cols-[5rem_1fr_1fr] items-center gap-3 text-sm">
                <span className="text-zinc-500">{d.date.slice(5)}</span>
                <MiniBar label="Imps" value={d.impressions} max={maxDaily} />
                <MiniBar label="Clicks" value={d.clicks} max={maxDaily} />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-zinc-900">Clicks by editor</h2>
          <div className="mt-4 space-y-3">
            {breakdowns.byEditor.length === 0 ? (
              <p className="text-sm text-zinc-500">No clicks yet</p>
            ) : (
              breakdowns.byEditor.map((row) => (
                <MiniBar key={row.key} label={row.key} value={row.count} max={maxEditor} />
              ))
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-zinc-900">Clicks by country</h2>
          <div className="mt-4 space-y-3">
            {breakdowns.byCountry.length === 0 ? (
              <p className="text-sm text-zinc-500">No clicks yet</p>
            ) : (
              breakdowns.byCountry.map((row) => (
                <MiniBar key={row.key} label={row.key} value={row.count} max={maxCountry} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
      </main>
      <SiteFooter />
    </div>
  );
}
