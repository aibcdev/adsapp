import { randomUUID } from "node:crypto";
import type { Database as DbType } from "better-sqlite3";

export type MarketplaceId = "vscode" | "openvsx";

export const MARKETPLACE_LABELS: Record<MarketplaceId, string> = {
  vscode: "VS Code Marketplace",
  openvsx: "Open VSX",
};

const VS_QUERY_URL =
  "https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery?api-version=3.0-preview.1";
const OPEN_VSX_URL = "https://open-vsx.org/api/AIBCMedia/aibc";
const SNAPSHOT_MIN_INTERVAL_MS = 60 * 60 * 1000;

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

const FETCHERS: Record<MarketplaceId, () => Promise<number>> = {
  vscode: fetchVsMarketplaceDownloads,
  openvsx: fetchOpenVsxDownloads,
};

function latestSnapshot(db: DbType, marketplace: MarketplaceId) {
  return db
    .prepare(
      `SELECT total_count, recorded_at FROM marketplace_download_snapshots
       WHERE marketplace = ? ORDER BY recorded_at DESC LIMIT 1`,
    )
    .get(marketplace) as { total_count: number; recorded_at: number } | undefined;
}

function baselineAt(db: DbType, marketplace: MarketplaceId, atOrBefore: number): number | null {
  const row = db
    .prepare(
      `SELECT total_count FROM marketplace_download_snapshots
       WHERE marketplace = ? AND recorded_at <= ?
       ORDER BY recorded_at DESC LIMIT 1`,
    )
    .get(marketplace, atOrBefore) as { total_count: number } | undefined;
  return row?.total_count ?? null;
}

function periodDelta(db: DbType, marketplace: MarketplaceId, periodStart: number): number | null {
  const latest = latestSnapshot(db, marketplace);
  if (!latest) return null;
  const baseline = baselineAt(db, marketplace, periodStart);
  if (baseline === null) return null;
  return Math.max(0, latest.total_count - baseline);
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
): Promise<{ syncedAt: number; errors: Partial<Record<MarketplaceId, string>> }> {
  ensureMarketplaceTables(db);
  const now = Date.now();
  const errors: Partial<Record<MarketplaceId, string>> = {};

  for (const marketplace of Object.keys(FETCHERS) as MarketplaceId[]) {
    const last = latestSnapshot(db, marketplace);
    if (!opts?.force && last && now - last.recorded_at < SNAPSHOT_MIN_INTERVAL_MS) {
      continue;
    }

    try {
      const total = await FETCHERS[marketplace]();
      const prev = last?.total_count;
      if (prev !== undefined && total < prev) {
        // Marketplace APIs occasionally reset; still record snapshot.
      }
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
  id: MarketplaceId;
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
  syncErrors?: Partial<Record<MarketplaceId, string>>,
): {
  marketplaces: MarketplaceDownloadRow[];
  totals: { total: number; today: number | null; week: number | null; month: number | null };
  lastSyncedAt: number | null;
} {
  ensureMarketplaceTables(db);

  const dayStart = startOfDayMs();
  const weekStart = Date.now() - 7 * 86_400_000;
  const monthStart = startOfMonthMs();

  const notes: Record<MarketplaceId, string> = {
    vscode: "VS Code, Cursor, and compatible editors",
    openvsx: "Windsurf, VSCodium, and Open VSX editors",
  };

  const marketplaces: MarketplaceDownloadRow[] = [];
  let lastSyncedAt: number | null = null;

  for (const id of Object.keys(MARKETPLACE_LABELS) as MarketplaceId[]) {
    const latest = latestSnapshot(db, id);
    if (latest && (!lastSyncedAt || latest.recorded_at > lastSyncedAt)) {
      lastSyncedAt = latest.recorded_at;
    }

    marketplaces.push({
      id,
      label: MARKETPLACE_LABELS[id],
      note: notes[id],
      total: latest?.total_count ?? 0,
      today: periodDelta(db, id, dayStart),
      week: periodDelta(db, id, weekStart),
      month: periodDelta(db, id, monthStart),
      lastSyncedAt: latest?.recorded_at ?? null,
      error: syncErrors?.[id],
    });
  }

  const sumPeriod = (key: "today" | "week" | "month"): number | null => {
    const values = marketplaces.map((m) => m[key]).filter((v): v is number => v !== null);
    if (values.length === 0) return null;
    return values.reduce((s, v) => s + v, 0);
  };

  return {
    marketplaces,
    totals: {
      total: marketplaces.reduce((s, m) => s + m.total, 0),
      today: sumPeriod("today"),
      week: sumPeriod("week"),
      month: sumPeriod("month"),
    },
    lastSyncedAt,
  };
}
