#!/usr/bin/env node
/**
 * Onboard an advertiser reseller platform (e.g. aads.com).
 *
 * Commission tiers (all referred clients combined):
 *   15% until $15,000 settled spend → 20% thereafter
 *
 * Usage:
 *   node scripts/create-advertiser-partner.mjs <code> <email>
 *
 * Example:
 *   node scripts/create-advertiser-partner.mjs aads partners@aads.com
 */
import Database from "better-sqlite3";
import { randomUUID } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.AIBC_DB_PATH || join(__dirname, "..", "packages", "api", "src", "aibc.db");
const PORTAL_URL = (process.env.AIBC_PORTAL_URL || "https://aibcmedia.com").replace(/\/$/, "");

const code = (process.argv[2] || "").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
const email = (process.argv[3] || "").trim().toLowerCase();

if (!code || !email || !email.includes("@")) {
  console.error("Usage: node scripts/create-advertiser-partner.mjs <code> <email>");
  console.error("Example: node scripts/create-advertiser-partner.mjs aads partners@aads.com");
  process.exit(1);
}

const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS advertiser_partners (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,
    commission_pct REAL DEFAULT 0.15,
    created_at INTEGER NOT NULL
  );
`);

let client = db.prepare("SELECT id FROM clients WHERE email = ?").get(email);
let clientCreated = false;
if (!client) {
  const id = randomUUID();
  db.prepare("INSERT INTO clients (id, email, created_at) VALUES (?, ?, ?)").run(id, email, Date.now());
  client = { id };
  clientCreated = true;
}

const existing = db
  .prepare("SELECT id, code FROM advertiser_partners WHERE client_id = ? OR code = ?")
  .get(client.id, code);

if (existing) {
  console.log(`Partner already exists: code=${existing.code}`);
} else {
  const id = randomUUID();
  db.prepare(
    "INSERT INTO advertiser_partners (id, client_id, code, commission_pct, created_at) VALUES (?, ?, ?, ?, ?)",
  ).run(id, client.id, code, 0.15, Date.now());
  console.log(`Created partner "${code}" — 15% base, 20% after $15,000 settled spend (all clients)`);
}

if (clientCreated) console.log(`Created login account for ${email}`);

console.log(`Referral link: ${PORTAL_URL}/advertisers?partner=${code}`);
console.log(`Partner signs in at ${PORTAL_URL}/dashboard?tab=advertiser → Partner program tab`);
db.close();
