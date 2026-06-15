import type { Database as DbType } from "better-sqlite3";
import { DEVELOPER_SHARE } from "../billing/economics.js";

export type YieldMetrics = {
  activeAgentsLastHour: number;
  developerEarningsLastHour: number;
  usdPerAgentHour: number;
  targetUsdPerAgentHour: number;
  developerShare: number;
};

const TARGET_USD_PER_AGENT_HOUR = 1;

export function computeYieldMetrics(db: DbType): YieldMetrics {
  const hourAgo = Date.now() - 60 * 60 * 1000;

  const activeRow = db
    .prepare(
      `SELECT COUNT(DISTINCT client_id) as c
       FROM impressions
       WHERE demo = 0 AND client_id IS NOT NULL AND created_at > ?`,
    )
    .get(hourAgo) as { c: number };

  const earningsRow = db
    .prepare(
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM impressions
       WHERE demo = 0 AND client_id IS NOT NULL AND created_at > ?`,
    )
    .get(hourAgo) as { total: number };

  const activeAgents = activeRow.c;
  const developerEarningsLastHour = earningsRow.total;
  const usdPerAgentHour =
    activeAgents > 0
      ? Math.round((developerEarningsLastHour / activeAgents) * 10000) / 10000
      : 0;

  return {
    activeAgentsLastHour: activeAgents,
    developerEarningsLastHour: Math.round(developerEarningsLastHour * 100) / 100,
    usdPerAgentHour,
    targetUsdPerAgentHour: TARGET_USD_PER_AGENT_HOUR,
    developerShare: DEVELOPER_SHARE,
  };
}

export function computeClientYieldMetrics(db: DbType, clientId: string) {
  const hourAgo = Date.now() - 60 * 60 * 1000;
  const row = db
    .prepare(
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM impressions
       WHERE demo = 0 AND client_id = ? AND created_at > ?`,
    )
    .get(clientId, hourAgo) as { total: number };

  const earned = row.total;
  return {
    usdPerAgentHour: Math.round(earned * 10000) / 10000,
    earningsLastHour: Math.round(earned * 100) / 100,
    targetUsdPerAgentHour: TARGET_USD_PER_AGENT_HOUR,
  };
}
