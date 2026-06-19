import { Hono } from "hono";
import { randomUUID } from "node:crypto";
import type { Database as DbType } from "better-sqlite3";
import { resolveClient } from "../db/schema.js";
import { BLOCK_IMPRESSIONS } from "./auction.js";
import { config, stripeEnabled } from "../config.js";
import { createDepositCheckout } from "../stripe.js";
import { createBrand, listBrands, resolveBrandForCampaign, updateBrand } from "../advertiser/brands.js";
import { withAibcUtm } from "../advertiser/clickUrl.js";
import {
  ensureAdvertiserProfile,
  parseTargetCountries,
  serializeTargetCountries,
} from "../advertiser/tables.js";
import { getCampaignAnalytics, getAdvertiserAnalyticsSummary } from "../advertiser/analytics.js";
import { attributeAdvertiserReferral, getPartnerDashboard } from "../advertiser/partners.js";

export function advertiserRoutes(db: DbType) {
  const app = new Hono();

  app.get("/v1/advertiser/balance", (c) => {
    const client = resolveClient(db, c.req.header("authorization"));
    if (!client) return c.json({ error: "unauthorized" }, 401);
    const row = db
      .prepare("SELECT balance FROM advertiser_balance WHERE client_id = ?")
      .get(client.clientId) as { balance: number } | undefined;
    return c.json({ balance: row?.balance ?? 0 });
  });

  app.post("/v1/advertiser/deposit/checkout", async (c) => {
    const client = resolveClient(db, c.req.header("authorization"));
    if (!client) return c.json({ error: "unauthorized" }, 401);
    const body = (await c.req.json()) as { amount?: number };
    const amount = Number(body.amount || 0);
    const result = await createDepositCheckout(db, client.clientId, amount);
    if ("error" in result) return c.json({ error: result.error }, 400);
    return c.json({ url: result.url });
  });

  app.post("/v1/advertiser/deposit", async (c) => {
    const client = resolveClient(db, c.req.header("authorization"));
    if (!client) return c.json({ error: "unauthorized" }, 401);
    if (stripeEnabled()) {
      return c.json(
        { error: "Use Stripe checkout. POST /v1/advertiser/deposit/checkout" },
        400,
      );
    }
    if (!config.devBypass) {
      return c.json({ error: "Deposits require Stripe in production" }, 503);
    }
    const body = (await c.req.json()) as { amount?: number };
    const amount = Math.max(0, Number(body.amount || 0));
    db.prepare(`
      INSERT INTO advertiser_balance (client_id, balance) VALUES (?, ?)
      ON CONFLICT(client_id) DO UPDATE SET balance = balance + excluded.balance
    `).run(client.clientId, amount);
    return c.json({ ok: true });
  });

  app.get("/v1/advertiser/profile", (c) => {
    const client = resolveClient(db, c.req.header("authorization"));
    if (!client) return c.json({ error: "unauthorized" }, 401);
    ensureAdvertiserProfile(db, client.clientId);
    const profile = db
      .prepare("SELECT account_type as accountType FROM advertiser_profiles WHERE client_id = ?")
      .get(client.clientId) as { accountType: string } | undefined;
    const partner = getPartnerDashboard(db, client.clientId);
    return c.json({
      accountType: profile?.accountType || "direct",
      isPartner: Boolean(partner),
    });
  });

  app.get("/v1/advertiser/brands", (c) => {
    const client = resolveClient(db, c.req.header("authorization"));
    if (!client) return c.json({ error: "unauthorized" }, 401);
    return c.json(listBrands(db, client.clientId));
  });

  app.post("/v1/advertiser/brands", async (c) => {
    const client = resolveClient(db, c.req.header("authorization"));
    if (!client) return c.json({ error: "unauthorized" }, 401);
    const body = (await c.req.json()) as { name?: string; logoUrl?: string };
    try {
      const brand = createBrand(db, client.clientId, String(body.name || ""), body.logoUrl);
      ensureAdvertiserProfile(db, client.clientId, "agency");
      db.prepare("UPDATE advertiser_profiles SET account_type = 'agency' WHERE client_id = ?").run(
        client.clientId,
      );
      return c.json(brand, 201);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : "Invalid brand" }, 400);
    }
  });

  app.patch("/v1/advertiser/brands/:id", async (c) => {
    const client = resolveClient(db, c.req.header("authorization"));
    if (!client) return c.json({ error: "unauthorized" }, 401);
    const body = (await c.req.json()) as { name?: string; logoUrl?: string | null };
    try {
      const ok = updateBrand(db, client.clientId, c.req.param("id"), {
        name: body.name,
        logoUrl: body.logoUrl,
      });
      if (!ok) return c.json({ error: "not found" }, 404);
      return c.json({ ok: true });
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : "Invalid brand" }, 400);
    }
  });

  app.get("/v1/advertiser/campaigns", (c) => {
    const client = resolveClient(db, c.req.header("authorization"));
    if (!client) return c.json({ error: "unauthorized" }, 401);
    const brandFilter = c.req.query("brandId");
    let sql = `
      SELECT c.id, c.ad_line as adLine, c.destination_url as destinationUrl,
             c.brand_name as brandName, c.brand_id as brandId, c.bid_per_1k as bidPer1k,
             c.blocks, c.show_on_leaderboard as showOnLeaderboard, c.status,
             c.impressions, c.spend, c.created_at as createdAt, c.target_countries as targetCountries
      FROM campaigns c
      WHERE c.client_id = ?
    `;
    const params: unknown[] = [client.clientId];
    if (brandFilter) {
      sql += " AND c.brand_id = ?";
      params.push(brandFilter);
    }
    sql += " ORDER BY c.created_at DESC";
    const rows = db.prepare(sql).all(...params) as Array<{
      createdAt: number;
      targetCountries: string | null;
    }>;
    return c.json(
      rows.map((r) => ({
        ...r,
        createdAt: new Date(r.createdAt).toISOString(),
        targetCountries: parseTargetCountries(r.targetCountries),
      })),
    );
  });

  app.get("/v1/advertiser/campaigns/:id/analytics", (c) => {
    const client = resolveClient(db, c.req.header("authorization"));
    if (!client) return c.json({ error: "unauthorized" }, 401);
    const data = getCampaignAnalytics(db, client.clientId, c.req.param("id"));
    if (!data) return c.json({ error: "not found" }, 404);
    return c.json(data);
  });

  app.get("/v1/advertiser/analytics/summary", (c) => {
    const client = resolveClient(db, c.req.header("authorization"));
    if (!client) return c.json({ error: "unauthorized" }, 401);
    return c.json(getAdvertiserAnalyticsSummary(db, client.clientId));
  });

  app.get("/v1/advertiser/partner", (c) => {
    const client = resolveClient(db, c.req.header("authorization"));
    if (!client) return c.json({ error: "unauthorized" }, 401);
    const data = getPartnerDashboard(db, client.clientId);
    if (!data) return c.json({ error: "not a partner" }, 404);
    return c.json(data);
  });

  app.post("/v1/advertiser/campaigns", async (c) => {
    const client = resolveClient(db, c.req.header("authorization"));
    if (!client) return c.json({ error: "unauthorized" }, 401);
    const body = (await c.req.json()) as Record<string, unknown>;
    const adLine = String(body.adLine || "");
    const destinationUrl = String(body.destinationUrl || "");
    if (adLine.length < 3 || adLine.length > 60) {
      return c.json({ error: "Ad line must be 3-60 chars" }, 400);
    }
    if (!destinationUrl.startsWith("https://")) {
      return c.json({ error: "Destination URL must be https://" }, 400);
    }

    const partnerCode = body.partnerCode ? String(body.partnerCode) : undefined;
    if (partnerCode) attributeAdvertiserReferral(db, client.clientId, partnerCode);

    const { brandId, brandName } = resolveBrandForCampaign(
      db,
      client.clientId,
      body.brandId ? String(body.brandId) : null,
      body.brandName ? String(body.brandName) : null,
    );

    const targetCountries = serializeTargetCountries(
      Array.isArray(body.targetCountries)
        ? body.targetCountries.map(String)
        : body.targetCountries
          ? [String(body.targetCountries)]
          : [],
    );

    const bidPer1k = Number(body.bidPer1k || 5);
    const blocks = Math.max(1, Number(body.blocks || 10));
    const bidPerBlock = (bidPer1k * BLOCK_IMPRESSIONS) / 1000;
    const totalCost = bidPerBlock * blocks;
    const impressionsTarget = blocks * BLOCK_IMPRESSIONS;

    if (stripeEnabled() && !config.devBypass) {
      const deducted = db
        .prepare(
          "UPDATE advertiser_balance SET balance = balance - ? WHERE client_id = ? AND balance >= ?",
        )
        .run(totalCost, client.clientId, totalCost);

      if (deducted.changes === 0) {
        const balanceRow = db
          .prepare("SELECT balance FROM advertiser_balance WHERE client_id = ?")
          .get(client.clientId) as { balance: number } | undefined;
        return c.json(
          {
            error:
              "Insufficient prepaid balance. Add funds in the Advertise tab, or launch via Stripe at /advertisers.",
            required: totalCost,
            balance: balanceRow?.balance ?? 0,
          },
          402,
        );
      }
    } else if (!config.devBypass) {
      return c.json(
        { error: "Campaign checkout required. Use /advertisers or POST /v1/billing/checkout." },
        403,
      );
    }

    const id = randomUUID();
    db.prepare(`
      INSERT INTO campaigns (
        id, client_id, ad_line, destination_url, brand_name, brand_id, bid_per_1k, blocks,
        show_on_leaderboard, status, created_at, payment_status, impressions_target,
        impressions_served, target_countries
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, 'paid', ?, 0, ?)
    `).run(
      id,
      client.clientId,
      adLine,
      destinationUrl,
      brandName,
      brandId,
      bidPer1k,
      blocks,
      body.showOnLeaderboard ? 1 : 0,
      Date.now(),
      impressionsTarget,
      targetCountries,
    );

    const adId = `campaign-${id.slice(0, 8)}`;
    const clickUrl = withAibcUtm(destinationUrl, id.slice(0, 8));
    db.prepare(
      "INSERT OR REPLACE INTO ads (ad_id, text, click_url, brand, bid_per_1k, active) VALUES (?, ?, ?, ?, ?, 1)",
    ).run(adId, adLine, clickUrl, brandName, bidPer1k);

    return c.json({ id, adId, totalCost }, 201);
  });

  app.patch("/v1/advertiser/campaigns/:id", async (c) => {
    const client = resolveClient(db, c.req.header("authorization"));
    if (!client) return c.json({ error: "unauthorized" }, 401);
    const body = (await c.req.json()) as { status?: string };
    const status = body.status;
    if (status !== "paused" && status !== "active") {
      return c.json({ error: "status must be paused or active" }, 400);
    }
    const result = db
      .prepare("UPDATE campaigns SET status = ? WHERE id = ? AND client_id = ?")
      .run(status, c.req.param("id"), client.clientId);
    if (result.changes === 0) return c.json({ error: "not found" }, 404);

    const row = db
      .prepare("SELECT substr(id, 1, 8) as prefix FROM campaigns WHERE id = ?")
      .get(c.req.param("id")) as { prefix: string };
    db.prepare("UPDATE ads SET active = ? WHERE ad_id = ?").run(
      status === "active" ? 1 : 0,
      `campaign-${row.prefix}`,
    );
    return c.json({ ok: true });
  });

  return app;
}
