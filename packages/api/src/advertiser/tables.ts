import type { Database as DbType } from "better-sqlite3";

export function ensureAdvertiserPartnerTables(db: DbType): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS advertiser_brands (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      name TEXT NOT NULL,
      logo_url TEXT,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_advertiser_brands_client ON advertiser_brands(client_id);

    CREATE TABLE IF NOT EXISTS advertiser_profiles (
      client_id TEXT PRIMARY KEY,
      account_type TEXT DEFAULT 'direct'
    );

    CREATE TABLE IF NOT EXISTS advertiser_partners (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL UNIQUE,
      code TEXT NOT NULL UNIQUE,
      commission_pct REAL DEFAULT 0.15,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS advertiser_referrals (
      referred_client_id TEXT PRIMARY KEY,
      partner_id TEXT NOT NULL,
      attributed_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS partner_commission_ledger (
      id TEXT PRIMARY KEY,
      partner_id TEXT NOT NULL,
      campaign_id TEXT,
      spend_usd REAL NOT NULL,
      commission_usd REAL NOT NULL,
      created_at INTEGER NOT NULL,
      settled_at INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_partner_commission_partner ON partner_commission_ledger(partner_id);
  `);

  migrateCampaignAdvertiserColumns(db);
  migrateImpressionAnalyticsColumns(db);
  migrateClientCountryColumn(db);
}

function migrateCampaignAdvertiserColumns(db: DbType) {
  const cols = db.prepare("PRAGMA table_info(campaigns)").all() as { name: string }[];
  const names = new Set(cols.map((c) => c.name));
  const add = (sql: string) => {
    try {
      db.exec(sql);
    } catch {
      /* exists */
    }
  };
  if (!names.has("brand_id")) add("ALTER TABLE campaigns ADD COLUMN brand_id TEXT");
  if (!names.has("target_countries")) add("ALTER TABLE campaigns ADD COLUMN target_countries TEXT");
}

function migrateImpressionAnalyticsColumns(db: DbType) {
  const cols = db.prepare("PRAGMA table_info(impressions)").all() as { name: string }[];
  const names = new Set(cols.map((c) => c.name));
  const add = (sql: string) => {
    try {
      db.exec(sql);
    } catch {
      /* exists */
    }
  };
  if (!names.has("editor")) add("ALTER TABLE impressions ADD COLUMN editor TEXT");
  if (!names.has("language")) add("ALTER TABLE impressions ADD COLUMN language TEXT");
  if (!names.has("country_code")) add("ALTER TABLE impressions ADD COLUMN country_code TEXT");
  if (!names.has("campaign_id")) add("ALTER TABLE impressions ADD COLUMN campaign_id TEXT");
}

function migrateClientCountryColumn(db: DbType) {
  const cols = db.prepare("PRAGMA table_info(clients)").all() as { name: string }[];
  const names = new Set(cols.map((c) => c.name));
  if (!names.has("country_code")) {
    try {
      db.exec("ALTER TABLE clients ADD COLUMN country_code TEXT");
    } catch {
      /* exists */
    }
  }
}

export function ensureAdvertiserProfile(db: DbType, clientId: string, accountType = "direct"): void {
  db.prepare(
    "INSERT OR IGNORE INTO advertiser_profiles (client_id, account_type) VALUES (?, ?)",
  ).run(clientId, accountType);
}

export function parseTargetCountries(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((c) => String(c).trim().toUpperCase())
      .filter((c) => /^[A-Z]{2}$/.test(c));
  } catch {
    return [];
  }
}

export function serializeTargetCountries(countries: string[]): string | null {
  const normalized = countries
    .map((c) => c.trim().toUpperCase())
    .filter((c) => /^[A-Z]{2}$/.test(c));
  if (normalized.length === 0) return null;
  return JSON.stringify([...new Set(normalized)]);
}
