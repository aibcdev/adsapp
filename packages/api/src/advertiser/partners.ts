import { randomUUID } from "node:crypto";
import type { Database as DbType } from "better-sqlite3";

export const DEFAULT_PARTNER_COMMISSION_PCT = 0.2;

export function normalizePartnerCode(code: string): string {
  return code.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
}

export function findPartnerByCode(db: DbType, code: string) {
  const normalized = normalizePartnerCode(code);
  if (!normalized) return null;
  return db
    .prepare("SELECT id, client_id as clientId, code, commission_pct as commissionPct FROM advertiser_partners WHERE code = ?")
    .get(normalized) as
    | { id: string; clientId: string; code: string; commissionPct: number }
    | undefined;
}

export function attributeAdvertiserReferral(
  db: DbType,
  referredClientId: string,
  partnerCode: string | null | undefined,
): boolean {
  if (!partnerCode) return false;

  const existing = db
    .prepare("SELECT referred_client_id FROM advertiser_referrals WHERE referred_client_id = ?")
    .get(referredClientId);
  if (existing) return false;

  const partner = findPartnerByCode(db, partnerCode);
  if (!partner) return false;
  if (partner.clientId === referredClientId) return false;

  db.prepare(
    "INSERT INTO advertiser_referrals (referred_client_id, partner_id, attributed_at) VALUES (?, ?, ?)",
  ).run(referredClientId, partner.id, Date.now());

  return true;
}

export function getPartnerForReferredClient(db: DbType, referredClientId: string) {
  return db
    .prepare(`
      SELECT p.id, p.client_id as clientId, p.code, p.commission_pct as commissionPct
      FROM advertiser_referrals r
      JOIN advertiser_partners p ON p.id = r.partner_id
      WHERE r.referred_client_id = ?
    `)
    .get(referredClientId) as
    | { id: string; clientId: string; code: string; commissionPct: number }
    | undefined;
}

export function recordPartnerCommission(
  db: DbType,
  campaignIdPrefix: string,
  spendUsd: number,
): void {
  if (spendUsd <= 0) return;

  const campaign = db
    .prepare("SELECT id, client_id FROM campaigns WHERE substr(id, 1, 8) = ?")
    .get(campaignIdPrefix) as { id: string; client_id: string } | undefined;
  if (!campaign) return;

  const partner = getPartnerForReferredClient(db, campaign.client_id);
  if (!partner) return;

  const commissionUsd = Math.round(spendUsd * partner.commissionPct * 1e6) / 1e6;
  if (commissionUsd <= 0) return;

  db.prepare(`
    INSERT INTO partner_commission_ledger (id, partner_id, campaign_id, spend_usd, commission_usd, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(randomUUID(), partner.id, campaign.id, spendUsd, commissionUsd, Date.now());
}

export function getPartnerDashboard(db: DbType, clientId: string) {
  const partner = db
    .prepare("SELECT id, code, commission_pct as commissionPct FROM advertiser_partners WHERE client_id = ?")
    .get(clientId) as { id: string; code: string; commissionPct: number } | undefined;

  if (!partner) return null;

  const referrals = db
    .prepare(`
      SELECT c.id as clientId, c.email, r.attributed_at as attributedAt
      FROM advertiser_referrals r
      JOIN clients c ON c.id = r.referred_client_id
      WHERE r.partner_id = ?
      ORDER BY r.attributed_at DESC
    `)
    .all(partner.id) as Array<{ clientId: string; email: string | null; attributedAt: number }>;

  const totals = db
    .prepare(`
      SELECT
        COALESCE(SUM(spend_usd), 0) as totalSpend,
        COALESCE(SUM(commission_usd), 0) as totalCommission
      FROM partner_commission_ledger
      WHERE partner_id = ?
    `)
    .get(partner.id) as { totalSpend: number; totalCommission: number };

  return {
    code: partner.code,
    commissionPct: partner.commissionPct,
    referralLink: `https://aibcmedia.com/advertisers?partner=${partner.code}`,
    referrals: referrals.map((r) => ({
      clientId: r.clientId,
      email: r.email,
      attributedAt: new Date(r.attributedAt).toISOString(),
    })),
    totalReferredSpend: totals.totalSpend,
    totalCommissionEarned: totals.totalCommission,
  };
}

export function findOrCreateClientByEmail(db: DbType, email: string): { id: string; created: boolean } {
  const normalized = email.trim().toLowerCase();
  const existing = db
    .prepare("SELECT id FROM clients WHERE email = ?")
    .get(normalized) as { id: string } | undefined;
  if (existing) return { id: existing.id, created: false };

  const id = randomUUID();
  db.prepare("INSERT INTO clients (id, email, created_at) VALUES (?, ?, ?)").run(
    id,
    normalized,
    Date.now(),
  );
  return { id, created: true };
}

/** Onboard a reseller platform — call when you sign a new partner like aads.com. */
export function provisionAdvertiserPartner(
  db: DbType,
  opts: {
    email: string;
    code: string;
    commissionPct?: number;
    portalUrl?: string;
  },
): {
  partnerId: string;
  clientId: string;
  code: string;
  commissionPct: number;
  referralLink: string;
  clientCreated: boolean;
  partnerCreated: boolean;
} {
  const commissionPct = opts.commissionPct ?? DEFAULT_PARTNER_COMMISSION_PCT;
  const { id: clientId, created: clientCreated } = findOrCreateClientByEmail(db, opts.email);
  const before = db
    .prepare("SELECT id FROM advertiser_partners WHERE client_id = ? OR code = ?")
    .get(clientId, normalizePartnerCode(opts.code)) as { id: string } | undefined;

  const partner = createPartner(db, clientId, opts.code, commissionPct);
  const base = (opts.portalUrl || "https://aibcmedia.com").replace(/\/$/, "");

  return {
    partnerId: partner.id,
    clientId,
    code: partner.code,
    commissionPct,
    referralLink: `${base}/advertisers?partner=${partner.code}`,
    clientCreated,
    partnerCreated: !before,
  };
}

export function listAdvertiserPartners(db: DbType) {
  return db
    .prepare(`
      SELECT p.id, p.code, p.commission_pct as commissionPct, p.created_at as createdAt,
             c.email,
             (SELECT COUNT(*) FROM advertiser_referrals r WHERE r.partner_id = p.id) as referralCount,
             (SELECT COALESCE(SUM(commission_usd), 0) FROM partner_commission_ledger l WHERE l.partner_id = p.id) as totalCommission
      FROM advertiser_partners p
      JOIN clients c ON c.id = p.client_id
      ORDER BY p.created_at DESC
    `)
    .all() as Array<{
      id: string;
      code: string;
      commissionPct: number;
      createdAt: number;
      email: string | null;
      referralCount: number;
      totalCommission: number;
    }>;
}

export function createPartner(
  db: DbType,
  clientId: string,
  code: string,
  commissionPct = DEFAULT_PARTNER_COMMISSION_PCT,
): { id: string; code: string } {
  const normalized = normalizePartnerCode(code);
  if (!normalized) throw new Error("Invalid partner code");

  const existing = db
    .prepare("SELECT id FROM advertiser_partners WHERE client_id = ? OR code = ?")
    .get(clientId, normalized) as { id: string } | undefined;
  if (existing) return { id: existing.id, code: normalized };

  const id = randomUUID();
  db.prepare(
    "INSERT INTO advertiser_partners (id, client_id, code, commission_pct, created_at) VALUES (?, ?, ?, ?, ?)",
  ).run(id, clientId, normalized, commissionPct, Date.now());

  return { id, code: normalized };
}
