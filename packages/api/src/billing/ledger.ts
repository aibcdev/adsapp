import { randomUUID } from "node:crypto";
import type { Database as DbType } from "better-sqlite3";
import {
  developerClickPay,
  developerImpressionPay,
  HOURLY_CAP_USD,
  DAILY_CAP_USD,
  SETTLEMENT_HOLD_MS,
} from "./economics.js";
import {
  hasSessionImpression,
  recordSessionImpression,
  validatePortfolioSession,
} from "./portfolioSession.js";
import { foundingBonusMultiplier, maybeQualifyReferral } from "../clients/profile.js";
import { isNonBillableAd } from "./seedInventory.js";
import { refreshEarningsPeriods, startOfDayMs, startOfMonthMs } from "./earningsPeriod.js";

const BILLABLE_EVENTS = new Set([
  "view_threshold_met",
  "error_impression",
  "click",
]);

const IMPRESSION_EVENTS = new Set(["impression_rendered", "impression"]);

function resolveBid(db: DbType, adId: string): number {
  const ad = db
    .prepare("SELECT bid_per_1k FROM ads WHERE ad_id = ?")
    .get(adId) as { bid_per_1k: number } | undefined;
  return ad?.bid_per_1k ?? 5;
}

function campaignIdFromAdId(adId: string): string | null {
  if (!adId.startsWith("campaign-")) return null;
  return adId.slice("campaign-".length);
}

function incrementCampaignDelivery(
  db: DbType,
  adId: string,
  advertiserCost: number,
): void {
  const prefix = campaignIdFromAdId(adId);
  if (!prefix) return;

  db.prepare(`
    UPDATE campaigns SET
      impressions_served = impressions_served + 1,
      impressions = impressions + 1,
      spend = spend + ?
    WHERE substr(id, 1, 8) = ? AND payment_status = 'paid'
  `).run(advertiserCost, prefix);

  db.prepare(`
    UPDATE campaigns SET status = 'exhausted'
    WHERE substr(id, 1, 8) = ? AND payment_status = 'paid'
      AND impressions_served >= impressions_target AND impressions_target > 0
  `).run(prefix);

  db.prepare(`
    UPDATE ads SET active = 0
    WHERE ad_id = ? AND ad_id IN (
      SELECT 'campaign-' || substr(id, 1, 8) FROM campaigns
      WHERE substr(id, 1, 8) = ? AND status = 'exhausted'
    )
  `).run(adId, prefix);
}

function settlePendingCredits(db: DbType, clientId: string): void {
  const now = Date.now();
  const row = db
    .prepare(
      "SELECT COALESCE(SUM(amount), 0) as total FROM pending_credits WHERE client_id = ? AND settled = 0 AND settles_at <= ?",
    )
    .get(clientId, now) as { total: number };

  const amount = row.total ?? 0;
  if (amount <= 0) return;

  db.prepare(
    "UPDATE pending_credits SET settled = 1 WHERE client_id = ? AND settled = 0 AND settles_at <= ?",
  ).run(clientId, now);

  db.prepare(`
    UPDATE earnings SET
      pending = CASE WHEN pending - ? < 0 THEN 0 ELSE pending - ? END,
      payable = payable + ?
    WHERE client_id = ?
  `).run(amount, amount, amount, clientId);
}

export function settlePendingForClient(db: DbType, clientId: string): void {
  refreshEarningsPeriods(db, clientId);
  settlePendingCredits(db, clientId);
}

function capCheck(db: DbType, clientId: string, amount: number): boolean {
  const hourAgo = Date.now() - 60 * 60 * 1000;
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const hour = db
    .prepare(
      "SELECT COALESCE(SUM(amount), 0) as t FROM impressions WHERE client_id = ? AND demo = 0 AND created_at > ?",
    )
    .get(clientId, hourAgo) as { t: number };
  const day = db
    .prepare(
      "SELECT COALESCE(SUM(amount), 0) as t FROM impressions WHERE client_id = ? AND demo = 0 AND created_at > ?",
    )
    .get(clientId, dayAgo) as { t: number };

  if (hour.t + amount > HOURLY_CAP_USD) return false;
  if (day.t + amount > DAILY_CAP_USD) return false;
  return true;
}

export function processMetricEvent(
  db: DbType,
  opts: {
    clientId: string | null;
    adId: string;
    eventType: string;
    eventUuid?: string;
    demo?: boolean;
    sessionToken?: string;
  },
): { ok: boolean; credited?: number; demo?: boolean; rejected?: string } {
  const event = opts.eventType;

  if (IMPRESSION_EVENTS.has(event)) {
    if (opts.demo || !opts.clientId || !opts.sessionToken) {
      return { ok: true };
    }
    if (!validatePortfolioSession(db, opts.sessionToken, opts.clientId)) {
      return { ok: true, rejected: "invalid_session" };
    }
    recordSessionImpression(db, opts.sessionToken, opts.adId);
    return { ok: true };
  }

  if (!BILLABLE_EVENTS.has(event)) {
    return { ok: true };
  }

  if (opts.eventUuid) {
    const dup = db
      .prepare("SELECT id FROM impressions WHERE event_uuid = ?")
      .get(opts.eventUuid);
    if (dup) return { ok: true };
  }

  if (opts.demo || !opts.clientId) {
    db.prepare(
      "INSERT INTO impressions (id, client_id, ad_id, event_type, amount, demo, created_at, event_uuid) VALUES (?, NULL, ?, ?, 0, 1, ?, ?)",
    ).run(randomUUID(), opts.adId, event, Date.now(), opts.eventUuid || null);
    return { ok: true, demo: true };
  }

  if (!opts.sessionToken || !validatePortfolioSession(db, opts.sessionToken, opts.clientId)) {
    return { ok: false, rejected: "invalid_session" };
  }

  if (!hasSessionImpression(db, opts.sessionToken, opts.adId)) {
    return { ok: false, rejected: "no_prior_impression" };
  }

  if (isNonBillableAd(db, opts.adId)) {
    db.prepare(
      "INSERT INTO impressions (id, client_id, ad_id, event_type, amount, demo, created_at, event_uuid) VALUES (?, ?, ?, ?, 0, 0, ?, ?)",
    ).run(
      randomUUID(),
      opts.clientId,
      opts.adId,
      event,
      Date.now(),
      opts.eventUuid || null,
    );
    return { ok: true, credited: 0 };
  }

  const bid = resolveBid(db, opts.adId);
  const advertiserCost =
    event === "click"
      ? (bid / 1000) * 50
      : bid / 1000;

  incrementCampaignDelivery(db, opts.adId, advertiserCost);

  const baseAmount =
    event === "click" ? developerClickPay(bid) : developerImpressionPay(bid);
  const multiplier = foundingBonusMultiplier(db, opts.clientId);
  const amount = Math.round(baseAmount * multiplier * 1e6) / 1e6;

  if (!capCheck(db, opts.clientId, amount)) {
    return { ok: true };
  }

  refreshEarningsPeriods(db, opts.clientId);

  const id = randomUUID();
  const settlesAt = Date.now() + SETTLEMENT_HOLD_MS;

  db.prepare(
    "INSERT INTO impressions (id, client_id, ad_id, event_type, amount, demo, created_at, event_uuid) VALUES (?, ?, ?, ?, ?, 0, ?, ?)",
  ).run(id, opts.clientId, opts.adId, event, amount, Date.now(), opts.eventUuid || null);

  db.prepare(`
    INSERT INTO earnings (client_id, today, month, lifetime, pending, payable, period_day, period_month)
    VALUES (?, ?, ?, ?, ?, 0, ?, ?)
    ON CONFLICT(client_id) DO UPDATE SET
      today = today + excluded.today,
      month = month + excluded.month,
      lifetime = lifetime + excluded.lifetime,
      pending = pending + excluded.pending
  `).run(
    opts.clientId,
    amount,
    amount,
    amount,
    amount,
    startOfDayMs(),
    startOfMonthMs(),
  );

  db.prepare(
    "INSERT INTO pending_credits (id, client_id, amount, settles_at, settled, impression_id) VALUES (?, ?, ?, ?, 0, ?)",
  ).run(randomUUID(), opts.clientId, amount, settlesAt, id);

  settlePendingCredits(db, opts.clientId);
  maybeQualifyReferral(db, opts.clientId);

  return { ok: true, credited: amount };
}

export function earningsCaps(db: DbType, clientId: string) {
  const hourAgo = Date.now() - 60 * 60 * 1000;
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const hour = db
    .prepare(
      "SELECT COALESCE(SUM(amount), 0) as t FROM impressions WHERE client_id = ? AND demo = 0 AND created_at > ?",
    )
    .get(clientId, hourAgo) as { t: number };
  const day = db
    .prepare(
      "SELECT COALESCE(SUM(amount), 0) as t FROM impressions WHERE client_id = ? AND demo = 0 AND created_at > ?",
    )
    .get(clientId, dayAgo) as { t: number };

  return {
    hourlyCapHit: hour.t >= HOURLY_CAP_USD,
    dailyCapHit: day.t >= DAILY_CAP_USD,
    hourlyEarned: hour.t,
    dailyEarned: day.t,
    hourlyCap: HOURLY_CAP_USD,
    dailyCap: DAILY_CAP_USD,
  };
}
