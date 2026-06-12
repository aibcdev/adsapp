import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { randomUUID } from "node:crypto";
import {
  completeGoogleAuth,
  googleCallbackHtml,
} from "./auth/google.js";
import { authStartUrl, config, stripeEnabled } from "./config.js";
import {
  createDb,
  creditEarnings,
  getFeedJson,
  getPortfolioAds,
  mintToken,
  resolveClient,
} from "./db/schema.js";
import {
  createDepositCheckout,
  ensureStripeTables,
  handleStripeWebhook,
} from "./stripe.js";

const db = createDb();
ensureStripeTables(db);
const app = new Hono();

app.use(
  "*",
  cors({
    origin: (origin) => {
      if (!origin) return "*";
      if (config.corsOrigins.includes(origin)) return origin;
      if (config.devBypass && origin.startsWith("http://localhost")) return origin;
      return config.corsOrigins[0] || origin;
    },
    allowMethods: ["GET", "POST", "PATCH", "OPTIONS"],
    allowHeaders: ["Authorization", "Content-Type", "Stripe-Signature"],
  }),
);

const VIEW_THRESHOLD = config.viewThresholdSeconds;
const ROTATION_MS = 120_000;

function portfolioPayload() {
  return {
    ads: getPortfolioAds(db),
    rotationIntervalMs: ROTATION_MS,
    view_threshold_seconds: VIEW_THRESHOLD,
  };
}

app.get("/feed", (c) => c.json(getFeedJson()));

app.get("/v1/killswitch", (c) => {
  const row = db.prepare("SELECT paused FROM killswitch WHERE id = 1").get() as {
    paused: number;
  };
  return c.json({ paused: row.paused === 1 });
});

app.get("/v1/portfolio/demo", (c) => {
  const clientId = c.req.query("client_id") || "demo";
  if (!clientId) return c.json({ error: "client_id required" }, 400);
  return c.json(portfolioPayload());
});

app.get("/v1/portfolio", (c) => {
  const client = resolveClient(db, c.req.header("authorization"));
  if (!client) return c.json({ error: "unauthorized" }, 401);
  return c.json(portfolioPayload());
});

app.post("/v1/metrics/demo", async (c) => {
  await c.req.json().catch(() => ({}));
  return c.json({ ok: true, demo: true });
});

app.post("/v1/metrics", async (c) => {
  const client = resolveClient(db, c.req.header("authorization"));
  const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
  const event = String(body.event || body.kind || "impression");
  const adId = String(body.adId || body.ad_id || "unknown");

  if (client && (event === "view_threshold_met" || event === "click")) {
    const amount = event === "click" ? 0.05 : 0.001;
    creditEarnings(db, client.clientId, amount, adId, event);
  }

  return c.json({ ok: true });
});

app.post("/v1/auth/extension/start", (c) => {
  const state = randomUUID();
  const clientId = randomUUID();
  db.prepare(
    "INSERT INTO clients (id, created_at) VALUES (?, ?)",
  ).run(clientId, Date.now());
  db.prepare(
    "INSERT INTO auth_states (state, client_id, created_at) VALUES (?, ?, ?)",
  ).run(state, clientId, Date.now());

  try {
    const authUrl = authStartUrl(state);
    return c.json({ state, authUrl, clientId });
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Auth unavailable" },
      503,
    );
  }
});

app.get("/v1/auth/google/callback", async (c) => {
  const code = c.req.query("code");
  const state = c.req.query("state");
  if (!code || !state) {
    return c.html(googleCallbackHtml(false), 400);
  }
  const result = await completeGoogleAuth(db, code, state);
  return c.html(googleCallbackHtml(result.ok, result.ok ? result.email : undefined));
});

app.get("/v1/auth/dev-complete", (c) => {
  if (!config.devBypass) return c.text("Not available", 404);
  const state = c.req.query("state");
  if (!state) return c.text("missing state", 400);
  const row = db
    .prepare("SELECT client_id FROM auth_states WHERE state = ?")
    .get(state) as { client_id: string } | undefined;
  if (!row) return c.text("invalid state", 404);

  const token = mintToken(db, row.client_id, "dev@aibc.local");
  db.prepare(
    "UPDATE auth_states SET completed = 1, token = ?, email = ? WHERE state = ?",
  ).run(token, "dev@aibc.local", state);

  return c.html(`<html><body><h1>Signed in</h1><p>Return to aibc extension.</p></body></html>`);
});

app.get("/v1/auth/extension/poll", (c) => {
  const state = c.req.query("state");
  if (!state) return c.json({ status: "pending" });

  const row = db
    .prepare("SELECT completed, token, email, client_id FROM auth_states WHERE state = ?")
    .get(state) as
    | { completed: number; token: string | null; email: string | null; client_id: string }
    | undefined;

  if (!row) return c.json({ status: "pending" });
  if (row.completed !== 1 || !row.token) return c.json({ status: "pending" });

  return c.json({
    status: "complete",
    accessToken: row.token,
    email: row.email,
    clientId: row.client_id,
  });
});

app.post("/v1/auth/refresh", (c) => {
  const client = resolveClient(db, c.req.header("authorization"));
  if (!client) return c.json({ error: "unauthorized" }, 401);
  const token = mintToken(db, client.clientId, client.email || undefined);
  return c.json({ accessToken: token });
});

app.post("/v1/auth/signout", (c) => {
  const client = resolveClient(db, c.req.header("authorization"));
  if (client) {
    db.prepare("DELETE FROM sessions WHERE token = ?").run(client.token);
  }
  return c.json({ ok: true });
});

app.get("/v1/earnings", (c) => {
  const client = resolveClient(db, c.req.header("authorization"));
  if (!client) return c.json({ error: "unauthorized" }, 401);

  const row = db
    .prepare(
      "SELECT today, month, lifetime, pending, payable FROM earnings WHERE client_id = ?",
    )
    .get(client.clientId) as
    | { today: number; month: number; lifetime: number; pending: number; payable: number }
    | undefined;

  return c.json({
    today: row?.today ?? 0,
    month: row?.month ?? 0,
    lifetime: row?.lifetime ?? 0,
    pending: row?.pending ?? 0,
    payable: row?.payable ?? 0,
    caps: { hourlyCapHit: false, dailyCapHit: false },
  });
});

app.get("/v1/me/earnings", (c) => {
  const client = resolveClient(db, c.req.header("authorization"));
  if (!client) return c.json({ error: "unauthorized" }, 401);
  const row = db
    .prepare(
      "SELECT today, month, lifetime, pending, payable FROM earnings WHERE client_id = ?",
    )
    .get(client.clientId);
  return c.json(row ?? { today: 0, month: 0, lifetime: 0, pending: 0, payable: 0 });
});

app.get("/v1/me/activity", (c) => {
  const client = resolveClient(db, c.req.header("authorization"));
  if (!client) return c.json([]);
  const rows = db
    .prepare(
      "SELECT id, event_type as type, ad_id as adId, amount, created_at as createdAt FROM impressions WHERE client_id = ? ORDER BY created_at DESC LIMIT 50",
    )
    .all(client.clientId) as Array<{
      id: string;
      type: string;
      adId: string;
      amount: number;
      createdAt: number;
    }>;

  return c.json(
    rows.map((r) => ({
      id: r.id,
      type: r.type === "click" ? "click" : "impression",
      adId: r.adId,
      amount: r.amount,
      createdAt: new Date(r.createdAt).toISOString(),
    })),
  );
});

app.post("/v1/me/payout-method", async (c) => {
  const client = resolveClient(db, c.req.header("authorization"));
  if (!client) return c.json({ error: "unauthorized" }, 401);
  const body = (await c.req.json()) as { rail?: string; handle?: string };
  db.prepare(
    "INSERT OR REPLACE INTO payout_methods (client_id, rail, handle) VALUES (?, ?, ?)",
  ).run(client.clientId, body.rail || "wise", body.handle || "");
  return c.json({ ok: true });
});

app.post("/v1/me/payout-request", (c) => {
  const client = resolveClient(db, c.req.header("authorization"));
  if (!client) return c.json({ error: "unauthorized" }, 401);

  const row = db
    .prepare("SELECT payable FROM earnings WHERE client_id = ?")
    .get(client.clientId) as { payable: number } | undefined;

  const payable = row?.payable ?? 0;
  if (payable < 5) return c.json({ error: "Minimum payout is $5.00" }, 400);

  db.prepare(
    "UPDATE earnings SET payable = 0, pending = pending - ? WHERE client_id = ?",
  ).run(payable, client.clientId);

  return c.json({ ok: true, amount: payable });
});

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

app.post("/v1/webhooks/stripe", async (c) => {
  const raw = await c.req.text();
  const sig = c.req.header("stripe-signature");
  const result = await handleStripeWebhook(db, raw, sig);
  if (!result.ok) return c.text(result.message || "error", 400);
  return c.json({ received: true });
});

app.get("/health", (c) =>
  c.json({
    ok: true,
    auth: config.devBypass ? "dev" : config.googleClientId ? "google" : "none",
    stripe: stripeEnabled(),
  }),
);

app.get("/v1/advertiser/campaigns", (c) => {
  const client = resolveClient(db, c.req.header("authorization"));
  if (!client) return c.json({ error: "unauthorized" }, 401);
  const rows = db
    .prepare(
      "SELECT id, ad_line as adLine, destination_url as destinationUrl, brand_name as brandName, bid_per_1k as bidPer1k, blocks, show_on_leaderboard as showOnLeaderboard, status, impressions, spend, created_at as createdAt FROM campaigns WHERE client_id = ? ORDER BY created_at DESC",
    )
    .all(client.clientId);
  return c.json(rows);
});

app.post("/v1/advertiser/campaigns", async (c) => {
  const client = resolveClient(db, c.req.header("authorization"));
  if (!client) return c.json({ error: "unauthorized" }, 401);
  const body = (await c.req.json()) as Record<string, unknown>;
  const id = randomUUID();
  const adLine = String(body.adLine || "");
  const destinationUrl = String(body.destinationUrl || "");
  if (adLine.length < 3 || adLine.length > 60) {
    return c.json({ error: "Ad line must be 3-60 chars" }, 400);
  }

  db.prepare(`
    INSERT INTO campaigns (id, client_id, ad_line, destination_url, brand_name, bid_per_1k, blocks, show_on_leaderboard, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    client.clientId,
    adLine,
    destinationUrl,
    body.brandName || null,
    Number(body.bidPer1k || 5),
    Number(body.blocks || 10),
    body.showOnLeaderboard ? 1 : 0,
    Date.now(),
  );

  const adId = `campaign-${id.slice(0, 8)}`;
  db.prepare(
    "INSERT INTO ads (ad_id, text, click_url, brand, bid_per_1k) VALUES (?, ?, ?, ?, ?)",
  ).run(adId, adLine, destinationUrl, body.brandName || null, Number(body.bidPer1k || 5));

  return c.json({ id, adId });
});

app.patch("/v1/advertiser/campaigns/:id", async (c) => {
  const client = resolveClient(db, c.req.header("authorization"));
  if (!client) return c.json({ error: "unauthorized" }, 401);
  const id = c.req.param("id");
  const body = (await c.req.json()) as { status?: string };
  db.prepare("UPDATE campaigns SET status = ? WHERE id = ? AND client_id = ?").run(
    body.status || "paused",
    id,
    client.clientId,
  );
  return c.json({ ok: true });
});

app.post("/v1/me/consent", async (c) => {
  await c.req.json().catch(() => ({}));
  return c.json({ ok: true });
});

app.get("/v1/ext/manifest", (c) =>
  c.json({ version: "0.1.0", url: "", mandatory: false }),
);

const port = config.port;
serve({ fetch: app.fetch, port }, () => {
  console.log(`[aibc-api] ${config.publicUrl} (port ${port})`);
});

export default app;
