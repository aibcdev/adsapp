import { useState } from "react";
import { startCampaignCheckout } from "../../lib/api";
import type { LeaderboardRow } from "./TickerTape";

const BLOCK_IMPRESSIONS = 1000;

function money(n: number) {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const inputClass =
  "mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 font-mono text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none";

export function BuyForm({
  topBid,
  defaultEmail,
}: {
  topBid: number;
  defaultEmail?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [email, setEmail] = useState(defaultEmail || "");
  const [adLine, setAdLine] = useState("");
  const [destUrl, setDestUrl] = useState("https://");
  const [brand, setBrand] = useState("");
  const [cpm, setCpm] = useState("5");
  const [blocks, setBlocks] = useState("1");
  const [leaderboard, setLeaderboard] = useState(true);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const cpmN = parseFloat(cpm) || 0;
  const blocksN = parseInt(blocks, 10) || 1;
  const bidPerBlock = (cpmN * BLOCK_IMPRESSIONS) / 1000;
  const total = bidPerBlock * blocksN;
  const totalImps = blocksN * BLOCK_IMPRESSIONS;

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
        cpm_usd: cpmN,
        blocks: blocksN,
        optin_leaderboard: leaderboard,
        bid_usd: bidPerBlock,
      });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Checkout failed");
      setBusy(false);
    }
  };

  return (
    <div className="aibc-card p-6">
      {!expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="w-full rounded-full bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-700"
        >
          Advertise now
        </button>
      ) : (
        <form onSubmit={(e) => void submit(e)} className="space-y-4">
          <h3 className="font-brand-heading text-xl text-zinc-950">Place your bid</h3>
          <p className="text-xs text-zinc-500">
            Email + Stripe checkout. No account needed to go live.{" "}
            <a href="/login" className="text-emerald-700 underline">
              Sign in later
            </a>{" "}
            to manage campaigns.
          </p>

          <label className="block text-xs text-zinc-500">
            Email (required)
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="you@example.com" />
          </label>

          <label className="block text-xs text-zinc-500">
            Ad line · 3–60 chars
            <input required minLength={3} maxLength={60} value={adLine} onChange={(e) => setAdLine(e.target.value)} className={inputClass} placeholder="Try Linear — issue tracking built for speed" />
          </label>

          <label className="block text-xs text-zinc-500">
            Destination URL (https://)
            <input required type="url" value={destUrl} onChange={(e) => setDestUrl(e.target.value)} className={inputClass} />
          </label>

          <label className="block text-xs text-zinc-500">
            Brand name (optional)
            <input value={brand} onChange={(e) => setBrand(e.target.value)} className={inputClass} placeholder="Linear" />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs text-zinc-500">
              Bid per 1k imps (min $1)
              <input required type="number" min={1} step={0.01} value={cpm} onChange={(e) => setCpm(e.target.value)} className={inputClass} />
            </label>
            <label className="block text-xs text-zinc-500">
              Blocks (1k views each)
              <input required type="number" min={1} value={blocks} onChange={(e) => setBlocks(e.target.value)} className={inputClass} />
            </label>
          </div>

          <label className="flex items-center gap-2 text-xs text-zinc-500">
            <input type="checkbox" checked={leaderboard} onChange={(e) => setLeaderboard(e.target.checked)} />
            Show on public leaderboard
          </label>

          <p className="font-mono text-xs text-zinc-500">
            {blocksN} block{blocksN === 1 ? "" : "s"} at {money(bidPerBlock)} = {totalImps.toLocaleString()} views · Total {money(total)}
          </p>
          {topBid > 0 && (
            <p className="font-mono text-xs text-emerald-400">Leader pays {money(topBid)}/1k — pay more to go first.</p>
          )}
          {err && <p className="text-sm text-red-400">{err}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-white py-3 font-semibold text-black disabled:opacity-50"
          >
            {busy ? "Redirecting to Stripe…" : "Checkout now on Stripe"}
          </button>
        </form>
      )}
    </div>
  );
}

export function CompactQueue({ rows }: { rows: LeaderboardRow[] }) {
  if (rows.length === 0) {
    return <p className="font-mono text-sm text-zinc-500">No active campaigns — checkout now to lead the board.</p>;
  }

  return (
    <ul className="space-y-2 font-mono text-xs">
      {rows.slice(0, 8).map((row) => (
        <li
          key={row.rank}
          className="flex flex-wrap items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2"
        >
          <span className="font-semibold text-emerald-700">{money(row.bid_usd)} / 1k</span>
          <span className="flex-1 truncate text-zinc-700">{row.ad_line}</span>
          <span
            className={
              row.status === "serving"
                ? "text-emerald-600"
                : row.status === "exhausted"
                  ? "text-red-500"
                  : "text-zinc-500"
            }
          >
            {row.status === "exhausted"
              ? "filled"
              : row.status === "serving"
                ? `live · ${row.impressions_remaining.toLocaleString()} imps`
                : "queued"}
          </span>
        </li>
      ))}
    </ul>
  );
}

function formatImpressions(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1000)}k`;
  return String(n);
}

export function MarketTable({
  rows,
  liveCount,
  variant = "light",
  showImpressions = false,
}: {
  rows: LeaderboardRow[];
  liveCount: number;
  variant?: "light" | "dark";
  showImpressions?: boolean;
}) {
  const dark = variant === "dark";
  const colSpan = showImpressions ? 5 : 4;

  return (
    <div
      className={
        dark
          ? "overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60"
          : "overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
      }
    >
      <div className={`flex items-center justify-between border-b px-4 py-3 ${dark ? "border-zinc-800" : "border-zinc-100"}`}>
        <p className={`text-sm font-semibold ${dark ? "text-zinc-200" : "text-zinc-900"}`}>
          <span className="text-emerald-500">{liveCount}</span> ads live
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] font-mono text-xs">
          <thead className={dark ? "bg-zinc-950/60 text-zinc-500" : "bg-zinc-50 text-zinc-500"}>
            <tr>
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2 text-left">Campaign</th>
              <th className="px-4 py-2 text-left">Bid / 1,000 imps</th>
              {showImpressions ? <th className="px-4 py-2 text-left">Impressions</th> : null}
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className={`px-4 py-6 text-center ${dark ? "text-zinc-500" : "text-zinc-400"}`}>
                  No campaigns yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const served = row.impressions_served ?? 0;
                const target = row.impressions_target ?? 0;
                const pct = target > 0 ? Math.min(100, (served / target) * 100) : 0;

                return (
                  <tr key={row.rank} className={dark ? "border-t border-zinc-800" : "border-t border-zinc-100"}>
                    <td className={`px-4 py-2 ${dark ? "text-zinc-500" : "text-zinc-500"}`}>{row.rank}</td>
                    <td className={`max-w-xs truncate px-4 py-2 ${dark ? "text-zinc-200" : "text-zinc-800"}`}>
                      {row.ad_line}
                    </td>
                    <td className={`px-4 py-2 ${dark ? "text-zinc-300" : "text-zinc-700"}`}>
                      ${row.bid_usd.toFixed(2)}
                    </td>
                    {showImpressions ? (
                      <td className="px-4 py-2">
                        <div className="flex min-w-[120px] flex-col gap-1">
                          <span className={dark ? "text-zinc-300" : "text-zinc-700"}>
                            {formatImpressions(served)} / {formatImpressions(target)}
                          </span>
                          <div className={`h-1.5 w-full overflow-hidden rounded-full ${dark ? "bg-zinc-800" : "bg-zinc-100"}`}>
                            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </td>
                    ) : null}
                    <td className="px-4 py-2">
                      {row.status === "serving" ? (
                        <span className="inline-flex items-center gap-1 text-emerald-500">
                          <span className="live-dot h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          LIVE
                        </span>
                      ) : row.status === "exhausted" ? (
                        <span className="text-red-400">FILLED</span>
                      ) : (
                        <span className={dark ? "text-zinc-500" : "text-zinc-500"}>
                          {row.status === "queued" ? "QUEUED" : row.status.toUpperCase()}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
