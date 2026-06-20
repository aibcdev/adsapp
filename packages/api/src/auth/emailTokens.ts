import { randomUUID } from "node:crypto";
import type { Database as DbType } from "better-sqlite3";

export type EmailTokenPurpose = "magic_link" | "password_reset";

const TTL_MS: Record<EmailTokenPurpose, number> = {
  magic_link: 30 * 60 * 1000,
  password_reset: 60 * 60 * 1000,
};

export function ensureEmailTokenTables(db: DbType): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS auth_email_tokens (
      token TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      purpose TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      used INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_auth_email_tokens_email ON auth_email_tokens (email, purpose);
  `);
}

export function createEmailToken(
  db: DbType,
  email: string,
  purpose: EmailTokenPurpose,
): string {
  ensureEmailTokenTables(db);
  const token = randomUUID().replace(/-/g, "");
  const now = Date.now();
  db.prepare(
    `INSERT INTO auth_email_tokens (token, email, purpose, expires_at, used, created_at)
     VALUES (?, ?, ?, ?, 0, ?)`,
  ).run(token, email.trim().toLowerCase(), purpose, now + TTL_MS[purpose], now);
  return token;
}

export function consumeEmailToken(
  db: DbType,
  token: string,
  purpose: EmailTokenPurpose,
): { email: string } | null {
  ensureEmailTokenTables(db);
  const row = db
    .prepare(
      `SELECT email, expires_at, used FROM auth_email_tokens WHERE token = ? AND purpose = ?`,
    )
    .get(token, purpose) as { email: string; expires_at: number; used: number } | undefined;
  if (!row || row.used === 1 || row.expires_at < Date.now()) return null;
  db.prepare("UPDATE auth_email_tokens SET used = 1 WHERE token = ?").run(token);
  return { email: row.email };
}
