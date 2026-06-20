import { createHash } from "node:crypto";
import type { Database as DbType } from "better-sqlite3";
import { countInstallEvents } from "../marketplace/installs.js";

const ACTIVE_NOW_MS = 15 * 60 * 1000;
const ACTIVE_24H_MS = 24 * 60 * 60 * 1000;

export function ensureCliActivityTables(db: DbType): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS cli_heartbeats (
      device_hash TEXT PRIMARY KEY,
      client_id TEXT,
      last_seen_at INTEGER NOT NULL,
      first_seen_at INTEGER NOT NULL,
      heartbeat_count INTEGER DEFAULT 1
    );
    CREATE INDEX IF NOT EXISTS idx_cli_heartbeats_last_seen ON cli_heartbeats (last_seen_at DESC);
  `);
}

function hashDeviceId(deviceId: string): string {
  return createHash("sha256").update(deviceId.trim()).digest("hex").slice(0, 32);
}

export function recordCliHeartbeat(
  db: DbType,
  deviceId: string,
  clientId?: string | null,
): void {
  ensureCliActivityTables(db);
  const deviceHash = hashDeviceId(deviceId);
  const now = Date.now();
  const existing = db
    .prepare("SELECT device_hash FROM cli_heartbeats WHERE device_hash = ?")
    .get(deviceHash);

  if (existing) {
    db.prepare(`
      UPDATE cli_heartbeats SET
        last_seen_at = ?,
        client_id = COALESCE(?, client_id),
        heartbeat_count = heartbeat_count + 1
      WHERE device_hash = ?
    `).run(now, clientId || null, deviceHash);
    return;
  }

  db.prepare(`
    INSERT INTO cli_heartbeats (device_hash, client_id, last_seen_at, first_seen_at, heartbeat_count)
    VALUES (?, ?, ?, ?, 1)
  `).run(deviceHash, clientId || null, now, now);
}

export function getCliActivityStats(db: DbType): {
  activeCliNow: number;
  activeCli24h: number;
  totalCliDevices: number;
  cliInstallsReported: number;
} {
  ensureCliActivityTables(db);
  const now = Date.now();
  const activeNow = db
    .prepare("SELECT COUNT(*) as c FROM cli_heartbeats WHERE last_seen_at > ?")
    .get(now - ACTIVE_NOW_MS) as { c: number };
  const active24h = db
    .prepare("SELECT COUNT(*) as c FROM cli_heartbeats WHERE last_seen_at > ?")
    .get(now - ACTIVE_24H_MS) as { c: number };
  const total = db.prepare("SELECT COUNT(*) as c FROM cli_heartbeats").get() as { c: number };

  return {
    activeCliNow: activeNow.c ?? 0,
    activeCli24h: active24h.c ?? 0,
    totalCliDevices: total.c ?? 0,
    cliInstallsReported: countInstallEvents(db, "cli"),
  };
}
