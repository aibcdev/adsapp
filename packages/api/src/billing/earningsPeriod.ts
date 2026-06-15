import { randomUUID } from "node:crypto";
import type { Database as DbType } from "better-sqlite3";
import { SEED_AD_IDS } from "./seedInventory.js";

const BILLABLE_EVENTS = ["view_threshold_met", "click", "error_impression"];

export function startOfDayMs(now = Date.now()): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function startOfMonthMs(now = Date.now()): number {
  const d = new Date(now);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Zero stale today/month counters when the calendar period rolls over. */
export function refreshEarningsPeriods(db: DbType, clientId: string): void {
  const dayStart = startOfDayMs();
  const monthStart = startOfMonthMs();
  db.prepare(
    `INSERT OR IGNORE INTO earnings (client_id, period_day, period_month) VALUES (?, ?, ?)`,
  ).run(clientId, dayStart, monthStart);

  const row = db
    .prepare("SELECT period_day, period_month FROM earnings WHERE client_id = ?")
    .get(clientId) as { period_day: number | null; period_month: number | null };

  if (!row.period_day || row.period_day < dayStart) {
    db.prepare("UPDATE earnings SET today = 0, period_day = ? WHERE client_id = ?").run(
      dayStart,
      clientId,
    );
  }
  if (!row.period_month || row.period_month < monthStart) {
    db.prepare("UPDATE earnings SET month = 0, period_month = ? WHERE client_id = ?").run(
      monthStart,
      clientId,
    );
  }
}

/** Rebuild earnings aggregates from impression ledger (after data cleanup). */
export function recalcEarningsFromImpressions(db: DbType, clientId: string): void {
  const dayStart = startOfDayMs();
  const monthStart = startOfMonthMs();
  const placeholders = BILLABLE_EVENTS.map(() => "?").join(", ");

  const sums = db
    .prepare(
      `SELECT
        COALESCE(SUM(CASE WHEN created_at >= ? THEN amount ELSE 0 END), 0) as today,
        COALESCE(SUM(CASE WHEN created_at >= ? THEN amount ELSE 0 END), 0) as month,
        COALESCE(SUM(amount), 0) as lifetime
      FROM impressions
      WHERE client_id = ? AND demo = 0 AND event_type IN (${placeholders})`,
    )
    .get(dayStart, monthStart, clientId, ...BILLABLE_EVENTS) as {
    today: number;
    month: number;
    lifetime: number;
  };

  const pendingRow = db
    .prepare(
      "SELECT COALESCE(SUM(amount), 0) as t FROM pending_credits WHERE client_id = ? AND settled = 0",
    )
    .get(clientId) as { t: number };

  const payableRow = db
    .prepare("SELECT payable FROM earnings WHERE client_id = ?")
    .get(clientId) as { payable: number } | undefined;

  db.prepare(`
    INSERT INTO earnings (client_id, today, month, lifetime, pending, payable, period_day, period_month)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(client_id) DO UPDATE SET
      today = excluded.today,
      month = excluded.month,
      lifetime = excluded.lifetime,
      pending = excluded.pending,
      period_day = excluded.period_day,
      period_month = excluded.period_month
  `).run(
    clientId,
    sums.today,
    sums.month,
    sums.lifetime,
    pendingRow.t,
    payableRow?.payable ?? 0,
    dayStart,
    monthStart,
  );
}

export function stripSeedCreditsFromLedger(db: DbType): number {
  const seedIds = [...SEED_AD_IDS];
  const placeholders = seedIds.map(() => "?").join(", ");

  const run = db.transaction(() => {
    const rows = db
      .prepare(
        `SELECT id FROM impressions
         WHERE amount > 0 AND (ad_id IN (${placeholders}) OR ad_id LIKE 'campaign-seed%')`,
      )
      .all(...seedIds) as Array<{ id: string }>;

    for (const row of rows) {
      db.prepare("DELETE FROM pending_credits WHERE impression_id = ?").run(row.id);
    }

    const result = db
      .prepare(
        `UPDATE impressions SET amount = 0
         WHERE amount > 0 AND (ad_id IN (${placeholders}) OR ad_id LIKE 'campaign-seed%')`,
      )
      .run(...seedIds);

    return result.changes;
  });

  return run();
}
