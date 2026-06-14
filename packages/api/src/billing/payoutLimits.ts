import type { Database as DbType } from "better-sqlite3";
import {
  MAX_PAYOUT_REQUESTS_PER_DAY,
  MAX_PAYOUT_REQUESTS_PER_WEEK,
  MAX_PAYOUT_USD_PER_DAY,
} from "./economics.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

export function checkPayoutLimits(
  db: DbType,
  clientId: string,
  amountUsd: number,
): { ok: true } | { ok: false; error: string } {
  const now = Date.now();
  const dayAgo = now - DAY_MS;
  const weekAgo = now - WEEK_MS;

  const dayCount = db
    .prepare(
      `SELECT COUNT(*) as c FROM payouts
       WHERE client_id = ? AND created_at > ? AND status != 'failed'`,
    )
    .get(clientId, dayAgo) as { c: number };

  if (dayCount.c >= MAX_PAYOUT_REQUESTS_PER_DAY) {
    return { ok: false, error: `Daily limit: ${MAX_PAYOUT_REQUESTS_PER_DAY} payout request(s) per day.` };
  }

  const weekCount = db
    .prepare(
      `SELECT COUNT(*) as c FROM payouts
       WHERE client_id = ? AND created_at > ? AND status != 'failed'`,
    )
    .get(clientId, weekAgo) as { c: number };

  if (weekCount.c >= MAX_PAYOUT_REQUESTS_PER_WEEK) {
    return { ok: false, error: `Weekly limit: ${MAX_PAYOUT_REQUESTS_PER_WEEK} payout request(s) per week.` };
  }

  const dayAmount = db
    .prepare(
      `SELECT COALESCE(SUM(amount), 0) as t FROM payouts
       WHERE client_id = ? AND created_at > ? AND status != 'failed'`,
    )
    .get(clientId, dayAgo) as { t: number };

  if (dayAmount.t + amountUsd > MAX_PAYOUT_USD_PER_DAY) {
    return {
      ok: false,
      error: `Daily withdrawal cap is $${MAX_PAYOUT_USD_PER_DAY.toFixed(2)}.`,
    };
  }

  return { ok: true };
}

export function payoutUsage(db: DbType, clientId: string) {
  const now = Date.now();
  const dayAgo = now - DAY_MS;
  const weekAgo = now - WEEK_MS;

  const dayCount = db
    .prepare(
      `SELECT COUNT(*) as c FROM payouts WHERE client_id = ? AND created_at > ? AND status != 'failed'`,
    )
    .get(clientId, dayAgo) as { c: number };

  const weekCount = db
    .prepare(
      `SELECT COUNT(*) as c FROM payouts WHERE client_id = ? AND created_at > ? AND status != 'failed'`,
    )
    .get(clientId, weekAgo) as { c: number };

  const dayAmount = db
    .prepare(
      `SELECT COALESCE(SUM(amount), 0) as t FROM payouts WHERE client_id = ? AND created_at > ? AND status != 'failed'`,
    )
    .get(clientId, dayAgo) as { t: number };

  return {
    requestsToday: dayCount.c,
    requestsThisWeek: weekCount.c,
    usdToday: dayAmount.t,
    maxRequestsPerDay: MAX_PAYOUT_REQUESTS_PER_DAY,
    maxRequestsPerWeek: MAX_PAYOUT_REQUESTS_PER_WEEK,
    maxUsdPerDay: MAX_PAYOUT_USD_PER_DAY,
  };
}
