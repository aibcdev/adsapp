import type { Database as DbType } from "better-sqlite3";

export type SignupAttribution = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  landingPath?: string;
};

const MAX_LEN = 120;

function clean(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim().slice(0, MAX_LEN);
  return trimmed.length > 0 ? trimmed : undefined;
}

export function parseAttributionInput(raw: unknown): SignupAttribution | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const attr: SignupAttribution = {
    utmSource: clean(o.utmSource ?? o.utm_source),
    utmMedium: clean(o.utmMedium ?? o.utm_medium),
    utmCampaign: clean(o.utmCampaign ?? o.utm_campaign),
    utmContent: clean(o.utmContent ?? o.utm_content),
    utmTerm: clean(o.utmTerm ?? o.utm_term),
    landingPath: clean(o.landingPath ?? o.landing_path),
  };
  const hasValue = Object.values(attr).some(Boolean);
  return hasValue ? attr : null;
}

export function ensureAttributionColumns(db: DbType): void {
  const cols = db.prepare("PRAGMA table_info(clients)").all() as { name: string }[];
  const names = new Set(cols.map((c) => c.name));
  const add = (sql: string) => {
    try {
      db.exec(sql);
    } catch {
      /* exists */
    }
  };
  if (!names.has("signup_utm_source")) add("ALTER TABLE clients ADD COLUMN signup_utm_source TEXT");
  if (!names.has("signup_utm_medium")) add("ALTER TABLE clients ADD COLUMN signup_utm_medium TEXT");
  if (!names.has("signup_utm_campaign")) add("ALTER TABLE clients ADD COLUMN signup_utm_campaign TEXT");
  if (!names.has("signup_utm_content")) add("ALTER TABLE clients ADD COLUMN signup_utm_content TEXT");
  if (!names.has("signup_utm_term")) add("ALTER TABLE clients ADD COLUMN signup_utm_term TEXT");
  if (!names.has("signup_landing_path")) add("ALTER TABLE clients ADD COLUMN signup_landing_path TEXT");
  if (!names.has("signup_attributed_at")) add("ALTER TABLE clients ADD COLUMN signup_attributed_at INTEGER");

  const authCols = db.prepare("PRAGMA table_info(auth_states)").all() as { name: string }[];
  if (!authCols.some((c) => c.name === "attribution_json")) {
    add("ALTER TABLE auth_states ADD COLUMN attribution_json TEXT");
  }
}

export function storeAuthStateAttribution(
  db: DbType,
  state: string,
  attribution: SignupAttribution,
): void {
  ensureAttributionColumns(db);
  db.prepare("UPDATE auth_states SET attribution_json = ? WHERE state = ?").run(
    JSON.stringify(attribution),
    state,
  );
}

export function readAuthStateAttribution(db: DbType, state: string): SignupAttribution | null {
  ensureAttributionColumns(db);
  const row = db
    .prepare("SELECT attribution_json FROM auth_states WHERE state = ?")
    .get(state) as { attribution_json: string | null } | undefined;
  if (!row?.attribution_json) return null;
  try {
    return parseAttributionInput(JSON.parse(row.attribution_json));
  } catch {
    return null;
  }
}

export function recordClientAttribution(
  db: DbType,
  clientId: string,
  attribution: SignupAttribution | null,
): void {
  if (!attribution) return;
  ensureAttributionColumns(db);

  const existing = db
    .prepare("SELECT signup_utm_source FROM clients WHERE id = ?")
    .get(clientId) as { signup_utm_source: string | null } | undefined;
  if (existing?.signup_utm_source) return;

  const hasValue =
    attribution.utmSource ||
    attribution.utmMedium ||
    attribution.utmCampaign ||
    attribution.landingPath;
  if (!hasValue) return;

  db.prepare(`
    UPDATE clients SET
      signup_utm_source = ?,
      signup_utm_medium = ?,
      signup_utm_campaign = ?,
      signup_utm_content = ?,
      signup_utm_term = ?,
      signup_landing_path = ?,
      signup_attributed_at = ?
    WHERE id = ?
  `).run(
    attribution.utmSource ?? null,
    attribution.utmMedium ?? null,
    attribution.utmCampaign ?? null,
    attribution.utmContent ?? null,
    attribution.utmTerm ?? null,
    attribution.landingPath ?? null,
    Date.now(),
    clientId,
  );
}

export function applyAuthStateAttribution(db: DbType, state: string, clientId: string): void {
  const attr = readAuthStateAttribution(db, state);
  recordClientAttribution(db, clientId, attr);
}

export function getAcquisitionStats(db: DbType): {
  rows: Array<{
    source: string;
    medium: string;
    campaign: string;
    signups: number;
    signups7d: number;
  }>;
  totals: {
    signupsWithEmail: number;
    attributed: number;
    direct: number;
    signups7d: number;
    attributed7d: number;
  };
} {
  ensureAttributionColumns(db);
  const since7d = Date.now() - 7 * 86_400_000;

  const rows = db
    .prepare(`
      SELECT
        COALESCE(NULLIF(signup_utm_source, ''), '(direct / unknown)') AS source,
        COALESCE(NULLIF(signup_utm_medium, ''), '—') AS medium,
        COALESCE(NULLIF(signup_utm_campaign, ''), '—') AS campaign,
        COUNT(*) AS signups,
        SUM(CASE WHEN created_at > ? THEN 1 ELSE 0 END) AS signups7d
      FROM clients
      WHERE email IS NOT NULL AND email != ''
      GROUP BY signup_utm_source, signup_utm_medium, signup_utm_campaign
      ORDER BY signups DESC
      LIMIT 50
    `)
    .all(since7d) as Array<{
      source: string;
      medium: string;
      campaign: string;
      signups: number;
      signups7d: number;
    }>;

  const totals = db
    .prepare(`
      SELECT
        COUNT(*) AS signupsWithEmail,
        SUM(CASE WHEN signup_utm_source IS NOT NULL AND signup_utm_source != '' THEN 1 ELSE 0 END) AS attributed,
        SUM(CASE WHEN signup_utm_source IS NULL OR signup_utm_source = '' THEN 1 ELSE 0 END) AS direct,
        SUM(CASE WHEN created_at > ? THEN 1 ELSE 0 END) AS signups7d,
        SUM(CASE WHEN created_at > ? AND signup_utm_source IS NOT NULL AND signup_utm_source != '' THEN 1 ELSE 0 END) AS attributed7d
      FROM clients
      WHERE email IS NOT NULL AND email != ''
    `)
    .get(since7d, since7d) as {
      signupsWithEmail: number;
      attributed: number;
      direct: number;
      signups7d: number;
      attributed7d: number;
    };

  return {
    rows,
    totals: {
      signupsWithEmail: totals.signupsWithEmail ?? 0,
      attributed: totals.attributed ?? 0,
      direct: totals.direct ?? 0,
      signups7d: totals.signups7d ?? 0,
      attributed7d: totals.attributed7d ?? 0,
    },
  };
}
