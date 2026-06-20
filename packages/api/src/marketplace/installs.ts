import { createHash, randomUUID } from "node:crypto";
import type { Database as DbType } from "better-sqlite3";

/** Reported install channels — editor-specific + direct/CLI. */
export type InstallChannel = "vscode" | "cursor" | "windsurf" | "openvsx" | "direct" | "cli";

export const INSTALL_CHANNEL_LABELS: Record<InstallChannel, string> = {
  vscode: "VS Code (direct install)",
  cursor: "Cursor",
  windsurf: "Windsurf",
  openvsx: "Open VSX (manual)",
  direct: "Direct VSIX / command",
  cli: "CLI (aibc install)",
};

export function ensureInstallTables(db: DbType): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS install_events (
      id TEXT PRIMARY KEY,
      channel TEXT NOT NULL,
      device_hash TEXT NOT NULL,
      source TEXT,
      recorded_at INTEGER NOT NULL,
      UNIQUE(channel, device_hash)
    );
    CREATE INDEX IF NOT EXISTS idx_install_events_channel ON install_events (channel, recorded_at DESC);
  `);
}

export function hashDeviceId(deviceId: string): string {
  return createHash("sha256").update(deviceId.trim()).digest("hex").slice(0, 32);
}

export function recordInstallEvent(
  db: DbType,
  channel: InstallChannel,
  deviceId: string,
  source?: string,
): boolean {
  ensureInstallTables(db);
  const deviceHash = hashDeviceId(deviceId);
  const existing = db
    .prepare("SELECT id FROM install_events WHERE channel = ? AND device_hash = ?")
    .get(channel, deviceHash);
  if (existing) return false;

  db.prepare(
    `INSERT INTO install_events (id, channel, device_hash, source, recorded_at) VALUES (?, ?, ?, ?, ?)`,
  ).run(randomUUID(), channel, deviceHash, source || null, Date.now());
  return true;
}

const REAL_INSTALLS_SQL = "source IS NULL OR source != 'backfill'";

export function countInstallEvents(db: DbType, channel: InstallChannel): number {
  ensureInstallTables(db);
  const row = db
    .prepare(`SELECT COUNT(*) as c FROM install_events WHERE channel = ? AND (${REAL_INSTALLS_SQL})`)
    .get(channel) as { c: number };
  return row.c ?? 0;
}

export function countInstallEventsSince(db: DbType, channel: InstallChannel, since: number): number {
  ensureInstallTables(db);
  const row = db
    .prepare(
      `SELECT COUNT(*) as c FROM install_events WHERE channel = ? AND recorded_at >= ? AND (${REAL_INSTALLS_SQL})`,
    )
    .get(channel, since) as { c: number };
  return row.c ?? 0;
}

export function clearInstallBackfill(db: DbType): number {
  ensureInstallTables(db);
  const result = db.prepare("DELETE FROM install_events WHERE source = 'backfill'").run();
  return result.changes;
}

/** Seed historical install events for backdating (one row per synthetic device). */
export function seedInstallBackfill(
  db: DbType,
  channel: InstallChannel,
  count: number,
  startMs: number,
  endMs: number,
): number {
  ensureInstallTables(db);
  let inserted = 0;
  for (let i = 0; i < count; i++) {
    const deviceHash = createHash("sha256")
      .update(`backfill:${channel}:${i}`)
      .digest("hex")
      .slice(0, 32);
    const exists = db
      .prepare("SELECT id FROM install_events WHERE channel = ? AND device_hash = ?")
      .get(channel, deviceHash);
    if (exists) continue;
    const t = startMs + Math.floor(((endMs - startMs) * i) / Math.max(count, 1));
    db.prepare(
      `INSERT INTO install_events (id, channel, device_hash, source, recorded_at) VALUES (?, ?, ?, 'backfill', ?)`,
    ).run(randomUUID(), channel, deviceHash, t);
    inserted++;
  }
  return inserted;
}
