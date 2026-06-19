import { AdminGate } from "../../components/admin/AdminGate";
import { MarketplaceDownloadsPanel } from "../../components/admin/MarketplaceDownloadsPanel";
import { ADMIN_ALTERNATE } from "../../lib/adminAlternateData";

function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
      <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-2 font-brand-heading text-2xl text-white">{value}</p>
      {sub ? <p className="mt-1 text-xs text-zinc-500">{sub}</p> : null}
    </div>
  );
}

function AdminAlternateInner() {
  const k = ADMIN_ALTERNATE.kpis;
  const downloads = {
    ...ADMIN_ALTERNATE.downloads,
    lastSyncedAt: ADMIN_ALTERNATE.syncedAt,
    marketplaces: ADMIN_ALTERNATE.downloads.marketplaces.map((m) => ({
      ...m,
      lastSyncedAt: ADMIN_ALTERNATE.syncedAt,
    })),
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-instrument-serif text-2xl text-white">Admin alternate</h2>
        <p className="mt-1 text-sm text-zinc-500">Network overview — presentation view</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <KpiCard
          label="Users signed up"
          value={k.usersSignedUp.toLocaleString()}
          sub={`+${k.usersNew7d} this week`}
        />
        <KpiCard label="Paying advertisers" value={k.advertisers.toLocaleString()} />
        <KpiCard
          label="Total ad spend"
          value={`$${k.totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        />
        <KpiCard label="Live ads" value={String(k.liveAds)} />
        <KpiCard
          label="Impressions"
          value={`${k.impressionsPerMin.toLocaleString()}/min`}
          sub={`${k.impressionsToday.toLocaleString()} today`}
        />
        <KpiCard
          label="Pending payouts"
          value={`$${k.pendingPayoutTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          sub={`${k.pendingPayoutCount} requests`}
        />
      </div>

      <MarketplaceDownloadsPanel downloads={downloads} />
    </div>
  );
}

export function AdminAlternateOverviewPage() {
  return (
    <AdminGate>
      <AdminAlternateInner />
    </AdminGate>
  );
}
