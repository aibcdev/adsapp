import { Hono } from "hono";
import type { Database as DbType } from "better-sqlite3";

const BLOCK_IMPRESSIONS = 1000;
const ROTATION_DEPTH = 5;

type CampaignRow = {
  id: string;
  ad_line: string;
  destination_url: string;
  brand_name: string | null;
  bid_per_1k: number;
  blocks: number;
  show_on_leaderboard: number;
  status: string;
  impressions: number;
  spend: number;
  created_at: number;
  payment_status: string;
  impressions_target: number;
  impressions_served: number;
};

function impsPerMinute(db: DbType): number {
  const since = Date.now() - 60_000;
  const row = db
    .prepare(
      "SELECT COUNT(*) as c FROM impressions WHERE demo = 0 AND created_at > ?",
    )
    .get(since) as { c: number };
  const measured = row.c;
  if (measured > 0) return measured;
  const active = db
    .prepare(
      "SELECT COUNT(*) as c FROM campaigns WHERE status = 'active' AND payment_status = 'paid'",
    )
    .get() as { c: number };
  return Math.max(120, active.c * 400);
}

function leaderboardRows(db: DbType, limit: number) {
  const rows = db
    .prepare(`
      SELECT id, ad_line, destination_url, brand_name, bid_per_1k, blocks,
             show_on_leaderboard, status, impressions, spend, created_at,
             payment_status, impressions_target, impressions_served
      FROM campaigns
      WHERE payment_status = 'paid' AND show_on_leaderboard = 1
      ORDER BY bid_per_1k DESC, created_at ASC
      LIMIT ?
    `)
    .all(limit) as CampaignRow[];

  return rows.map((row, i) => {
    const target = row.impressions_target || row.blocks * BLOCK_IMPRESSIONS;
    const served = row.impressions_served || row.impressions || 0;
    const remaining = Math.max(0, target - served);
    const bidPerBlock = (row.bid_per_1k * BLOCK_IMPRESSIONS) / 1000;
    let status = row.status;
    if (remaining <= 0) status = "exhausted";
    else if (i < ROTATION_DEPTH) status = "serving";
    else status = "queued";

    return {
      rank: i + 1,
      id: row.id,
      display_name: row.brand_name || row.ad_line.slice(0, 32),
      ad_line: row.ad_line,
      bid_usd: row.bid_per_1k,
      bid_per_block: bidPerBlock,
      impressions_remaining: remaining,
      impressions_served: served,
      impressions_target: target,
      block_count: row.blocks,
      status,
      created_at: new Date(row.created_at).toISOString(),
    };
  });
}

function priceHistoryPoints(db: DbType, days: number) {
  const since = Date.now() - days * 86_400_000;
  const rows = db
    .prepare(`
      SELECT bid_per_1k, brand_name, ad_line, status, created_at
      FROM campaigns
      WHERE payment_status = 'paid' AND created_at > ?
      ORDER BY created_at ASC
    `)
    .all(since) as Array<{
      bid_per_1k: number;
      brand_name: string | null;
      ad_line: string;
      status: string;
      created_at: number;
    }>;

  let peak = 1;
  const points = rows.map((r) => {
    peak = Math.max(peak, r.bid_per_1k);
    return {
      ts: new Date(r.created_at).toISOString(),
      bid_usd: peak,
      display_name: r.brand_name || r.ad_line.slice(0, 24),
      status: r.status === "active" ? "market" : r.status,
    };
  });

  if (points.length === 0) {
    points.push({
      ts: new Date().toISOString(),
      bid_usd: 5,
      display_name: "aibc",
      status: "market",
    });
  }

  return points;
}

export function auctionRoutes(db: DbType) {
  const app = new Hono();

  app.get("/v1/auction/leaderboard", (c) => {
    const limit = Math.min(50, Math.max(1, Number(c.req.query("limit") || 15)));
    const top = leaderboardRows(db, limit);
    const serving = top.filter((r) => r.status === "serving").length;
    const queued = top.filter((r) => r.status === "queued").length;
    const ipm = impsPerMinute(db);

    return c.json({
      top,
      serving_count: serving,
      rotation_depth: ROTATION_DEPTH,
      queued_count: queued,
      imps_per_min: ipm,
    });
  });

  app.get("/v1/auction/price-history", (c) => {
    const days = Math.min(30, Math.max(1, Number(c.req.query("days") || 30)));
    return c.json({ points: priceHistoryPoints(db, days) });
  });

  app.get("/v1/stats/earnings-estimate", (c) => {
    const ipm = impsPerMinute(db);
    const active = db
      .prepare(
        "SELECT COUNT(*) as c FROM campaigns WHERE status = 'active' AND payment_status = 'paid'",
      )
      .get() as { c: number };
    const fromTraffic = Math.round(ipm * 0.007 * 100) / 100;
    const fromDemand = Math.round((40 + active.c * 18) * 100) / 100;
    const monthlyUsd = Math.max(40, fromTraffic, fromDemand);
    return c.json({ monthlyUsd, imps_per_min: ipm, developer_share: 0.7 });
  });

  app.get("/v1/bulletin", (c) => {
    return c.json({
      active: true,
      id: "2026-06-aibc-launch",
      tag: "PSA · Service bulletin",
      ts: "Jun 2026 · aibc launch",
      headline: "aibc is live — install the extension and start earning.",
      items: [
        {
          ts: "Now",
          text: "VS Code, Cursor, Windsurf, and VSCodium supported via Marketplace + Open VSX.",
        },
        {
          ts: "Now",
          text: "Advertisers can bid live on the homepage — Stripe checkout, no account required.",
        },
        {
          ts: "Now",
          text: "Developers earn 70% of ad revenue — higher than kickbacks.",
        },
        {
          ts: "Now",
          text: "Payouts: 72h settlement hold, then cash out via PayPal, Wise, or UPI.",
        },
      ],
    });
  });

  return app;
}

export { BLOCK_IMPRESSIONS, leaderboardRows, impsPerMinute, priceHistoryPoints };
