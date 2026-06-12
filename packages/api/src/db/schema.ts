import Database from "better-sqlite3";
import type { Database as DbType } from "better-sqlite3";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.AIBC_DB_PATH || join(__dirname, "..", "aibc.db");

export function createDb(): DbType {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      email TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      email TEXT,
      expires_at INTEGER NOT NULL,
      FOREIGN KEY (client_id) REFERENCES clients(id)
    );

    CREATE TABLE IF NOT EXISTS auth_states (
      state TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      token TEXT,
      email TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ads (
      ad_id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      click_url TEXT NOT NULL,
      brand TEXT,
      bid_per_1k REAL DEFAULT 5,
      active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS campaigns (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      ad_line TEXT NOT NULL,
      destination_url TEXT NOT NULL,
      brand_name TEXT,
      bid_per_1k REAL NOT NULL,
      blocks INTEGER NOT NULL,
      show_on_leaderboard INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      impressions INTEGER DEFAULT 0,
      spend REAL DEFAULT 0,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS impressions (
      id TEXT PRIMARY KEY,
      client_id TEXT,
      ad_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      amount REAL DEFAULT 0,
      demo INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS earnings (
      client_id TEXT PRIMARY KEY,
      today REAL DEFAULT 0,
      month REAL DEFAULT 0,
      lifetime REAL DEFAULT 0,
      pending REAL DEFAULT 0,
      payable REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS payout_methods (
      client_id TEXT PRIMARY KEY,
      rail TEXT,
      handle TEXT
    );

    CREATE TABLE IF NOT EXISTS advertiser_balance (
      client_id TEXT PRIMARY KEY,
      balance REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS killswitch (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      paused INTEGER DEFAULT 0
    );

    INSERT OR IGNORE INTO killswitch (id, paused) VALUES (1, 0);
  `);

  seedAds(db);
  return db;
}

function seedAds(db: DbType) {
  const count = db.prepare("SELECT COUNT(*) as c FROM ads").get() as { c: number };
  if (count.c > 0) return;

  const ads: [string, string, string, string, number][] = [
    ["ad-linear", "Linear — issue tracking built for speed", "https://linear.app", "Linear", 5],
    ["ad-raycast", "Raycast — blazingly fast launcher", "https://raycast.com", "Raycast", 5],
    ["ad-vercel", "Vercel — deploy in seconds", "https://vercel.com", "Vercel", 5],
    ["ad-supabase", "Supabase — Postgres made easy", "https://supabase.com", "Supabase", 5],
    ["ad-cursor", "Cursor — AI-native IDE", "https://cursor.com", "Cursor", 5],
  ];

  const insert = db.prepare(
    "INSERT INTO ads (ad_id, text, click_url, brand, bid_per_1k) VALUES (?, ?, ?, ?, ?)",
  );
  for (const ad of ads) insert.run(...ad);
}

export function getFeedJson() {
  const feedPath = join(__dirname, "..", "..", "..", "mock", "feed.json");
  return JSON.parse(readFileSync(feedPath, "utf8"));
}

export function mintToken(db: DbType, clientId: string, email?: string) {
  const token = randomUUID();
  const expires = Date.now() + 30 * 24 * 60 * 60 * 1000;
  db.prepare(
    "INSERT OR REPLACE INTO sessions (token, client_id, email, expires_at) VALUES (?, ?, ?, ?)",
  ).run(token, clientId, email || null, expires);
  db.prepare(
    "INSERT OR IGNORE INTO earnings (client_id) VALUES (?)",
  ).run(clientId);
  db.prepare(
    "INSERT OR IGNORE INTO advertiser_balance (client_id) VALUES (?)",
  ).run(clientId);
  return token;
}

export function resolveClient(db: DbType, authHeader?: string) {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  const row = db
    .prepare(
      "SELECT s.client_id, s.email, s.token FROM sessions s WHERE s.token = ? AND s.expires_at > ?",
    )
    .get(token, Date.now()) as
    | { client_id: string; email: string | null; token: string }
    | undefined;
  return row ? { clientId: row.client_id, email: row.email, token: row.token } : null;
}

export function getPortfolioAds(db: DbType) {
  return db
    .prepare("SELECT ad_id as adId, text, click_url as clickUrl, brand FROM ads WHERE active = 1")
    .all() as { adId: string; text: string; clickUrl: string; brand?: string }[];
}

export function creditEarnings(
  db: DbType,
  clientId: string,
  amount: number,
  adId: string,
  eventType: string,
) {
  const id = randomUUID();
  db.prepare(
    "INSERT INTO impressions (id, client_id, ad_id, event_type, amount, demo, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)",
  ).run(id, clientId, adId, eventType, amount, Date.now());

  db.prepare(`
    INSERT INTO earnings (client_id, today, month, lifetime, pending, payable)
    VALUES (?, ?, ?, ?, ?, 0)
    ON CONFLICT(client_id) DO UPDATE SET
      today = today + excluded.today,
      month = month + excluded.month,
      lifetime = lifetime + excluded.lifetime,
      pending = pending + excluded.pending
  `).run(clientId, amount, amount, amount, amount);
}