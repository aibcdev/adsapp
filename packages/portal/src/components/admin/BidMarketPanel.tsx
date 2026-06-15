import { useState } from "react";
import { PriceChart, type PricePoint } from "../landing/PriceChart";
import { MarketTable } from "../landing/BidMarket";
import type { LeaderboardRow } from "../landing/TickerTape";

export function BidMarketPanel({
  topBid,
  liveCount,
  impsPerMin,
  points,
  rows,
  showImpressions = false,
}: {
  topBid: number;
  liveCount: number;
  impsPerMin: number;
  points: PricePoint[];
  rows: LeaderboardRow[];
  showImpressions?: boolean;
}) {
  const [range, setRange] = useState<"24h" | "all">("24h");

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-emerald-500">
            Bid market
          </p>
          <p className="mt-2 font-brand-heading text-3xl text-white md:text-4xl">
            ${topBid.toFixed(2)}
            <span className="ml-2 text-sm font-normal text-zinc-500">per 1,000 impressions</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-full border border-zinc-700 p-0.5">
            {(["24h", "all"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase ${
                  range === r ? "bg-emerald-600 text-white" : "text-zinc-400"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-[10px] uppercase text-emerald-400">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {liveCount} ads live
          </span>
        </div>
      </div>

      <div className="relative mt-6">
        <PriceChart points={points} range={range} />
        <p className="absolute bottom-2 right-2 rounded-full border border-zinc-700 bg-zinc-950/80 px-3 py-1 font-mono text-[10px] text-zinc-400">
          {(impsPerMin / 1000).toFixed(1)}k imps/min across the fleet
        </p>
      </div>

      <div className="mt-6">
        <MarketTable
          rows={rows}
          liveCount={liveCount}
          variant="dark"
          showImpressions={showImpressions}
        />
      </div>
    </div>
  );
}
