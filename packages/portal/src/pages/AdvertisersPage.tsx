import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { publicApi } from "../lib/api";
import { capturePartnerFromUrl } from "../lib/partnerRef";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { AibcAdvertisersMarketing } from "../components/aibc/AibcAdvertisersMarketing";
import { AdvertiserBidSection } from "../components/landing/AdvertiserBidSection";
import { TickerTape, type LeaderboardRow } from "../components/landing/TickerTape";
import { type PricePoint } from "../components/landing/PriceChart";

type Board = {
  top: LeaderboardRow[];
  serving_count: number;
  imps_per_min: number;
};

export function AdvertisersPage() {
  const [params] = useSearchParams();
  const purchase = params.get("purchase");
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [board, setBoard] = useState<Board | null>(null);
  const [points, setPoints] = useState<PricePoint[]>([]);
  const [topBid, setTopBid] = useState(0);

  useEffect(() => {
    capturePartnerFromUrl(window.location.search);
  }, []);

  useEffect(() => {
    const load = () => {
      void publicApi<Board>("/v1/auction/leaderboard?limit=15").then((b) => {
        setBoard(b);
        setRows(b.top || []);
        setTopBid(b.top?.[0]?.bid_usd ?? 0);
      });
      void publicApi<{ points: PricePoint[] }>("/v1/auction/price-history?days=30").then((h) => {
        setPoints(h.points || []);
      });
    };
    load();
    const id = setInterval(load, 15_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="app-shell">
      <TickerTape rows={rows} />
      <SiteHeader />

      {purchase === "success" ? (
        <div className="border-b border-emerald-200 bg-emerald-50 px-6 py-3 text-center text-sm text-emerald-800">
          Payment received — your campaign will appear on the live auction shortly.
        </div>
      ) : purchase === "cancel" ? (
        <div className="border-b border-zinc-200 bg-white px-6 py-3 text-center text-sm text-zinc-600">
          Checkout cancelled.{" "}
          <Link to="/advertisers#launch" className="text-emerald-700 underline">
            Try again
          </Link>
        </div>
      ) : null}

      <AibcAdvertisersMarketing
        afterHero={
          <AdvertiserBidSection
            rows={rows}
            liveCount={board?.serving_count ?? 0}
            topBid={topBid}
            points={points}
          />
        }
      />

      <SiteFooter />
    </div>
  );
}
