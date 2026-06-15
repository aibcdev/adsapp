import { Hono } from "hono";
import { randomUUID } from "node:crypto";
import type { Database as DbType } from "better-sqlite3";
import { isAdminEmail } from "../config.js";
import { resolveClient } from "../db/schema.js";

export function ensureAdvertiserApplicationsTable(db: DbType) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS advertiser_applications (
      id TEXT PRIMARY KEY,
      company TEXT NOT NULL,
      website TEXT,
      budget TEXT,
      email TEXT NOT NULL,
      status TEXT DEFAULT 'new',
      created_at INTEGER NOT NULL
    );
  `);
}

export function advertiserApplyRoutes(db: DbType) {
  const app = new Hono();

  app.post("/v1/advertiser/apply", async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as {
      company?: string;
      website?: string;
      budget?: string;
      email?: string;
    };

    const company = body.company?.trim();
    const email = body.email?.trim().toLowerCase();
    if (!company || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return c.json({ error: "Valid company and email required" }, 400);
    }

    const id = randomUUID();
    db.prepare(
      `INSERT INTO advertiser_applications (id, company, website, budget, email, status, created_at)
       VALUES (?, ?, ?, ?, ?, 'new', ?)`,
    ).run(id, company, body.website?.trim() || null, body.budget?.trim() || null, email, Date.now());

    return c.json({ ok: true, id });
  });

  app.get("/v1/admin/advertiser-applications", (c) => {
    const client = resolveClient(db, c.req.header("authorization"));
    if (!client || !isAdminEmail(client.email)) {
      return c.json({ error: "Admin access denied" }, 403);
    }

    const rows = db
      .prepare(
        `SELECT id, company, website, budget, email, status, created_at as createdAt
         FROM advertiser_applications
         ORDER BY created_at DESC
         LIMIT 200`,
      )
      .all() as Array<{
        id: string;
        company: string;
        website: string | null;
        budget: string | null;
        email: string;
        status: string;
        createdAt: number;
      }>;

    return c.json(
      rows.map((r) => ({
        ...r,
        createdAt: new Date(r.createdAt).toISOString(),
      })),
    );
  });

  app.patch("/v1/admin/advertiser-applications/:id", async (c) => {
    const client = resolveClient(db, c.req.header("authorization"));
    if (!client || !isAdminEmail(client.email)) {
      return c.json({ error: "Admin access denied" }, 403);
    }

    const id = c.req.param("id");
    const body = (await c.req.json().catch(() => ({}))) as { status?: string };
    const status = body.status?.trim();
    if (!status || !["new", "contacted", "qualified", "closed"].includes(status)) {
      return c.json({ error: "Invalid status" }, 400);
    }

    const result = db.prepare("UPDATE advertiser_applications SET status = ? WHERE id = ?").run(status, id);
    if (result.changes === 0) return c.json({ error: "Application not found" }, 404);
    return c.json({ ok: true, id, status });
  });

  return app;
}
