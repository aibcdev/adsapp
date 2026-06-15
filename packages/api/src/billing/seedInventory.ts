import type { Database as DbType } from "better-sqlite3";

/** Static filler ads shown when no paid campaigns compete. */
export const SEED_AD_IDS = new Set([
  "ad-linear",
  "ad-raycast",
  "ad-vercel",
  "ad-supabase",
  "ad-cursor",
  "campaign-seed-aib",
]);

function campaignPrefix(adId: string): string | null {
  if (!adId.startsWith("campaign-")) return null;
  return adId.slice("campaign-".length);
}

export function isSeedAdId(adId: string): boolean {
  if (SEED_AD_IDS.has(adId)) return true;
  const prefix = campaignPrefix(adId);
  if (!prefix) return false;
  return prefix.startsWith("seed");
}

export function isSeedCampaignAd(db: DbType, adId: string): boolean {
  const prefix = campaignPrefix(adId);
  if (!prefix) return false;
  const row = db
    .prepare("SELECT client_id FROM campaigns WHERE substr(id, 1, 8) = ?")
    .get(prefix) as { client_id: string } | undefined;
  return row?.client_id === "seed";
}

/** Sample/seed inventory — show in rotation but never bill advertisers or pay developers. */
export function isNonBillableAd(db: DbType, adId: string): boolean {
  return isSeedAdId(adId) || isSeedCampaignAd(db, adId);
}

export const SEED_CLIENT_ID = "seed";

export function isSeedCampaignClient(clientId: string): boolean {
  return clientId === SEED_CLIENT_ID;
}
