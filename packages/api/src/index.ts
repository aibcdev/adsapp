import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { randomUUID } from "node:crypto";
import {
  completeGoogleAuth,
  googleCallbackHtml,
} from "./auth/google.js";
import { authStartUrl, config, emailAuthEnabled, googleAuthUrl, stripeEnabled } from "./config.js";
import {
  createDb,
  getFeedJson,
  getPortfolioAds,
  mintToken,
  resolveClient,
} from "./db/schema.js";
import { processMetricEvent, earningsCaps, settlePendingForClient } from "./billing/ledger.js";
import {
  ensurePortfolioSessionTables,
  mintPortfolioSession,
  purgeExpiredSessions,
} from "./billing/portfolioSession.js";
import { MIN_PAYOUT_USD } from "./billing/economics.js";
import { checkPayoutLimits, payoutUsage } from "./billing/payoutLimits.js";
import {
  computeReferralBonus,
  ensureClientProfile,
  getReferralStats,
  markReferralBonusPaid,
} from "./clients/profile.js";
import {
  createDepositCheckout,
  ensureStripeTables,
  handleStripeWebhook,
} from "./stripe.js";
import { auctionRoutes, BLOCK_IMPRESSIONS } from "./routes/auction.js";
import { billingRoutes } from "./routes/billing.js";
import { adminRoutes } from "./routes/admin.js";

const db = createDb();
ensurePortfolioSessionTables(db);
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

/** Block accidental public API docs exposure (#25). */
app.use("*", async (c, next) => {
  const path = c.req.path.toLowerCase();
  if (
    path === "/docs" ||
    path === "/redoc" ||
    path === "/openapi.json" ||
    path.startsWith("/swagger")
  ) {
    return c.text("Not found", 404);
  }
  await next();
});

const VIEW_THRESHOLD = config.viewThresholdSeconds;
const ROTATION_MS = 120_000;

function portfolioPayload(clientId: string | null, deviceId?: string) {
  purgeExpiredSessions(db);
  const session = mintPortfolioSession(db, { clientId, deviceId });
  return {
    ads: getPortfolioAds(db),
    rotationIntervalMs: ROTATION_MS,
    view_threshold_seconds: VIEW_THRESHOLD,
    session_token: session.sessionToken,
    expires_at: session.expiresAt,
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
  const deviceId = c.req.query("client_id") || "demo";
  if (!deviceId) return c.json({ error: "client_id required" }, 400);
  return c.json(portfolioPayload(null, deviceId));
});

app.get("/v1/portfolio", (c) => {
  const client = resolveClient(db, c.req.header("authorization"));
  if (!client) return c.json({ error: "unauthorized" }, 401);
  return c.json(portfolioPayload(client.clientId));
});

app.post("/v1/metrics/demo", async (c) => {
  if (!config.devBypass) {
    return c.json({ error: "Demo metrics disabled in production" }, 403);
  }
  const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
  const event = String(body.event || body.event_type || body.kind || "impression");
  const adId = String(body.adId || body.ad_id || "unknown");
  const eventUuid = body.nonce ? String(body.nonce) : body.event_uuid ? String(body.event_uuid) : undefined;
  processMetricEvent(db, {
    clientId: null,
    adId,
    eventType: event,
    eventUuid,
    demo: true,
    sessionToken: body.session_token ? String(body.session_token) : undefined,
  });
  return c.json({ ok: true, demo: true });
});

app.post("/v1/metrics", async (c) => {
  const client = resolveClient(db, c.req.header("authorization"));
  if (!client) return c.json({ error: "unauthorized" }, 401);

  const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
  const event = String(body.event || body.event_type || body.kind || "impression");
  const adId = String(body.adId || body.ad_id || "unknown");
  const eventUuid = body.nonce ? String(body.nonce) : body.event_uuid ? String(body.event_uuid) : undefined;
  const sessionToken = body.session_token ? String(body.session_token) : undefined;

  const result = processMetricEvent(db, {
    clientId: client.clientId,
    adId,
    eventType: event,
    eventUuid,
    demo: false,
    sessionToken,
  });

  if (result.rejected) {
    return c.json({ ok: false, rejected: result.rejected }, 403);
  }

  return c.json(result);
});

app.get("/v1/auth/config", (c) =>
  c.json({
    google: Boolean(config.googleClientId),
    email: emailAuthEnabled(),
    devBypass: config.devBypass,
    portalUrl: config.portalUrl,
  }),
);

app.get("/v1/auth/google/redirect", (c) => {
  const state = c.req.query("state");
  if (!state) return c.json({ error: "state required" }, 400);
  const row = db
    .prepare("SELECT 1 FROM auth_states WHERE state = ? AND completed = 0")
    .get(state);
  if (!row) return c.json({ error: "invalid or expired session" }, 400);
  try {
    return c.redirect(googleAuthUrl(state));
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Auth unavailable" },
      503,
    );
  }
});

app.post("/v1/auth/email/complete", async (c) => {
  if (!emailAuthEnabled()) {
    return c.json({ error: "Email sign-in is disabled in production. Use Google." }, 403);
  }
  const body = (await c.req.json().catch(() => ({}))) as {
    state?: string;
    email?: string;
  };
  const state = body.state?.trim();
  const email = body.email?.trim().toLowerCase();
  if (!state || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return c.json({ error: "Valid state and email required" }, 400);
  }

  const row = db
    .prepare("SELECT client_id, completed FROM auth_states WHERE state = ?")
    .get(state) as { client_id: string; completed: number } | undefined;

  if (!row) return c.json({ error: "Invalid sign-in session" }, 400);
  if (row.completed === 1) return c.json({ error: "Session already used" }, 400);

  db.prepare("UPDATE clients SET email = ? WHERE id = ?").run(email, row.client_id);
  ensureClientProfile(db, row.client_id);
  const token = mintToken(db, row.client_id, email);
  db.prepare(
    "UPDATE auth_states SET completed = 1, token = ?, email = ? WHERE state = ?",
  ).run(token, email, state);

  return c.json({ ok: true, email });
});

app.post("/v1/auth/extension/start", async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as { referralCode?: string };
  const referredByCode = body.referralCode?.trim();

  const state = randomUUID();
  const clientId = randomUUID();
  db.prepare(
    "INSERT INTO clients (id, created_at) VALUES (?, ?)",
  ).run(clientId, Date.now());
  ensureClientProfile(db, clientId, referredByCode);
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
  return c.html(
    googleCallbackHtml(
      result.ok,
      result.ok ? state : undefined,
      result.ok ? result.email : undefined,
    ),
  );
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

  const redirect = `${config.portalUrl}/dashboard?auth_state=${encodeURIComponent(state)}`;
  return c.redirect(redirect);
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

  settlePendingForClient(db, client.clientId);

  const row = db
    .prepare(
      "SELECT today, month, lifetime, pending, payable FROM earnings WHERE client_id = ?",
    )
    .get(client.clientId) as
    | { today: number; month: number; lifetime: number; pending: number; payable: number }
    | undefined;

  const caps = earningsCaps(db, client.clientId);

  return c.json({
    today: row?.today ?? 0,
    today_usd: (row?.today ?? 0).toFixed(2),
    month: row?.month ?? 0,
    lifetime: row?.lifetime ?? 0,
    lifetime_usd: (row?.lifetime ?? 0).toFixed(2),
    pending: row?.pending ?? 0,
    payable: row?.payable ?? 0,
    developer_share: 0.7,
    caps: {
      hourlyCapHit: caps.hourlyCapHit,
      dailyCapHit: caps.dailyCapHit,
      hourlyEarned: caps.hourlyEarned,
      dailyEarned: caps.dailyEarned,
      hourlyCap: caps.hourlyCap,
      dailyCap: caps.dailyCap,
    },
  });
});

app.get("/v1/me", (c) => {
  const client = resolveClient(db, c.req.header("authorization"));
  if (!client) return c.json({ error: "unauthorized" }, 401);
  ensureClientProfile(db, client.clientId);
  const referral = getReferralStats(db, client.clientId, config.portalUrl);
  return c.json({
    email: client.email,
    clientId: client.clientId,
    foundingMember: referral.foundingMember,
    referral,
  });
});

app.get("/v1/me/referral", (c) => {
  const client = resolveClient(db, c.req.header("authorization"));
  if (!client) return c.json({ error: "unauthorized" }, 401);
  ensureClientProfile(db, client.clientId);
  return c.json(getReferralStats(db, client.clientId, config.portalUrl));
});

app.post("/v1/me/referral/apply", async (c) => {
  const client = resolveClient(db, c.req.header("authorization"));
  if (!client) return c.json({ error: "unauthorized" }, 401);
  const body = (await c.req.json().catch(() => ({}))) as { referralCode?: string };
  const code = body.referralCode?.trim();
  if (!code) return c.json({ error: "referralCode required" }, 400);
  ensureClientProfile(db, client.clientId, code);
  return c.json(getReferralStats(db, client.clientId, config.portalUrl));
});

app.get("/v1/me/earnings", (c) => {
  const client = resolveClient(db, c.req.header("authorization"));
  if (!client) return c.json({ error: "unauthorized" }, 401);
  settlePendingForClient(db, client.clientId);
  const row = db
    .prepare(
      "SELECT today, month, lifetime, pending, payable FROM earnings WHERE client_id = ?",
    )
    .get(client.clientId);
  const caps = earningsCaps(db, client.clientId);
  const payoutLimits = payoutUsage(db, client.clientId);
  return c.json({
    ...(row ?? { today: 0, month: 0, lifetime: 0, pending: 0, payable: 0 }),
    caps: {
      hourlyCapHit: caps.hourlyCapHit,
      dailyCapHit: caps.dailyCapHit,
      hourlyEarned: caps.hourlyEarned,
      dailyEarned: caps.dailyEarned,
      hourlyCap: caps.hourlyCap,
      dailyCap: caps.dailyCap,
    },
    payoutLimits,
  });
});

app.get("/v1/me/payout-method", (c) => {
  const client = resolveClient(db, c.req.header("authorization"));
  if (!client) return c.json({ error: "unauthorized" }, 401);
  const method = db
    .prepare("SELECT rail, handle FROM payout_methods WHERE client_id = ?")
    .get(client.clientId) as { rail: string; handle: string } | undefined;
  return c.json(method ?? { rail: "", handle: "" });
});

app.get("/v1/me/activity", (c) => {
  const client = resolveClient(db, c.req.header("authorization"));
  if (!client) return c.json([]);
  const rows = db
    .prepare(
      "SELECT id, event_type as type, ad_id as adId, amount, created_at as createdAt FROM impressions WHERE client_id = ? ORDER BY created_at DESC LIMIT 200",
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

  settlePendingForClient(db, client.clientId);

  const row = db
    .prepare("SELECT payable FROM earnings WHERE client_id = ?")
    .get(client.clientId) as { payable: number } | undefined;

  const payable = row?.payable ?? 0;
  if (payable < MIN_PAYOUT_USD) {
    return c.json({ error: `Minimum payout is $${MIN_PAYOUT_USD.toFixed(2)}` }, 400);
  }

  const method = db
    .prepare("SELECT rail, handle FROM payout_methods WHERE client_id = ?")
    .get(client.clientId) as { rail: string; handle: string } | undefined;

  if (!method?.handle) {
    return c.json({ error: "Save a payout method first" }, 400);
  }

  const referralBonus = computeReferralBonus(db, client.clientId);
  const totalAmount = payable + referralBonus;

  const limitCheck = checkPayoutLimits(db, client.clientId, totalAmount);
  if (!limitCheck.ok) {
    return c.json({ error: limitCheck.error }, 400);
  }

  const payoutId = randomUUID();
  db.prepare(
    `INSERT INTO payouts (id, client_id, amount, referral_bonus, rail, handle, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 'requested', ?)`,
  ).run(
    payoutId,
    client.clientId,
    totalAmount,
    referralBonus,
    method.rail,
    method.handle,
    Date.now(),
  );

  db.prepare("UPDATE earnings SET payable = 0 WHERE client_id = ?").run(client.clientId);
  if (referralBonus > 0) {
    markReferralBonusPaid(db, client.clientId);
  }

  return c.json({
    ok: true,
    amount: totalAmount,
    baseAmount: payable,
    referralBonus,
    payoutId,
    status: "requested",
  });
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

app.route("/", auctionRoutes(db));
app.route("/", billingRoutes(db));
app.route("/", adminRoutes(db));

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
  const adLine = String(body.adLine || "");
  const destinationUrl = String(body.destinationUrl || "");
  if (adLine.length < 3 || adLine.length > 60) {
    return c.json({ error: "Ad line must be 3-60 chars" }, 400);
  }
  if (!destinationUrl.startsWith("https://")) {
    return c.json({ error: "Destination URL must be https://" }, 400);
  }

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
      {
        error: "Campaign checkout required. Use /advertisers or POST /v1/billing/checkout.",
      },
      403,
    );
  }

  const id = randomUUID();
  db.prepare(`
    INSERT INTO campaigns (
      id, client_id, ad_line, destination_url, brand_name, bid_per_1k, blocks,
      show_on_leaderboard, status, created_at, payment_status, impressions_target, impressions_served
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, 'paid', ?, 0)
  `).run(
    id,
    client.clientId,
    adLine,
    destinationUrl,
    body.brandName || null,
    bidPer1k,
    blocks,
    body.showOnLeaderboard ? 1 : 0,
    Date.now(),
    impressionsTarget,
  );

  const adId = `campaign-${id.slice(0, 8)}`;
  db.prepare(
    "INSERT INTO ads (ad_id, text, click_url, brand, bid_per_1k) VALUES (?, ?, ?, ?, ?)",
  ).run(adId, adLine, destinationUrl, body.brandName || null, bidPer1k);

  return c.json({ id, adId, charged: stripeEnabled() && !config.devBypass ? totalCost : 0 });
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
