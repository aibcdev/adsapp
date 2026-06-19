import type { Database as DbType } from "better-sqlite3";

const IMPRESSION_EVENTS = new Set([
  "view_threshold_met",
  "error_impression",
  "impression_rendered",
  "impression",
]);
const CLICK_EVENTS = new Set(["click"]);

function campaignAdPrefix(campaignId: string): string {
  return `campaign-${campaignId.slice(0, 8)}`;
}

function resolveCampaignId(db: DbType, campaignId: string, clientId: string): string | null {
  const row = db
    .prepare("SELECT id FROM campaigns WHERE id = ? AND client_id = ?")
    .get(campaignId, clientId) as { id: string } | undefined;
  return row?.id ?? null;
}

type EventRow = {
  event_type: string;
  editor: string | null;
  language: string | null;
  country_code: string | null;
  created_at: number;
};

function aggregateEvents(rows: EventRow[]) {
  let impressions = 0;
  let clicks = 0;
  const byEditor: Record<string, number> = {};
  const byCountry: Record<string, number> = {};
  const byLanguage: Record<string, number> = {};
  const daily: Record<string, { impressions: number; clicks: number }> = {};

  for (const row of rows) {
    const day = new Date(row.created_at).toISOString().slice(0, 10);
    if (!daily[day]) daily[day] = { impressions: 0, clicks: 0 };

    if (CLICK_EVENTS.has(row.event_type)) {
      clicks++;
      daily[day].clicks++;
      const editor = row.editor || "unknown";
      byEditor[editor] = (byEditor[editor] || 0) + 1;
      const country = row.country_code || "unknown";
      byCountry[country] = (byCountry[country] || 0) + 1;
      const lang = row.language || "unknown";
      byLanguage[lang] = (byLanguage[lang] || 0) + 1;
    } else if (IMPRESSION_EVENTS.has(row.event_type)) {
      impressions++;
      daily[day].impressions++;
    }
  }

  const ctr = impressions > 0 ? clicks / impressions : 0;

  return {
    impressions,
    clicks,
    ctr,
    byEditor: Object.entries(byEditor).map(([key, count]) => ({ key, count })),
    byCountry: Object.entries(byCountry).map(([key, count]) => ({ key, count })),
    byLanguage: Object.entries(byLanguage).map(([key, count]) => ({ key, count })),
    daily: Object.entries(daily)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, stats]) => ({ date, ...stats })),
  };
}

export function getCampaignAnalytics(db: DbType, clientId: string, campaignId: string) {
  const id = resolveCampaignId(db, campaignId, clientId);
  if (!id) return null;

  const campaign = db
    .prepare(`
      SELECT id, ad_line as adLine, brand_name as brandName, spend, impressions, bid_per_1k as bidPer1k,
             target_countries as targetCountries, status, created_at as createdAt
      FROM campaigns WHERE id = ?
    `)
    .get(id) as {
      id: string;
      adLine: string;
      brandName: string | null;
      spend: number;
      impressions: number;
      bidPer1k: number;
      targetCountries: string | null;
      status: string;
      createdAt: number;
    };

  const adPrefix = campaignAdPrefix(id);
  const since = Date.now() - 30 * 86_400_000;

  const rows = db
    .prepare(`
      SELECT event_type, editor, language, country_code, created_at
      FROM impressions
      WHERE demo = 0 AND ad_id LIKE ? AND created_at > ?
    `)
    .all(`${adPrefix}%`, since) as EventRow[];

  const stats = aggregateEvents(rows);
  const avgCpm = campaign.impressions > 0 ? (campaign.spend / campaign.impressions) * 1000 : 0;

  return {
    campaign: {
      id: campaign.id,
      adLine: campaign.adLine,
      brandName: campaign.brandName,
      status: campaign.status,
      spend: campaign.spend,
      bidPer1k: campaign.bidPer1k,
      targetCountries: campaign.targetCountries,
      createdAt: new Date(campaign.createdAt).toISOString(),
    },
    totals: {
      impressions: stats.impressions || campaign.impressions,
      clicks: stats.clicks,
      ctr: stats.ctr,
      spend: campaign.spend,
      avgCpm,
    },
    breakdowns: {
      byEditor: stats.byEditor,
      byCountry: stats.byCountry,
      byLanguage: stats.byLanguage,
    },
    daily: stats.daily,
  };
}

export function getAdvertiserAnalyticsSummary(db: DbType, clientId: string) {
  const campaigns = db
    .prepare("SELECT id, spend, impressions FROM campaigns WHERE client_id = ?")
    .all(clientId) as Array<{ id: string; spend: number; impressions: number }>;

  const prefixes = campaigns.map((c) => `${campaignAdPrefix(c.id)}%`);
  if (prefixes.length === 0) {
    return {
      impressions: 0,
      clicks: 0,
      ctr: 0,
      spend: 0,
      campaignCount: 0,
    };
  }

  const since = Date.now() - 30 * 86_400_000;
  const placeholders = prefixes.map(() => "ad_id LIKE ?").join(" OR ");
  const rows = db
    .prepare(`
      SELECT event_type FROM impressions
      WHERE demo = 0 AND (${placeholders}) AND created_at > ?
    `)
    .all(...prefixes, since) as Array<{ event_type: string }>;

  let impressions = 0;
  let clicks = 0;
  for (const row of rows) {
    if (CLICK_EVENTS.has(row.event_type)) clicks++;
    else if (IMPRESSION_EVENTS.has(row.event_type)) impressions++;
  }

  const spend = campaigns.reduce((s, c) => s + (c.spend || 0), 0);
  const billedImpressions = campaigns.reduce((s, c) => s + (c.impressions || 0), 0);

  return {
    impressions: impressions || billedImpressions,
    clicks,
    ctr: impressions > 0 ? clicks / impressions : 0,
    spend,
    campaignCount: campaigns.length,
  };
}
