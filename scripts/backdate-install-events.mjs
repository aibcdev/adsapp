#!/usr/bin/env node
/**
 * Optional: seed historical install_events ONLY when you pass explicit counts.
 * Real admin ignores backfill rows — use only if you have verified numbers.
 *
 * Example (only if you know real splits):
 *   CURSOR=120 WINDSURF=80 DIRECT=30 CLI=5 node scripts/backdate-install-events.mjs
 *
 * Prefer: let extension/CLI report real installs; store totals come from marketplace APIs.
 */
import Database from "better-sqlite3";
import { createHash, randomUUID } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.AIBC_DB_PATH || join(__dirname, "..", "packages", "api", "src", "aibc.db");

const plan = [
  ["cursor", Number(process.env.CURSOR || 0)],
  ["windsurf", Number(process.env.WINDSURF || 0)],
  ["direct", Number(process.env.DIRECT || 0)],
  ["cli", Number(process.env.CLI || 0)],
  ["openvsx", Number(process.env.OPENVSX || 0)],
  ["vscode", Number(process.env.VSCODE || 0)],
];

if (!plan.some(([, n]) => n > 0)) {
  console.error("No counts set. Pass env vars, e.g. CURSOR=100 WINDSURF=50");
  console.error("Or skip this script — real admin uses live marketplace APIs + new install reports.");
  process.exit(1);
}

const db = new Database(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS install_events (
    id TEXT PRIMARY KEY,
    channel TEXT NOT NULL,
    device_hash TEXT NOT NULL,
    source TEXT,
    recorded_at INTEGER NOT NULL,
    UNIQUE(channel, device_hash)
  );
`);

function seed(channel, count, startMs, endMs) {
  let inserted = 0;
  for (let i = 0; i < count; i++) {
    const deviceHash = createHash("sha256").update(`backfill:${channel}:${i}`).digest("hex").slice(0, 32);
    const exists = db
      .prepare("SELECT id FROM install_events WHERE channel = ? AND device_hash = ?")
      .get(channel, deviceHash);
    if (exists) continue;
    const t = startMs + Math.floor(((endMs - startMs) * i) / Math.max(count, 1));
    db.prepare(
      "INSERT INTO install_events (id, channel, device_hash, source, recorded_at) VALUES (?, ?, ?, 'backfill', ?)",
    ).run(randomUUID(), channel, deviceHash, t);
    inserted++;
  }
  return inserted;
}

const now = Date.now();
const start = now - 90 * 86_400_000;
let total = 0;
for (const [channel, count] of plan) {
  if (count <= 0) continue;
  const n = seed(channel, count, start, now);
  console.log(`${channel}: +${n} (backfill only — excluded from real admin totals)`);
  total += n;
}
console.log(`Done — ${total} backfill rows (not shown on real admin)`);
db.close();
