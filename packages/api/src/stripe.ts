import type { Database as DbType } from "better-sqlite3";
import Stripe from "stripe";
import { config, stripeEnabled } from "./config.js";

let stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!stripeEnabled()) return null;
  if (!stripe) {
    stripe = new Stripe(config.stripeSecretKey);
  }
  return stripe;
}

export function ensureStripeTables(db: DbType) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS stripe_events (
      id TEXT PRIMARY KEY,
      processed_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS deposit_sessions (
      session_id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at INTEGER NOT NULL
    );
  `);
  try {
    db.exec("ALTER TABLE deposit_sessions ADD COLUMN kind TEXT DEFAULT 'deposit'");
  } catch {
    /* exists */
  }
  try {
    db.exec("ALTER TABLE deposit_sessions ADD COLUMN campaign_id TEXT");
  } catch {
    /* exists */
  }
}

export async function createDepositCheckout(
  db: DbType,
  clientId: string,
  amountUsd: number,
): Promise<{ url: string } | { error: string }> {
  const s = getStripe();
  if (!s) return { error: "Stripe not configured" };

  const amount = Math.round(amountUsd * 100);
  if (amount < 500) return { error: "Minimum deposit is $5.00" };

  const session = await s.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: amount,
          product_data: {
            name: "aibc advertiser balance",
            description: "Prepaid ad spend on aibc developer inventory",
          },
        },
      },
    ],
    success_url: `${config.portalUrl}/dashboard?deposit=success`,
    cancel_url: `${config.portalUrl}/dashboard?deposit=cancel`,
    metadata: { client_id: clientId, amount_usd: String(amountUsd) },
  });

  if (!session.url) return { error: "Failed to create checkout session" };

  db.prepare(
    "INSERT INTO deposit_sessions (session_id, client_id, amount, status, created_at) VALUES (?, ?, ?, 'pending', ?)",
  ).run(session.id, clientId, amountUsd, Date.now());

  return { url: session.url };
}

export async function createCampaignCheckout(
  db: DbType,
  opts: {
    campaignId: string;
    clientId: string;
    buyerEmail: string;
    totalUsd: number;
    adLine: string;
    blocks: number;
    bidPer1k: number;
  },
): Promise<{ url: string } | { error: string }> {
  const s = getStripe();
  if (!s) return { error: "Stripe not configured" };

  const amount = Math.round(opts.totalUsd * 100);
  if (amount < 100) return { error: "Minimum order is $1.00" };

  const session = await s.checkout.sessions.create({
    mode: "payment",
    customer_email: opts.buyerEmail,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: amount,
          product_data: {
            name: "aibc ad campaign",
            description: `${opts.adLine.slice(0, 80)} · ${opts.blocks} block(s) @ $${opts.bidPer1k}/1k imps`,
          },
        },
      },
    ],
    success_url: `${config.portalUrl}/?purchase=success`,
    cancel_url: `${config.portalUrl}/?purchase=cancel#advertise`,
    metadata: {
      kind: "impression",
      campaign_id: opts.campaignId,
      client_id: opts.clientId,
      amount_usd: String(opts.totalUsd),
    },
  });

  if (!session.url) return { error: "Failed to create checkout session" };

  db.prepare(
    "INSERT INTO deposit_sessions (session_id, client_id, amount, status, created_at, kind, campaign_id) VALUES (?, ?, ?, 'pending', ?, 'campaign', ?)",
  ).run(session.id, opts.clientId, opts.totalUsd, Date.now(), opts.campaignId);

  return { url: session.url };
}

export function activateCampaign(
  db: DbType,
  campaignId: string,
  clientId: string,
  amountUsd: number,
  sessionId: string,
): void {
  db.prepare(
    "UPDATE campaigns SET payment_status = 'paid' WHERE id = ? AND client_id = ?",
  ).run(campaignId, clientId);

  const row = db
    .prepare("SELECT ad_line, destination_url, brand_name, bid_per_1k FROM campaigns WHERE id = ?")
    .get(campaignId) as
    | { ad_line: string; destination_url: string; brand_name: string | null; bid_per_1k: number }
    | undefined;

  if (row) {
    const adId = `campaign-${campaignId.slice(0, 8)}`;
    db.prepare(
      "INSERT OR REPLACE INTO ads (ad_id, text, click_url, brand, bid_per_1k, active) VALUES (?, ?, ?, ?, ?, 1)",
    ).run(adId, row.ad_line, row.destination_url, row.brand_name, row.bid_per_1k);
  }

  db.prepare("UPDATE deposit_sessions SET status = 'completed' WHERE session_id = ?").run(sessionId);
  db.prepare(
    "UPDATE campaigns SET spend = spend + ? WHERE id = ?",
  ).run(amountUsd, campaignId);
}

export function creditAdvertiserBalance(
  db: DbType,
  clientId: string,
  amount: number,
  sessionId: string,
): void {
  db.prepare(`
    INSERT INTO advertiser_balance (client_id, balance) VALUES (?, ?)
    ON CONFLICT(client_id) DO UPDATE SET balance = balance + excluded.balance
  `).run(clientId, amount);

  db.prepare(
    "UPDATE deposit_sessions SET status = 'completed' WHERE session_id = ?",
  ).run(sessionId);
}

export async function handleStripeWebhook(
  db: DbType,
  rawBody: string,
  signature: string | undefined,
): Promise<{ ok: boolean; message?: string }> {
  const s = getStripe();
  if (!s || !config.stripeWebhookSecret) {
    return { ok: false, message: "Stripe webhook not configured" };
  }

  let event: Stripe.Event;
  try {
    event = s.webhooks.constructEvent(
      rawBody,
      signature || "",
      config.stripeWebhookSecret,
    );
  } catch {
    return { ok: false, message: "Invalid signature" };
  }

  const seen = db
    .prepare("SELECT id FROM stripe_events WHERE id = ?")
    .get(event.id);
  if (seen) return { ok: true };

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const kind = session.metadata?.kind || "deposit";
    const clientId = session.metadata?.client_id;
    const amountUsd = Number(session.metadata?.amount_usd || 0);

    if (kind === "impression" && session.metadata?.campaign_id && clientId && session.id) {
      activateCampaign(db, session.metadata.campaign_id, clientId, amountUsd, session.id);
    } else if (clientId && amountUsd > 0 && session.id) {
      creditAdvertiserBalance(db, clientId, amountUsd, session.id);
    }
  }

  db.prepare("INSERT INTO stripe_events (id, processed_at) VALUES (?, ?)").run(
    event.id,
    Date.now(),
  );

  return { ok: true };
}
