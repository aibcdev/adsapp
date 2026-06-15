import { useEffect, useState } from "react";
import { AdminGate } from "../../components/admin/AdminGate";
import { AdminCampaignsPanel } from "../../components/admin/AdminCampaignsPanel";
import { BidMarketPanel } from "../../components/admin/BidMarketPanel";
import { MarketplaceDownloadsPanel } from "../../components/admin/MarketplaceDownloadsPanel";
import { adminFetch } from "../../lib/adminApi";
import type { PricePoint } from "../../components/landing/PriceChart";
import type { LeaderboardRow } from "../../components/landing/TickerTape";

type Overview = {
  kpis: {
    usersSignedUp: number;
    usersNew7d: number;
    advertisers: number;
    sampleCampaigns: number;
    totalSpend: number;
    topBid: number;
    liveAds: number;
    impressionsPerMin: number;
    impressionsToday: number;
    pendingPayoutTotal: number;
    pendingPayoutCount: number;
    usdPerAgentHour?: number;
    activeAgentsLastHour?: number;
    targetUsdPerAgentHour?: number;
  };
  bidMarket: {
    top_bid: number;
    serving_count: number;
    imps_per_min: number;
    leaderboard: LeaderboardRow[];
  };
  pricePoints: PricePoint[];
  campaigns: Array<{
    id: string;
    ad_line: string;
    brand_name: string | null;
    buyer_email: string | null;
    bid_usd: number;
    spend: number;
    impressions_served: number;
    impressions_target: number;
    status: string;
    isSample: boolean;
  }>;
  downloads: {
    marketplaces: Array<{
      id: string;
      label: string;
      note: string;
      total: number;
      today: number | null;
      week: number | null;
      month: number | null;
      lastSyncedAt: number | null;
      error?: string;
    }>;
    totals: { total: number; today: number | null; week: number | null; month: number | null };
    lastSyncedAt: number | null;
  };
};

function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
      <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-2 font-brand-heading text-2xl text-white">{value}</p>
      {sub ? <p className="mt-1 text-xs text-zinc-500">{sub}</p> : null}
    </div>
  );
}

function OverviewInner() {
  const [data, setData] = useState<Overview | null>(null);
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      const res = await adminFetch("/v1/admin/overview");
      const body = (await res.json()) as Overview | { error?: string };
      if (!res.ok) throw new Error("error" in body ? body.error : "Failed to load");
      setData(body as Overview);
      setErr("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load");
    }
  };

  useEffect(() => {
    void load();
    const id = setInterval(() => void load(), 15_000);
    return () => clearInterval(id);
  }, []);

  if (err && !data) return <p className="text-sm text-red-400">{err}</p>;
  if (!data) return <p className="text-sm text-zinc-500">Loading overview…</p>;

  const campaignRows: LeaderboardRow[] = data.bidMarket.leaderboard.map((r) => ({
    ...r,
    impressions_served: r.impressions_served ?? 0,
    impressions_target: r.impressions_target ?? 0,
  }));

  const k = data.kpis;
  const sampleNote =
    k.sampleCampaigns > 0
      ? `Sample: WOODS (demo only)`
      : undefined;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-instrument-serif text-2xl text-white">Overview</h2>
        <p className="mt-1 text-sm text-zinc-500">Live network stats — refreshes every 15s</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <KpiCard label="Users signed up" value={k.usersSignedUp.toLocaleString()} sub={`+${k.usersNew7d} this week`} />
        <KpiCard
          label="Paying advertisers"
          value={k.advertisers.toLocaleString()}
          sub={sampleNote}
        />
        <KpiCard label="Total ad spend" value={`$${k.totalSpend.toFixed(2)}`} />
        <KpiCard label="Live ads" value={String(k.liveAds)} />
        <KpiCard
          label="Impressions"
          value={k.impressionsPerMin.toLocaleString() + "/min"}
          sub={`${k.impressionsToday.toLocaleString()} today`}
        />
        <KpiCard
          label="Pending payouts"
          value={`$${k.pendingPayoutTotal.toFixed(2)}`}
          sub={`${k.pendingPayoutCount} requests`}
        />
        <KpiCard
          label="$/agent/hr"
          value={`$${(k.usdPerAgentHour ?? 0).toFixed(2)}`}
          sub={`Target $${(k.targetUsdPerAgentHour ?? 1).toFixed(2)} · ${k.activeAgentsLastHour ?? 0} active`}
        />
      </div>

      {data.downloads ? <MarketplaceDownloadsPanel downloads={data.downloads} /> : null}

      <BidMarketPanel
        topBid={data.bidMarket.top_bid || k.topBid}
        liveCount={data.bidMarket.serving_count}
        impsPerMin={data.bidMarket.imps_per_min}
        points={data.pricePoints}
        rows={campaignRows}
        showImpressions
      />

      <AdminCampaignsPanel campaigns={data.campaigns} />
    </div>
  );
}

export function AdminOverviewPage() {
  return (
    <AdminGate>
      <OverviewInner />
    </AdminGate>
  );
}
