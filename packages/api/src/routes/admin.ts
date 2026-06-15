import { Hono } from "hono";
import type { Database as DbType } from "better-sqlite3";
import { isAdminEmail } from "../config.js";
import { resolveClient } from "../db/schema.js";
import { FOUNDING_MEMBER_CAP, payoutLimitsConfig } from "../billing/economics.js";
import {
  BLOCK_IMPRESSIONS,
  impsPerMinute,
  leaderboardRows,
  priceHistoryPoints,
} from "./auction.js";
import {
  getMarketplaceDownloadStats,
  refreshMarketplaceSnapshots,
} from "../marketplace/stats.js";
import { isSeedCampaignClient } from "../billing/seedInventory.js";
import { computeYieldMetrics } from "../stats/yield.js";

const REAL_CAMPAIGN_SQL = "payment_status = 'paid' AND client_id != 'seed'";

function requireAdminEmail(
  db: DbType,
  c: { req: { header: (name: string) => string | undefined } },
) {
  const client = resolveClient(db, c.req.header("authorization"));
  if (!client) {
    return { ok: false as const, status: 401 as const, error: "Sign in required" };
  }
  if (!isAdminEmail(client.email)) {
    return { ok: false as const, status: 403 as const, error: "Admin access denied" };
  }
  return { ok: true as const, client };
}

function allPaidCampaigns(db: DbType) {
  const onBoard = leaderboardRows(db, 200);
  const statusById = new Map(onBoard.map((r) => [r.id, r.status]));

  const rows = db
    .prepare(`
      SELECT id, client_id, ad_line, brand_name, bid_per_1k, blocks, status, spend,
             buyer_email, created_at, impressions_target, impressions_served, impressions,
             show_on_leaderboard, payment_status
      FROM campaigns
      WHERE payment_status = 'paid'
      ORDER BY bid_per_1k DESC, created_at ASC
    `)
    .all() as Array<{
      id: string;
      client_id: string;
      ad_line: string;
      brand_name: string | null;
      bid_per_1k: number;
      blocks: number;
      status: string;
      spend: number;
      buyer_email: string | null;
      created_at: number;
      impressions_target: number;
      impressions_served: number;
      impressions: number;
      show_on_leaderboard: number;
      payment_status: string;
    }>;

  return rows.map((row) => {
    const target = row.impressions_target || row.blocks * BLOCK_IMPRESSIONS;
    const served = row.impressions_served || row.impressions || 0;
    const remaining = Math.max(0, target - served);
    let deliveryStatus = statusById.get(row.id);
    if (deliveryStatus === undefined) {
      deliveryStatus = remaining <= 0 ? "exhausted" : row.show_on_leaderboard ? "hidden" : "off_board";
    }

    const isSample = isSeedCampaignClient(row.client_id);

    return {
      id: row.id,
      ad_line: row.ad_line,
      brand_name: row.brand_name,
      buyer_email: row.buyer_email,
      bid_usd: row.bid_per_1k,
      spend: row.spend,
      impressions_served: served,
      impressions_target: target,
      status: deliveryStatus,
      created_at: new Date(row.created_at).toISOString(),
      isSample,
    };
  });
}

export function adminRoutes(db: DbType) {
  const app = new Hono();

  app.get("/v1/admin/me", (c) => {
    const gate = requireAdminEmail(db, c);
    if (!gate.ok) return c.json({ error: gate.error }, gate.status);
    return c.json({ email: gate.client.email, isAdmin: true });
  });

  app.get("/v1/admin/overview", async (c) => {
    const gate = requireAdminEmail(db, c);
    if (!gate.ok) return c.json({ error: gate.error }, gate.status);

    const sync = await refreshMarketplaceSnapshots(db);
    const downloads = getMarketplaceDownloadStats(db, sync.errors);

    const since7d = Date.now() - 7 * 86_400_000;
    const sinceToday = Date.now() - 24 * 60 * 60 * 1000;

    const usersSignedUp = db
      .prepare("SELECT COUNT(*) as c FROM clients WHERE email IS NOT NULL AND email != ''")
      .get() as { c: number };

    const usersNew7d = db
      .prepare(
        "SELECT COUNT(*) as c FROM clients WHERE email IS NOT NULL AND email != '' AND created_at > ?",
      )
      .get(since7d) as { c: number };

    const advertisers = db
      .prepare(
        `SELECT COUNT(DISTINCT COALESCE(buyer_email, client_id)) as c
         FROM campaigns WHERE ${REAL_CAMPAIGN_SQL}`,
      )
      .get() as { c: number };

    const sampleCampaigns = db
      .prepare(
        `SELECT COUNT(*) as c FROM campaigns WHERE payment_status = 'paid' AND client_id = 'seed'`,
      )
      .get() as { c: number };

    const spendRow = db
      .prepare(`SELECT COALESCE(SUM(spend), 0) as total FROM campaigns WHERE ${REAL_CAMPAIGN_SQL}`)
      .get() as { total: number };

    const pending = db
      .prepare(
        `SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count
         FROM payouts WHERE status = 'requested'`,
      )
      .get() as { total: number; count: number };

    const impressionsToday = db
      .prepare(
        "SELECT COUNT(*) as c FROM impressions WHERE demo = 0 AND created_at > ?",
      )
      .get(sinceToday) as { c: number };

    const leaderboard = leaderboardRows(db, 50, { excludeSeed: true });
    const servingCount = leaderboard.filter((r) => r.status === "serving").length;
    const ipm = impsPerMinute(db);
    const topBid = leaderboard[0]?.bid_usd ?? 0;
    const campaigns = allPaidCampaigns(db);
    const yieldMetrics = computeYieldMetrics(db);

    return c.json({
      kpis: {
        usersSignedUp: usersSignedUp.c,
        usersNew7d: usersNew7d.c,
        advertisers: advertisers.c,
        sampleCampaigns: sampleCampaigns.c,
        totalSpend: spendRow.total,
        topBid,
        liveAds: servingCount,
        impressionsPerMin: ipm,
        impressionsToday: impressionsToday.c,
        pendingPayoutTotal: pending.total,
        pendingPayoutCount: pending.count,
        usdPerAgentHour: yieldMetrics.usdPerAgentHour,
        activeAgentsLastHour: yieldMetrics.activeAgentsLastHour,
        targetUsdPerAgentHour: yieldMetrics.targetUsdPerAgentHour,
      },
      bidMarket: {
        top_bid: topBid,
        serving_count: servingCount,
        imps_per_min: ipm,
        leaderboard,
      },
      pricePoints: priceHistoryPoints(db, 30, { excludeSeed: true }),
      campaigns,
      downloads,
      yield: yieldMetrics,
    });
  });

  app.get("/v1/admin/stats", (c) => {
    const gate = requireAdminEmail(db, c);
    if (!gate.ok) return c.json({ error: gate.error }, gate.status);

    const pending = db
      .prepare(
        `SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count
         FROM payouts WHERE status = 'requested'`,
      )
      .get() as { total: number; count: number };

    const users = db.prepare("SELECT COUNT(*) as c FROM clients").get() as { c: number };
    const founding = db
      .prepare("SELECT COUNT(*) as c FROM clients WHERE founding_member = 1")
      .get() as { c: number };

    return c.json({
      pendingPayoutTotal: pending.total,
      pendingPayoutCount: pending.count,
      userCount: users.c,
      foundingCount: founding.c,
      foundingCap: FOUNDING_MEMBER_CAP,
      limits: payoutLimitsConfig(),
    });
  });

  app.get("/v1/admin/payouts", (c) => {
    const gate = requireAdminEmail(db, c);
    if (!gate.ok) return c.json({ error: gate.error }, gate.status);

    const status = c.req.query("status") || "requested";
    const where = status === "all" ? "1=1" : "p.status = ?";
    const params = status === "all" ? [] : [status];

    const rows = db
      .prepare(
        `SELECT p.id, p.client_id as clientId, p.amount, p.referral_bonus as referralBonus,
                p.rail, p.handle, p.status, p.created_at as createdAt,
                c.email, c.founding_member as foundingMember
         FROM payouts p
         LEFT JOIN clients c ON c.id = p.client_id
         WHERE ${where}
         ORDER BY CASE WHEN p.status = 'requested' THEN 0 ELSE 1 END,
                  c.founding_member DESC, p.created_at ASC`,
      )
      .all(...params) as Array<{
        id: string;
        clientId: string;
        amount: number;
        referralBonus: number;
        rail: string;
        handle: string;
        status: string;
        createdAt: number;
        email: string | null;
        foundingMember: number;
      }>;

    return c.json(
      rows.map((r) => ({
        ...r,
        foundingMember: Boolean(r.foundingMember),
        createdAt: new Date(r.createdAt).toISOString(),
      })),
    );
  });

  app.patch("/v1/admin/payouts/:id", async (c) => {
    const gate = requireAdminEmail(db, c);
    if (!gate.ok) return c.json({ error: gate.error }, gate.status);

    const id = c.req.param("id");
    const body = (await c.req.json().catch(() => ({}))) as { status?: string };
    const next = body.status === "paid" || body.status === "failed" ? body.status : null;
    if (!next) {
      return c.json({ error: "status must be paid or failed" }, 400);
    }

    const row = db
      .prepare("SELECT id, client_id, amount, referral_bonus, status FROM payouts WHERE id = ?")
      .get(id) as {
        id: string;
        client_id: string;
        amount: number;
        referral_bonus: number;
        status: string;
      } | undefined;
    if (!row) return c.json({ error: "Payout not found" }, 404);
    if (row.status !== "requested") {
      return c.json({ error: "Payout already processed" }, 400);
    }

    const restorePayable = row.amount - (row.referral_bonus || 0);

    const tx = db.transaction(() => {
      db.prepare("UPDATE payouts SET status = ? WHERE id = ?").run(next, id);
      if (next === "failed" && restorePayable > 0) {
        db.prepare(
          "UPDATE earnings SET payable = payable + ? WHERE client_id = ?",
        ).run(restorePayable, row.client_id);
      }
      if (next === "failed" && row.referral_bonus > 0) {
        db.prepare("UPDATE clients SET referral_bonus_paid = 0 WHERE id = ?").run(row.client_id);
      }
    });
    tx();

    return c.json({
      ok: true,
      id,
      status: next,
      restoredPayable: next === "failed" ? restorePayable : 0,
    });
  });

  app.get("/v1/admin/users", (c) => {
    const gate = requireAdminEmail(db, c);
    if (!gate.ok) return c.json({ error: gate.error }, gate.status);

    const search = (c.req.query("search") || "").trim();
    const limit = Math.min(Number(c.req.query("limit") || 50), 200);

    let rows: Array<{
      clientId: string;
      email: string | null;
      createdAt: number;
      lifetime: number;
      payable: number;
      foundingMember: number;
      referralCode: string | null;
      referralsTotal: number;
    }>;

    if (search) {
      const like = `%${search}%`;
      rows = db
        .prepare(
          `SELECT c.id as clientId, c.email, c.created_at as createdAt,
                  COALESCE(e.lifetime, 0) as lifetime, COALESCE(e.payable, 0) as payable,
                  c.founding_member as foundingMember, c.referral_code as referralCode,
                  (SELECT COUNT(*) FROM clients r WHERE r.referred_by_client_id = c.id) as referralsTotal
           FROM clients c
           LEFT JOIN earnings e ON e.client_id = c.id
           WHERE c.email LIKE ? OR c.id LIKE ? OR c.referral_code LIKE ?
           ORDER BY c.created_at DESC
           LIMIT ?`,
        )
        .all(like, like, like, limit) as typeof rows;
    } else {
      rows = db
        .prepare(
          `SELECT c.id as clientId, c.email, c.created_at as createdAt,
                  COALESCE(e.lifetime, 0) as lifetime, COALESCE(e.payable, 0) as payable,
                  c.founding_member as foundingMember, c.referral_code as referralCode,
                  (SELECT COUNT(*) FROM clients r WHERE r.referred_by_client_id = c.id) as referralsTotal
           FROM clients c
           LEFT JOIN earnings e ON e.client_id = c.id
           ORDER BY c.created_at DESC
           LIMIT ?`,
        )
        .all(limit) as typeof rows;
    }

    return c.json(
      rows.map((r) => ({
        ...r,
        foundingMember: Boolean(r.foundingMember),
        createdAt: new Date(r.createdAt).toISOString(),
      })),
    );
  });

  app.get("/v1/admin/users/:clientId", (c) => {
    const gate = requireAdminEmail(db, c);
    if (!gate.ok) return c.json({ error: gate.error }, gate.status);

    const clientId = c.req.param("clientId");
    const client = db
      .prepare(
        `SELECT c.id, c.email, c.created_at, c.founding_member, c.founding_enrolled_at,
                c.referral_code, c.referred_by_client_id, c.referral_qualified_at, c.referral_bonus_paid,
                e.today, e.month, e.lifetime, e.pending, e.payable,
                pm.rail, pm.handle
         FROM clients c
         LEFT JOIN earnings e ON e.client_id = c.id
         LEFT JOIN payout_methods pm ON pm.client_id = c.id
         WHERE c.id = ?`,
      )
      .get(clientId) as Record<string, unknown> | undefined;

    if (!client) return c.json({ error: "User not found" }, 404);

    const payouts = db
      .prepare(
        `SELECT id, amount, referral_bonus as referralBonus, rail, handle, status, created_at as createdAt
         FROM payouts WHERE client_id = ? ORDER BY created_at DESC LIMIT 50`,
      )
      .all(clientId) as Array<{
        id: string;
        amount: number;
        referralBonus: number;
        rail: string;
        handle: string;
        status: string;
        createdAt: number;
      }>;

    const referrals = db
      .prepare(
        `SELECT id, email, referral_qualified_at as qualifiedAt, created_at as createdAt
         FROM clients WHERE referred_by_client_id = ? ORDER BY created_at DESC`,
      )
      .all(clientId) as Array<{ id: string; email: string | null; qualifiedAt: number | null; createdAt: number }>;

    const impressions = db
      .prepare(
        `SELECT COUNT(*) as total, COALESCE(SUM(amount), 0) as earned
         FROM impressions WHERE client_id = ? AND demo = 0`,
      )
      .get(clientId) as { total: number; earned: number };

    const lastActivity = db
      .prepare(
        "SELECT MAX(created_at) as t FROM impressions WHERE client_id = ?",
      )
      .get(clientId) as { t: number | null };

    return c.json({
      clientId: client.id,
      email: client.email,
      createdAt: new Date(client.created_at as number).toISOString(),
      foundingMember: Boolean(client.founding_member),
      foundingEnrolledAt: client.founding_enrolled_at
        ? new Date(client.founding_enrolled_at as number).toISOString()
        : null,
      referralCode: client.referral_code,
      referredByClientId: client.referred_by_client_id,
      referralQualifiedAt: client.referral_qualified_at
        ? new Date(client.referral_qualified_at as number).toISOString()
        : null,
      referralBonusPaid: Boolean(client.referral_bonus_paid),
      earnings: {
        today: client.today ?? 0,
        month: client.month ?? 0,
        lifetime: client.lifetime ?? 0,
        pending: client.pending ?? 0,
        payable: client.payable ?? 0,
      },
      payoutMethod: { rail: client.rail || "", handle: client.handle || "" },
      impressions: { total: impressions.total, earned: impressions.earned },
      lastActivityAt: lastActivity.t ? new Date(lastActivity.t).toISOString() : null,
      payouts: payouts.map((p) => ({
        ...p,
        createdAt: new Date(p.createdAt).toISOString(),
      })),
      referrals: referrals.map((r) => ({
        clientId: r.id,
        email: r.email,
        qualified: Boolean(r.qualifiedAt),
        qualifiedAt: r.qualifiedAt ? new Date(r.qualifiedAt).toISOString() : null,
        createdAt: new Date(r.createdAt).toISOString(),
      })),
      limits: payoutLimitsConfig(),
    });
  });

  app.get("/v1/admin/limits", (c) => {
    const gate = requireAdminEmail(db, c);
    if (!gate.ok) return c.json({ error: gate.error }, gate.status);
    return c.json(payoutLimitsConfig());
  });

  return app;
}
