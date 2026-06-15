import { randomUUID } from "node:crypto";
import type { Database as DbType } from "better-sqlite3";
import { mintToken } from "../db/schema.js";

const HANDOFF_TTL_MS = 2 * 60 * 1000;

export function ensureHandoffTable(db: DbType): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS auth_handoffs (
      code TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      email TEXT,
      expires_at INTEGER NOT NULL,
      used INTEGER DEFAULT 0
    );
  `);
}

export function purgeExpiredHandoffs(db: DbType): void {
  db.prepare("DELETE FROM auth_handoffs WHERE expires_at < ? OR used = 1").run(Date.now());
}

export function createDashboardHandoff(
  db: DbType,
  clientId: string,
  email: string | null,
): string {
  purgeExpiredHandoffs(db);
  const code = randomUUID();
  db.prepare(
    "INSERT INTO auth_handoffs (code, client_id, email, expires_at, used) VALUES (?, ?, ?, ?, 0)",
  ).run(code, clientId, email, Date.now() + HANDOFF_TTL_MS);
  return code;
}

export function redeemDashboardHandoff(
  db: DbType,
  code: string,
): { accessToken: string; email: string | null; clientId: string } | null {
  purgeExpiredHandoffs(db);
  const row = db
    .prepare(
      "SELECT client_id, email FROM auth_handoffs WHERE code = ? AND used = 0 AND expires_at > ?",
    )
    .get(code, Date.now()) as { client_id: string; email: string | null } | undefined;

  if (!row) return null;

  db.prepare("UPDATE auth_handoffs SET used = 1 WHERE code = ?").run(code);
  const token = mintToken(db, row.client_id, row.email || undefined);
  return { accessToken: token, email: row.email, clientId: row.client_id };
}
