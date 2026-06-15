import { useEffect, useState } from "react";
import { AdminGate } from "../../components/admin/AdminGate";
import { BidMarketPanel } from "../../components/admin/BidMarketPanel";
import { adminFetch } from "../../lib/adminApi";
import type { PricePoint } from "../../components/landing/PriceChart";
import type { LeaderboardRow } from "../../components/landing/TickerTape";

type Overview = {
  kpis: {
    usersSignedUp: number;
    usersNew7d: number;
    advertisers: number;
    totalSpend: number;
    topBid: number;
    liveAds: number;
    impressionsPerMin: number;
    impressionsToday: number;
    pendingPayoutTotal: number;
    pendingPayoutCount: number;
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
    buyer_email: string | null;
    bid_usd: number;
    spend: number;
    impressions_served: number;
    impressions_target: number;
    status: string;
  }>;
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

  const campaignRows: LeaderboardRow[] = data.campaigns.map((c, i) => ({
    rank: i + 1,
    display_name: c.ad_line.slice(0, 32),
    ad_line: c.ad_line,
    bid_usd: c.bid_usd,
    impressions_remaining: Math.max(0, c.impressions_target - c.impressions_served),
    impressions_served: c.impressions_served,
    impressions_target: c.impressions_target,
    status: c.status,
  }));

  const k = data.kpis;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-instrument-serif text-2xl text-white">Overview</h2>
        <p className="mt-1 text-sm text-zinc-500">Live network stats — refreshes every 15s</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <KpiCard label="Users signed up" value={k.usersSignedUp.toLocaleString()} sub={`+${k.usersNew7d} this week`} />
        <KpiCard label="Advertisers" value={k.advertisers.toLocaleString()} />
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
      </div>

      <BidMarketPanel
        topBid={data.bidMarket.top_bid || k.topBid}
        liveCount={data.bidMarket.serving_count}
        impsPerMin={data.bidMarket.imps_per_min}
        points={data.pricePoints}
        rows={campaignRows}
        showImpressions
      />
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
