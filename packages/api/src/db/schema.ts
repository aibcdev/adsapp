import Database from "better-sqlite3";
import type { Database as DbType } from "better-sqlite3";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { processMetricEvent } from "../billing/ledger.js";
import { startOfDayMs, startOfMonthMs } from "../billing/earningsPeriod.js";
import { ensureMarketplaceTables } from "../marketplace/stats.js";
import { ensureClientProfile } from "../clients/profile.js";
import { effectiveBidForClient, getSignalProfile } from "../clients/signalProfile.js";

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
      created_at INTEGER NOT NULL,
      buyer_email TEXT,
      icon_url TEXT,
      payment_status TEXT DEFAULT 'paid',
      impressions_target INTEGER DEFAULT 0,
      impressions_served INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS impressions (
      id TEXT PRIMARY KEY,
      client_id TEXT,
      ad_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      amount REAL DEFAULT 0,
      demo INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      event_uuid TEXT
    );

    CREATE TABLE IF NOT EXISTS pending_credits (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      amount REAL NOT NULL,
      settles_at INTEGER NOT NULL,
      settled INTEGER DEFAULT 0,
      impression_id TEXT
    );

    CREATE TABLE IF NOT EXISTS payouts (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      amount REAL NOT NULL,
      rail TEXT,
      handle TEXT,
      status TEXT DEFAULT 'requested',
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

  migrateCampaignColumns(db);
  migrateClientColumns(db);
  migratePayoutColumns(db);
  migrateEarningsColumns(db);
  migrateMarketplaceTables(db);
  seedAds(db);
  seedCampaigns(db);
  return db;
}

function migrateClientColumns(db: DbType) {
  const cols = db.prepare("PRAGMA table_info(clients)").all() as { name: string }[];
  const names = new Set(cols.map((c) => c.name));
  const add = (sql: string) => {
    try {
      db.exec(sql);
    } catch {
      /* column exists */
    }
  };
  if (!names.has("founding_member")) add("ALTER TABLE clients ADD COLUMN founding_member INTEGER DEFAULT 0");
  if (!names.has("founding_enrolled_at")) add("ALTER TABLE clients ADD COLUMN founding_enrolled_at INTEGER");
  if (!names.has("referral_code")) add("ALTER TABLE clients ADD COLUMN referral_code TEXT");
  if (!names.has("referred_by_client_id")) add("ALTER TABLE clients ADD COLUMN referred_by_client_id TEXT");
  if (!names.has("referral_qualified_at")) add("ALTER TABLE clients ADD COLUMN referral_qualified_at INTEGER");
  if (!names.has("referral_bonus_paid")) add("ALTER TABLE clients ADD COLUMN referral_bonus_paid INTEGER DEFAULT 0");
  try {
    db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_referral_code ON clients(referral_code) WHERE referral_code IS NOT NULL");
  } catch {
    /* exists */
  }
}

function migrateEarningsColumns(db: DbType) {
  const cols = db.prepare("PRAGMA table_info(earnings)").all() as { name: string }[];
  const names = new Set(cols.map((c) => c.name));
  const add = (sql: string) => {
    try {
      db.exec(sql);
    } catch {
      /* column exists */
    }
  };
  if (!names.has("period_day")) add("ALTER TABLE earnings ADD COLUMN period_day INTEGER");
  if (!names.has("period_month")) add("ALTER TABLE earnings ADD COLUMN period_month INTEGER");
}

function migrateMarketplaceTables(db: DbType) {
  ensureMarketplaceTables(db);
}

function migratePayoutColumns(db: DbType) {
  const cols = db.prepare("PRAGMA table_info(payouts)").all() as { name: string }[];
  const names = new Set(cols.map((c) => c.name));
  if (!names.has("referral_bonus")) {
    try {
      db.exec("ALTER TABLE payouts ADD COLUMN referral_bonus REAL DEFAULT 0");
    } catch {
      /* exists */
    }
  }
}

function migrateCampaignColumns(db: DbType) {
  const cols = db.prepare("PRAGMA table_info(campaigns)").all() as { name: string }[];
  const names = new Set(cols.map((c) => c.name));
  const add = (sql: string) => {
    try {
      db.exec(sql);
    } catch {
      /* column exists */
    }
  };
  if (!names.has("buyer_email")) add("ALTER TABLE campaigns ADD COLUMN buyer_email TEXT");
  if (!names.has("icon_url")) add("ALTER TABLE campaigns ADD COLUMN icon_url TEXT");
  if (!names.has("payment_status")) {
    add("ALTER TABLE campaigns ADD COLUMN payment_status TEXT DEFAULT 'paid'");
  }
  if (!names.has("impressions_target")) {
    add("ALTER TABLE campaigns ADD COLUMN impressions_target INTEGER DEFAULT 0");
  }
  if (!names.has("impressions_served")) {
    add("ALTER TABLE campaigns ADD COLUMN impressions_served INTEGER DEFAULT 0");
  }
  try {
    db.exec("ALTER TABLE impressions ADD COLUMN event_uuid TEXT");
  } catch {
    /* exists */
  }
  try {
    db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_impressions_event_uuid ON impressions(event_uuid) WHERE event_uuid IS NOT NULL");
  } catch {
    /* exists */
  }
}

function seedCampaigns(db: DbType) {
  const woodsLine = "WOODS — The #1 Student Companion";
  const woodsUrl = "https://aibcmedia.com/advertisers";
  const woodsBrand = "WOODS";

  db.prepare(`
    UPDATE campaigns SET ad_line = ?, destination_url = ?, brand_name = ?
    WHERE id = 'seed-aibc-nasdaq'
  `).run(woodsLine, woodsUrl, woodsBrand);

  db.prepare(`
    UPDATE ads SET text = ?, click_url = ?, brand = ?
    WHERE ad_id = 'campaign-seed-aib'
  `).run(woodsLine, woodsUrl, woodsBrand);

  const count = db.prepare("SELECT COUNT(*) as c FROM campaigns").get() as { c: number };
  if (count.c > 0) return;

  const id = "seed-aibc-nasdaq";
  db.prepare(`
    INSERT INTO campaigns (
      id, client_id, ad_line, destination_url, brand_name, bid_per_1k, blocks,
      show_on_leaderboard, status, created_at, payment_status, impressions_target, impressions_served
    ) VALUES (?, 'seed', ?, ?, ?, ?, ?, 1, 'active', ?, 'paid', ?, 0)
  `).run(
    id,
    woodsLine,
    woodsUrl,
    woodsBrand,
    5,
    200,
    Date.now(),
    200000,
  );

  db.prepare(
    "INSERT OR REPLACE INTO ads (ad_id, text, click_url, brand, bid_per_1k, active) VALUES (?, ?, ?, ?, ?, 1)",
  ).run("campaign-seed-aib", woodsLine, woodsUrl, woodsBrand, 5);
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

export function mintToken(db: DbType, clientId: string, email?: string, referredByCode?: string) {
  const token = randomUUID();
  const expires = Date.now() + 30 * 24 * 60 * 60 * 1000;
  db.prepare(
    "INSERT OR REPLACE INTO sessions (token, client_id, email, expires_at) VALUES (?, ?, ?, ?)",
  ).run(token, clientId, email || null, expires);
  db.prepare(
    `INSERT OR IGNORE INTO earnings (client_id, period_day, period_month) VALUES (?, ?, ?)`,
  ).run(clientId, startOfDayMs(), startOfMonthMs());
  db.prepare(
    "INSERT OR IGNORE INTO advertiser_balance (client_id) VALUES (?)",
  ).run(clientId);
  ensureClientProfile(db, clientId, referredByCode);
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

export function getPortfolioAds(db: DbType, clientId?: string | null) {
  const seeded = db
    .prepare(
      "SELECT ad_id as adId, text, click_url as clickUrl, brand, bid_per_1k as bidPer1k FROM ads WHERE active = 1",
    )
    .all() as { adId: string; text: string; clickUrl: string; brand?: string; bidPer1k: number }[];

  const campaigns = db
    .prepare(`
      SELECT 'campaign-' || substr(id, 1, 8) as adId, ad_line as text, destination_url as clickUrl,
             brand_name as brand, bid_per_1k as bidPer1k
      FROM campaigns
      WHERE payment_status = 'paid' AND status = 'active' AND client_id != 'seed'
        AND impressions_served < impressions_target
      ORDER BY bid_per_1k DESC
    `)
    .all() as { adId: string; text: string; clickUrl: string; brand?: string; bidPer1k: number }[];

  let sortBid = (bid: number) => bid;
  if (clientId) {
    const profile = getSignalProfile(db, clientId);
    sortBid = (bid) => effectiveBidForClient(bid, profile, "");
  }

  const merged = [...campaigns, ...seeded];
  merged.sort((a, b) => sortBid(b.bidPer1k || 0) - sortBid(a.bidPer1k || 0));
  return merged.map(({ adId, text, clickUrl, brand }) => ({
    adId,
    text,
    clickUrl,
    brand,
    campaignId: adId.startsWith("campaign-") ? adId.slice("campaign-".length) : adId,
  }));
}

export function creditEarnings(
  db: DbType,
  clientId: string,
  _amount: number,
  adId: string,
  eventType: string,
) {
  processMetricEvent(db, { clientId, adId, eventType });
}