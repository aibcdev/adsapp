import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { startCampaignCheckout } from "../../lib/api";
import { BrandHeading } from "../brand/BrandHeading";
import { BrandAccent } from "../brand/BrandAccent";
import { CompactQueue, MarketTable } from "./BidMarket";
import type { LeaderboardRow } from "./TickerTape";
import type { PricePoint } from "./PriceChart";
import { PriceChart } from "./PriceChart";

const BLOCK_IMPRESSIONS = 1000;
const MAX_ICON_BYTES = 64 * 1024;

function money(n: number) {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const labelClass = "block font-mono text-[10px] uppercase tracking-wider text-zinc-500";
const inputClass =
  "mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 font-mono text-sm text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/20";

export function AdvertiserBidSection({
  rows,
  liveCount,
  topBid,
  points,
}: {
  rows: LeaderboardRow[];
  liveCount: number;
  topBid: number;
  points: PricePoint[];
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [adLine, setAdLine] = useState("");
  const [destUrl, setDestUrl] = useState("https://");
  const [brand, setBrand] = useState("");
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [iconName, setIconName] = useState("");
  const [bidPerBlock, setBidPerBlock] = useState("5.00");
  const [blocks, setBlocks] = useState("1");
  const [leaderboard, setLeaderboard] = useState(true);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const bidPerBlockN = parseFloat(bidPerBlock) || 0;
  const blocksN = Math.max(1, parseInt(blocks, 10) || 1);
  const cpmN = (bidPerBlockN * 1000) / BLOCK_IMPRESSIONS;
  const total = bidPerBlockN * blocksN;
  const totalImps = blocksN * BLOCK_IMPRESSIONS;
  const toGo = topBid > 0 && cpmN <= topBid ? topBid - cpmN + 0.01 : 0;

  const onIconFile = (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_ICON_BYTES) {
      setErr("Brand icon must be 64 KB or smaller (PNG, JPG, or WebP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setIconUrl(typeof reader.result === "string" ? reader.result : null);
      setIconName(file.name);
      setErr("");
    };
    reader.readAsDataURL(file);
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await startCampaignCheckout({
        buyer_email: email.trim(),
        ad_line: adLine.trim(),
        destination_url: destUrl.trim(),
        brand: brand.trim() || null,
        icon_url: iconUrl,
        cpm_usd: cpmN,
        blocks: blocksN,
        optin_leaderboard: leaderboard,
        bid_usd: bidPerBlockN,
      });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Checkout failed");
      setBusy(false);
    }
  };

  return (
    <section id="launch" className="scroll-mt-24 border-t border-zinc-200 bg-white py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-emerald-700">Advertisers</p>
        <BrandHeading className="mt-3 font-brand-heading text-3xl text-zinc-950 md:text-4xl lg:text-5xl">
          Bid live for the most-watched <BrandAccent>spinner</BrandAccent> on Earth.
        </BrandHeading>
        <p className="mt-4 max-w-3xl text-base font-medium leading-relaxed text-zinc-600 md:text-lg">
          Each block buys 1,000 five-second impressions in the AI coding spinner. Clicks are billed at 50× the
          impression rate. Highest bid serves first — bid from $1. Outbid the top to take #1, or queue behind it.{" "}
          <strong className="text-zinc-900">70% of every dollar</strong> goes to the developer whose machine showed the ad.
        </p>

        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-5">
            <div className="aibc-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-zinc-900">Bid queue</p>
                <span className="font-mono text-[10px] uppercase text-zinc-400">{rows.length} live · updated now</span>
              </div>
              <CompactQueue rows={rows} />
            </div>
            <MarketTable rows={rows} liveCount={liveCount} />
            {points.length > 0 ? (
              <div className="aibc-card p-4">
                <PriceChart points={points} range="24h" />
              </div>
            ) : null}
          </div>

          <div className="lg:col-span-7">
            <form onSubmit={(e) => void submit(e)} className="space-y-5">
              <label className={labelClass}>
                Email (required)
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="you@example.com"
                />
              </label>

              <label className={labelClass}>
                <span className="flex items-center justify-between">
                  Ad line · 3–60 char
                  <span className="font-mono text-zinc-400">{adLine.length} / 60</span>
                </span>
                <input
                  required
                  minLength={3}
                  maxLength={60}
                  value={adLine}
                  onChange={(e) => setAdLine(e.target.value)}
                  className={inputClass}
                  placeholder="Try Linear — issue tracking built for speed"
                />
              </label>

              <label className={labelClass}>
                Destination URL (https://)
                <input
                  required
                  type="url"
                  value={destUrl}
                  onChange={(e) => setDestUrl(e.target.value)}
                  className={inputClass}
                  placeholder="https://linear.app/"
                />
              </label>

              <label className={labelClass}>
                Brand name (optional, shown on leaderboard)
                <input
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className={inputClass}
                  placeholder="Linear"
                />
              </label>

              <div>
                <span className={labelClass}>Brand icon (optional, PNG/JPG/WebP ≤ 64 KB)</span>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => onIconFile(e.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="mt-1 flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-sm text-zinc-500 transition hover:border-emerald-400 hover:bg-emerald-50/50"
                >
                  {iconName ? (
                    <>
                      <span className="font-medium text-zinc-800">{iconName}</span>
                      <span className="mt-1 text-xs">Click to replace</span>
                    </>
                  ) : (
                    "Drop an image here or click to browse"
                  )}
                </button>
              </div>

              <label className="flex items-center gap-2 text-sm text-zinc-700">
                <input
                  type="checkbox"
                  checked={leaderboard}
                  onChange={(e) => setLeaderboard(e.target.checked)}
                  className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                />
                Show me on the public leaderboard
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className={labelClass}>
                  Bid per block (min $1.00 — sets queue priority)
                  <input
                    required
                    type="number"
                    min={1}
                    step={0.01}
                    value={bidPerBlock}
                    onChange={(e) => setBidPerBlock(e.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className={labelClass}>
                  Number of blocks (1,000 views each)
                  <input
                    required
                    type="number"
                    min={1}
                    value={blocks}
                    onChange={(e) => setBlocks(e.target.value)}
                    className={inputClass}
                  />
                </label>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
                <p className="text-sm leading-relaxed text-zinc-700">
                  Each block buys <strong>1,000 views</strong> of your ad. More blocks = more views. A higher bid moves
                  you up the queue so your views deliver sooner — it does not add views.
                </p>
                <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-b border-emerald-200/80 pb-4">
                  <p className="font-mono text-xs uppercase tracking-wider text-zinc-500">
                    Estimated total · {blocksN} block{blocksN === 1 ? "" : "s"} at {money(bidPerBlockN)} ={" "}
                    {totalImps.toLocaleString()} views
                  </p>
                  <p className="font-brand-heading text-4xl text-zinc-950">{money(total)}</p>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[
                    { label: "per block", value: money(bidPerBlockN) },
                    { label: "blocks", value: String(blocksN) },
                    { label: "total views", value: totalImps.toLocaleString() },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-white bg-white px-3 py-2 text-center shadow-sm">
                      <p className="font-brand-heading text-lg text-zinc-950">{s.value}</p>
                      <p className="font-mono text-[9px] uppercase text-zinc-400">{s.label}</p>
                    </div>
                  ))}
                </div>
                {topBid > 0 ? (
                  <p className="mt-4 rounded-xl bg-white/80 px-4 py-3 text-xs leading-relaxed text-zinc-600">
                    Top bid is {money(topBid)} per block — bid above it to take #1, or any amount from $1.00 to join the
                    queue. Your bid sets where you rank, not how many views you get.
                    {toGo > 0 ? ` Suggest bidding at least ${money(topBid + 0.01)} to lead.` : null}
                  </p>
                ) : (
                  <p className="mt-4 rounded-xl bg-white/80 px-4 py-3 text-xs text-zinc-600">
                    No queued bids — first bid takes #1 instantly.
                  </p>
                )}
              </div>

              {err ? <p className="text-sm text-red-600">{err}</p> : null}

              <button
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 py-4 text-base font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {busy ? "Redirecting to Stripe…" : "Checkout now on Stripe"}
              </button>

              <p className="text-center text-xs text-zinc-500">
                Manage campaigns after payment —{" "}
                <Link to="/login" className="font-semibold text-emerald-700 underline">
                  sign in with Google
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
