import { Hono } from "hono";
import { randomUUID } from "node:crypto";
import type { Database as DbType } from "better-sqlite3";
import { createCampaignCheckout } from "../stripe.js";
import { mintToken } from "../db/schema.js";
import { BLOCK_IMPRESSIONS } from "./auction.js";
import { attributeAdvertiserReferral } from "../advertiser/partners.js";
import { resolveBrandForCampaign } from "../advertiser/brands.js";
import { serializeTargetCountries } from "../advertiser/tables.js";

const BID_FLOOR = 1;

export function billingRoutes(db: DbType) {
  const app = new Hono();

  app.post("/v1/billing/checkout", async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
    const adLine = String(body.ad_line || body.adLine || "").trim();
    const destinationUrl = String(body.destination_url || body.destinationUrl || "").trim();
    const buyerEmail = String(body.buyer_email || body.buyerEmail || "").trim();
    const brand = body.brand ? String(body.brand) : null;
    const brandId = body.brand_id || body.brandId ? String(body.brand_id || body.brandId) : null;
    const partnerCode = body.partner_code || body.partnerCode ? String(body.partner_code || body.partnerCode) : null;
    const rawCountries = body.target_countries ?? body.targetCountries;
    const targetCountries = serializeTargetCountries(
      Array.isArray(rawCountries) ? rawCountries.map(String) : [],
    );
    const iconUrl = body.icon_url ? String(body.icon_url) : null;
    const optinLeaderboard = body.optin_leaderboard !== false && body.showOnLeaderboard !== false;
    const blocks = Math.max(1, Math.min(500, Number(body.blocks || 1)));
    const bidUsd = Number(body.bid_usd || body.bidPerBlock || 0);
    const cpm = Number(body.cpm_usd || body.bidPer1k || 0);
    const bidPer1k = cpm > 0 ? cpm : (bidUsd * 1000) / BLOCK_IMPRESSIONS;

    if (!buyerEmail || !buyerEmail.includes("@")) {
      return c.json({ detail: { field: "email", reason: "Valid email required" } }, 400);
    }
    if (adLine.length < 3 || adLine.length > 60) {
      return c.json({ detail: { field: "ad_line", reason: "Ad line must be 3–60 characters" } }, 400);
    }
    if (!destinationUrl.startsWith("https://")) {
      return c.json({ detail: { field: "destination_url", reason: "Must be https://" } }, 400);
    }
    if (bidPer1k < BID_FLOOR) {
      return c.json(
        {
          detail: {
            field: "bid",
            reason: `Minimum bid is $${BID_FLOOR.toFixed(2)} per 1k impressions`,
          },
        },
        400,
      );
    }

    const bidPerBlock = (bidPer1k * BLOCK_IMPRESSIONS) / 1000;
    const totalUsd = bidPerBlock * blocks;

    let client = db
      .prepare("SELECT id FROM clients WHERE email = ?")
      .get(buyerEmail) as { id: string } | undefined;

    let clientId = client?.id;
    if (!clientId) {
      clientId = randomUUID();
      db.prepare("INSERT INTO clients (id, email, created_at) VALUES (?, ?, ?)").run(
        clientId,
        buyerEmail,
        Date.now(),
      );
      mintToken(db, clientId, buyerEmail);
    }

    if (partnerCode) attributeAdvertiserReferral(db, clientId, partnerCode);

    let resolvedBrandId: string | null = brandId;
    let resolvedBrandName: string | null = brand;
    if (clientId && (brandId || brand)) {
      const resolved = resolveBrandForCampaign(db, clientId, brandId, brand);
      resolvedBrandId = resolved.brandId;
      resolvedBrandName = resolved.brandName;
    }

    const campaignId = randomUUID();
    const impressionsTarget = blocks * BLOCK_IMPRESSIONS;

    db.prepare(`
      INSERT INTO campaigns (
        id, client_id, ad_line, destination_url, brand_name, brand_id, bid_per_1k, blocks,
        show_on_leaderboard, status, created_at, buyer_email, icon_url,
        payment_status, impressions_target, impressions_served, target_countries
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, 'pending', ?, 0, ?)
    `).run(
      campaignId,
      clientId,
      adLine,
      destinationUrl,
      resolvedBrandName,
      resolvedBrandId,
      bidPer1k,
      blocks,
      optinLeaderboard ? 1 : 0,
      Date.now(),
      buyerEmail,
      iconUrl,
      impressionsTarget,
      targetCountries,
    );

    const result = await createCampaignCheckout(db, {
      campaignId,
      clientId,
      buyerEmail,
      totalUsd,
      adLine,
      blocks,
      bidPer1k,
    });

    if ("error" in result) {
      db.prepare("DELETE FROM campaigns WHERE id = ?").run(campaignId);
      return c.json({ detail: result.error }, 400);
    }

    return c.json({ checkout_url: result.url });
  });

  return app;
}
