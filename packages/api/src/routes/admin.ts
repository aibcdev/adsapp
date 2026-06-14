import { Hono } from "hono";
import type { Database as DbType } from "better-sqlite3";
import { config } from "../config.js";

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

  app.get("/v1/admin/payouts", (c) => {
    const gate = requireAdmin(c);
    if (!gate.ok) return c.json({ error: gate.error }, gate.status);

    const status = c.req.query("status") || "requested";
    const rows = db
      .prepare(
        `SELECT p.id, p.client_id as clientId, p.amount, p.rail, p.handle, p.status, p.created_at as createdAt,
                c.email
         FROM payouts p
         LEFT JOIN clients c ON c.id = p.client_id
         WHERE p.status = ?
         ORDER BY p.created_at ASC`,
      )
      .all(status) as Array<{
        id: string;
        clientId: string;
        amount: number;
        rail: string;
        handle: string;
        status: string;
        createdAt: number;
        email: string | null;
      }>;

    return c.json(
      rows.map((r) => ({
        ...r,
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

    const row = db.prepare("SELECT id, status FROM payouts WHERE id = ?").get(id) as
      | { id: string; status: string }
      | undefined;
    if (!row) return c.json({ error: "Payout not found" }, 404);

    db.prepare("UPDATE payouts SET status = ? WHERE id = ?").run(next, id);
    return c.json({ ok: true, id, status: next });
  });

  return app;
}
