import { randomUUID } from "node:crypto";
import type { Database as DbType } from "better-sqlite3";

/** Portfolio ad session TTL — aligns with rotation interval. */
export const SESSION_TTL_MS = 120_000;

/** Max fresh sessions per signed-in client per hour (anti headless farming). */
export const MAX_SESSIONS_PER_CLIENT_HOUR = 40;

export function ensurePortfolioSessionTables(db: DbType): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS portfolio_sessions (
      token TEXT PRIMARY KEY,
      client_id TEXT,
      device_id TEXT,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS session_impressions (
      session_token TEXT NOT NULL,
      ad_id TEXT NOT NULL,
      impression_at INTEGER NOT NULL,
      PRIMARY KEY (session_token, ad_id)
    );
  `);
}

export function canMintPortfolioSession(db: DbType, clientId: string | null): boolean {
  if (!clientId) return true;
  const hourAgo = Date.now() - 60 * 60 * 1000;
  const row = db
    .prepare(
      "SELECT COUNT(*) as c FROM portfolio_sessions WHERE client_id = ? AND created_at > ?",
    )
    .get(clientId, hourAgo) as { c: number };
  return row.c < MAX_SESSIONS_PER_CLIENT_HOUR;
}

export function mintPortfolioSession(
  db: DbType,
  opts: { clientId: string | null; deviceId?: string },
): { sessionToken: string; expiresAt: number; rateLimited?: boolean } {
  const now = Date.now();
  const expiresAt = now + SESSION_TTL_MS;

  if (opts.clientId && !canMintPortfolioSession(db, opts.clientId)) {
    const existing = db
      .prepare(
        `SELECT token, expires_at FROM portfolio_sessions
         WHERE client_id = ? AND expires_at > ?
         ORDER BY created_at DESC LIMIT 1`,
      )
      .get(opts.clientId, now) as { token: string; expires_at: number } | undefined;
    if (existing) {
      return { sessionToken: existing.token, expiresAt: existing.expires_at, rateLimited: true };
    }
  }

  const token = randomUUID();
  db.prepare(
    "INSERT INTO portfolio_sessions (token, client_id, device_id, expires_at, created_at) VALUES (?, ?, ?, ?, ?)",
  ).run(token, opts.clientId, opts.deviceId || null, expiresAt, now);

  return { sessionToken: token, expiresAt };
}

export function validatePortfolioSession(
  db: DbType,
  sessionToken: string,
  clientId: string | null,
): boolean {
  const row = db
    .prepare(
      "SELECT client_id, expires_at FROM portfolio_sessions WHERE token = ?",
    )
    .get(sessionToken) as { client_id: string | null; expires_at: number } | undefined;

  if (!row || row.expires_at <= Date.now()) return false;
  if (clientId && row.client_id && row.client_id !== clientId) return false;
  if (!clientId && row.client_id) return false;
  return true;
}

export function recordSessionImpression(
  db: DbType,
  sessionToken: string,
  adId: string,
): void {
  db.prepare(
    "INSERT OR IGNORE INTO session_impressions (session_token, ad_id, impression_at) VALUES (?, ?, ?)",
  ).run(sessionToken, adId, Date.now());
}

export function hasSessionImpression(
  db: DbType,
  sessionToken: string,
  adId: string,
): boolean {
  const row = db
    .prepare(
      "SELECT 1 FROM session_impressions WHERE session_token = ? AND ad_id = ?",
    )
    .get(sessionToken, adId);
  return Boolean(row);
}

export function purgeExpiredSessions(db: DbType): void {
  const now = Date.now();
  const expired = db
    .prepare("SELECT token FROM portfolio_sessions WHERE expires_at <= ?")
    .all(now) as { token: string }[];
  for (const { token } of expired) {
    db.prepare("DELETE FROM session_impressions WHERE session_token = ?").run(token);
    db.prepare("DELETE FROM portfolio_sessions WHERE token = ?").run(token);
  }
}
