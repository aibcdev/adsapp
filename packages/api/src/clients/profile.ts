import { randomBytes } from "node:crypto";
import type { Database as DbType } from "better-sqlite3";
import {
  FOUNDING_BONUS_MULTIPLIER,
  FOUNDING_MEMBER_CAP,
  REFERRAL_BONUS_USD,
  REFERRAL_QUALIFY_USD,
} from "../billing/economics.js";

type ClientRow = {
  founding_member: number;
  referral_code: string | null;
  referred_by_client_id: string | null;
  referral_qualified_at: number | null;
  referral_bonus_paid: number;
};

function randomReferralCode(): string {
  return `AIBC-${randomBytes(4).toString("hex").toUpperCase()}`;
}

export function ensureClientProfile(
  db: DbType,
  clientId: string,
  referredByCode?: string,
): ClientRow {
  let row = db
    .prepare(
      `SELECT founding_member, referral_code, referred_by_client_id, referral_qualified_at, referral_bonus_paid
       FROM clients WHERE id = ?`,
    )
    .get(clientId) as ClientRow | undefined;

  if (!row) {
    db.prepare("INSERT INTO clients (id, created_at) VALUES (?, ?)").run(clientId, Date.now());
    row = {
      founding_member: 0,
      referral_code: null,
      referred_by_client_id: null,
      referral_qualified_at: null,
      referral_bonus_paid: 0,
    };
  }

  if (!row.referral_code) {
    let code = randomReferralCode();
    for (let i = 0; i < 5; i++) {
      try {
        db.prepare("UPDATE clients SET referral_code = ? WHERE id = ?").run(code, clientId);
        row.referral_code = code;
        break;
      } catch {
        code = randomReferralCode();
      }
    }
  }

  if (referredByCode && !row.referred_by_client_id) {
    const referrer = db
      .prepare("SELECT id FROM clients WHERE referral_code = ? AND id != ?")
      .get(referredByCode.trim().toUpperCase(), clientId) as { id: string } | undefined;
    if (referrer) {
      db.prepare("UPDATE clients SET referred_by_client_id = ? WHERE id = ?").run(referrer.id, clientId);
      row.referred_by_client_id = referrer.id;
    }
  }

  if (!row.founding_member) {
    const count = db
      .prepare("SELECT COUNT(*) as c FROM clients WHERE founding_member = 1")
      .get() as { c: number };
    if (count.c < FOUNDING_MEMBER_CAP) {
      const now = Date.now();
      db.prepare(
        "UPDATE clients SET founding_member = 1, founding_enrolled_at = ? WHERE id = ?",
      ).run(now, clientId);
      row.founding_member = 1;
    }
  }

  return row;
}

export function foundingBonusMultiplier(db: DbType, clientId: string): number {
  const row = db
    .prepare("SELECT founding_member FROM clients WHERE id = ?")
    .get(clientId) as { founding_member: number } | undefined;
  return row?.founding_member ? FOUNDING_BONUS_MULTIPLIER : 1;
}

export function maybeQualifyReferral(db: DbType, clientId: string): void {
  const earnings = db
    .prepare("SELECT lifetime FROM earnings WHERE client_id = ?")
    .get(clientId) as { lifetime: number } | undefined;
  const lifetime = earnings?.lifetime ?? 0;
  if (lifetime < REFERRAL_QUALIFY_USD) return;

  db.prepare(
    `UPDATE clients SET referral_qualified_at = ?
     WHERE id = ? AND referral_qualified_at IS NULL AND referred_by_client_id IS NOT NULL`,
  ).run(Date.now(), clientId);
}

export function computeReferralBonus(db: DbType, referrerClientId: string): number {
  const referrer = db
    .prepare("SELECT referral_bonus_paid FROM clients WHERE id = ?")
    .get(referrerClientId) as { referral_bonus_paid: number } | undefined;
  if (!referrer || referrer.referral_bonus_paid) return 0;

  const qualified = db
    .prepare(
      `SELECT COUNT(*) as c FROM clients
       WHERE referred_by_client_id = ? AND referral_qualified_at IS NOT NULL`,
    )
    .get(referrerClientId) as { c: number };

  return qualified.c > 0 ? REFERRAL_BONUS_USD : 0;
}

export function markReferralBonusPaid(db: DbType, referrerClientId: string): void {
  db.prepare("UPDATE clients SET referral_bonus_paid = 1 WHERE id = ?").run(referrerClientId);
}

export function getReferralStats(db: DbType, clientId: string, portalUrl: string) {
  const client = db
    .prepare(
      `SELECT referral_code, referral_bonus_paid, founding_member, founding_enrolled_at
       FROM clients WHERE id = ?`,
    )
    .get(clientId) as {
      referral_code: string | null;
      referral_bonus_paid: number;
      founding_member: number;
      founding_enrolled_at: number | null;
    } | undefined;

  const referred = db
    .prepare(
      `SELECT COUNT(*) as total,
              SUM(CASE WHEN referral_qualified_at IS NOT NULL THEN 1 ELSE 0 END) as qualified
       FROM clients WHERE referred_by_client_id = ?`,
    )
    .get(clientId) as { total: number; qualified: number };

  const code = client?.referral_code ?? "";
  const link = code ? `${portalUrl.replace(/\/$/, "")}/login?ref=${encodeURIComponent(code)}` : "";

  return {
    referralCode: code,
    referralLink: link,
    referralsTotal: referred?.total ?? 0,
    referralsQualified: referred?.qualified ?? 0,
    referralBonusPaid: Boolean(client?.referral_bonus_paid),
    referralBonusPending:
      !client?.referral_bonus_paid && (referred?.qualified ?? 0) > 0,
    referralBonusUsd: REFERRAL_BONUS_USD,
    qualifyUsd: REFERRAL_QUALIFY_USD,
    foundingMember: Boolean(client?.founding_member),
    foundingEnrolledAt: client?.founding_enrolled_at
      ? new Date(client.founding_enrolled_at).toISOString()
      : null,
  };
}
