import { randomUUID } from "node:crypto";
import type { Database as DbType } from "better-sqlite3";
import {
  countInstallEvents,
  countInstallEventsSince,
  INSTALL_CHANNEL_LABELS,
  type InstallChannel,
} from "./installs.js";

export type StoreMarketplaceId = "vscode" | "openvsx";

export const STORE_MARKETPLACE_LABELS: Record<StoreMarketplaceId, string> = {
  vscode: "VS Code Marketplace",
  openvsx: "Open VSX Registry",
};

const VS_QUERY_URL =
  "https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery?api-version=3.0-preview.1";
const OPEN_VSX_URL = "https://open-vsx.org/api/AIBCMedia/aibc";
const SNAPSHOT_MIN_INTERVAL_MS = 60 * 60 * 1000;

const REPORTED_CHANNELS: InstallChannel[] = ["cursor", "windsurf", "direct", "cli", "vscode", "openvsx"];

export function ensureMarketplaceTables(db: DbType): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS marketplace_download_snapshots (
      id TEXT PRIMARY KEY,
      marketplace TEXT NOT NULL,
      total_count INTEGER NOT NULL,
      recorded_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_marketplace_snapshots_lookup
      ON marketplace_download_snapshots (marketplace, recorded_at DESC);
  `);
}

async function fetchVsMarketplaceDownloads(): Promise<number> {
  const res = await fetch(VS_QUERY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json;api-version=3.0-preview.1",
    },
    body: JSON.stringify({
      filters: [{ criteria: [{ filterType: 7, value: "AIBCMedia.aibc" }] }],
      flags: 914,
    }),
  });
  if (!res.ok) throw new Error(`VS Marketplace API ${res.status}`);
  const data = (await res.json()) as {
    results?: Array<{
      extensions?: Array<{
        statistics?: Array<{ statisticName: string; value: number }>;
      }>;
    }>;
  };
  const stats = data.results?.[0]?.extensions?.[0]?.statistics ?? [];
  const install =
    stats.find((s) => s.statisticName === "install") ??
    stats.find((s) => s.statisticName === "downloadCount");
  return Math.round(install?.value ?? 0);
}

async function fetchOpenVsxDownloads(): Promise<number> {
  const res = await fetch(OPEN_VSX_URL, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Open VSX API ${res.status}`);
  const data = (await res.json()) as { downloadCount?: number };
  return Math.round(data.downloadCount ?? 0);
}

const FETCHERS: Record<StoreMarketplaceId, () => Promise<number>> = {
  vscode: fetchVsMarketplaceDownloads,
  openvsx: fetchOpenVsxDownloads,
};

function latestSnapshot(db: DbType, marketplace: StoreMarketplaceId) {
  return db
    .prepare(
      `SELECT total_count, recorded_at FROM marketplace_download_snapshots
       WHERE marketplace = ? ORDER BY recorded_at DESC LIMIT 1`,
    )
    .get(marketplace) as { total_count: number; recorded_at: number } | undefined;
}

function baselineAt(db: DbType, marketplace: StoreMarketplaceId, atOrBefore: number): number | null {
  const row = db
    .prepare(
      `SELECT total_count FROM marketplace_download_snapshots
       WHERE marketplace = ? AND recorded_at <= ?
       ORDER BY recorded_at DESC LIMIT 1`,
    )
    .get(marketplace, atOrBefore) as { total_count: number } | undefined;
  return row?.total_count ?? null;
}

function periodDelta(db: DbType, marketplace: StoreMarketplaceId, periodStart: number): number | null {
  const latest = latestSnapshot(db, marketplace);
  if (!latest) return null;
  const baseline = baselineAt(db, marketplace, periodStart);
  if (baseline === null) return null;
  return Math.max(0, latest.total_count - baseline);
}

function installPeriodDelta(db: DbType, channel: InstallChannel, periodStart: number): number {
  return countInstallEventsSince(db, channel, periodStart);
}

function startOfDayMs(now = Date.now()): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function startOfMonthMs(now = Date.now()): number {
  const d = new Date(now);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export async function refreshMarketplaceSnapshots(
  db: DbType,
  opts?: { force?: boolean },
): Promise<{ syncedAt: number; errors: Partial<Record<StoreMarketplaceId, string>> }> {
  ensureMarketplaceTables(db);
  const now = Date.now();
  const errors: Partial<Record<StoreMarketplaceId, string>> = {};

  for (const marketplace of Object.keys(FETCHERS) as StoreMarketplaceId[]) {
    const last = latestSnapshot(db, marketplace);
    if (!opts?.force && last && now - last.recorded_at < SNAPSHOT_MIN_INTERVAL_MS) {
      continue;
    }

    try {
      const total = await FETCHERS[marketplace]();
      db.prepare(
        `INSERT INTO marketplace_download_snapshots (id, marketplace, total_count, recorded_at)
         VALUES (?, ?, ?, ?)`,
      ).run(randomUUID(), marketplace, total, now);
    } catch (err) {
      errors[marketplace] = err instanceof Error ? err.message : "fetch failed";
    }
  }

  return { syncedAt: now, errors };
}

export type MarketplaceDownloadRow = {
  id: string;
  label: string;
  note: string;
  total: number;
  today: number | null;
  week: number | null;
  month: number | null;
  lastSyncedAt: number | null;
  error?: string;
};

export function getMarketplaceDownloadStats(
  db: DbType,
  syncErrors?: Partial<Record<StoreMarketplaceId, string>>,
): {
  marketplaces: MarketplaceDownloadRow[];
  totals: { total: number; today: number | null; week: number | null; month: number | null };
  lastSyncedAt: number | null;
} {
  ensureMarketplaceTables(db);

  const dayStart = startOfDayMs();
  const weekStart = Date.now() - 7 * 86_400_000;
  const monthStart = startOfMonthMs();

  const marketplaces: MarketplaceDownloadRow[] = [];
  let lastSyncedAt: number | null = null;

  const storeNotes: Record<StoreMarketplaceId, string> = {
    vscode: "Microsoft store — includes VS Code installs (Cursor uses this store too)",
    openvsx: "Open VSX — includes Windsurf default marketplace and VSCodium",
  };

  for (const id of Object.keys(STORE_MARKETPLACE_LABELS) as StoreMarketplaceId[]) {
    const latest = latestSnapshot(db, id);
    if (latest && (!lastSyncedAt || latest.recorded_at > lastSyncedAt)) {
      lastSyncedAt = latest.recorded_at;
    }

    marketplaces.push({
      id,
      label: STORE_MARKETPLACE_LABELS[id],
      note: storeNotes[id],
      total: latest?.total_count ?? 0,
      today: periodDelta(db, id, dayStart),
      week: periodDelta(db, id, weekStart),
      month: periodDelta(db, id, monthStart),
      lastSyncedAt: latest?.recorded_at ?? null,
      error: syncErrors?.[id],
    });
  }

  const channelNotes: Partial<Record<InstallChannel, string>> = {
    cursor: "Reported from Cursor installs (also in VS Marketplace total above)",
    windsurf: "Reported from Windsurf installs (also in Open VSX total above)",
    direct: "VSIX or install command run directly in the editor",
    cli: "aibc install claude — terminal hook",
    vscode: "VS Code installs reported from extension (non-marketplace path)",
    openvsx: "Manual Open VSX installs reported from extension",
  };

  for (const channel of REPORTED_CHANNELS) {
    const total = countInstallEvents(db, channel);
    marketplaces.push({
      id: channel,
      label: INSTALL_CHANNEL_LABELS[channel],
      note: channelNotes[channel] || "Reported at install time",
      total,
      today: installPeriodDelta(db, channel, dayStart),
      week: installPeriodDelta(db, channel, weekStart),
      month: installPeriodDelta(db, channel, monthStart),
      lastSyncedAt: lastSyncedAt,
    });
  }

  const sumPeriod = (key: "today" | "week" | "month"): number | null => {
    const storeValues = marketplaces
      .filter((m) => m.id === "vscode" || m.id === "openvsx")
      .map((m) => m[key])
      .filter((v): v is number => v !== null);
    const directValues = marketplaces
      .filter((m) => m.id === "direct" || m.id === "cli")
      .map((m) => m.total);
    if (storeValues.length === 0 && directValues.length === 0) return null;
    const storeSum = storeValues.reduce((s, v) => s + v, 0);
    const directSum = directValues.reduce((s, v) => s + v, 0);
    if (key === "today" || key === "week" || key === "month") {
      const reported = marketplaces
        .filter((m) => m.id === "direct" || m.id === "cli")
        .map((m) => m[key])
        .filter((v): v is number => v !== null);
      return storeSum + (reported.length ? reported.reduce((s, v) => s + v, 0) : 0);
    }
    return storeSum + directSum;
  };

  const storeTotal = marketplaces
    .filter((m) => m.id === "vscode" || m.id === "openvsx")
    .reduce((s, m) => s + m.total, 0);
  const extraTotal = marketplaces
    .filter((m) => m.id === "direct" || m.id === "cli")
    .reduce((s, m) => s + m.total, 0);

  return {
    marketplaces,
    totals: {
      total: storeTotal + extraTotal,
      today: sumPeriod("today"),
      week: sumPeriod("week"),
      month: sumPeriod("month"),
    },
    lastSyncedAt,
  };
}
