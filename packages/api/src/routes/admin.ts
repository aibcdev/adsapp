import { Hono } from "hono";
import type { Database as DbType } from "better-sqlite3";
import { config } from "../config.js";
import { FOUNDING_MEMBER_CAP, payoutLimitsConfig } from "../billing/economics.js";

function requireAdmin(c: { req: { header: (name: string) => string | undefined } }) {
  if (!config.adminKey) {
    return { ok: false as const, status: 503 as const, error: "Admin API not configured (set AIBC_ADMIN_KEY)" };
  }
  const auth = c.req.header("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (token !== config.adminKey) {
    return { ok: false as const, status: 401 as const, error: "Unauthorized" };
  }
  return { ok: true as const };
}

export function adminRoutes(db: DbType) {
  const app = new Hono();

  app.get("/v1/admin/stats", (c) => {
    const gate = requireAdmin(c);
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
    const gate = requireAdmin(c);
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
    const gate = requireAdmin(c);
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
    const gate = requireAdmin(c);
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
    const gate = requireAdmin(c);
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
    const gate = requireAdmin(c);
    if (!gate.ok) return c.json({ error: gate.error }, gate.status);
    return c.json(payoutLimitsConfig());
  });

  return app;
}
