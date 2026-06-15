import type { Database as DbType } from "better-sqlite3";
import { config } from "../config.js";
import { getStripe } from "../stripe.js";

export function ensureStripeConnectColumns(db: DbType) {
  for (const sql of [
    "ALTER TABLE clients ADD COLUMN stripe_connect_id TEXT",
    "ALTER TABLE payouts ADD COLUMN stripe_transfer_id TEXT",
  ]) {
    try {
      db.exec(sql);
    } catch {
      /* exists */
    }
  }
}

export function getStripeConnectId(db: DbType, clientId: string): string | null {
  const row = db
    .prepare("SELECT stripe_connect_id FROM clients WHERE id = ?")
    .get(clientId) as { stripe_connect_id: string | null } | undefined;
  return row?.stripe_connect_id ?? null;
}

export async function createConnectOnboarding(
  db: DbType,
  clientId: string,
  email?: string,
): Promise<{ url: string } | { error: string }> {
  const s = getStripe();
  if (!s) return { error: "Stripe not configured" };

  let accountId = getStripeConnectId(db, clientId);
  if (!accountId) {
    const account = await s.accounts.create({
      type: "express",
      email: email || undefined,
      capabilities: { transfers: { requested: true } },
      metadata: { client_id: clientId },
    });
    accountId = account.id;
    db.prepare("UPDATE clients SET stripe_connect_id = ? WHERE id = ?").run(accountId, clientId);
  }

  const link = await s.accountLinks.create({
    account: accountId,
    refresh_url: `${config.portalUrl}/dashboard?connect=refresh`,
    return_url: `${config.portalUrl}/dashboard?connect=success`,
    type: "account_onboarding",
  });

  if (!link.url) return { error: "Failed to create onboarding link" };
  return { url: link.url };
}

export async function getConnectStatus(db: DbType, clientId: string) {
  const accountId = getStripeConnectId(db, clientId);
  if (!accountId) {
    return {
      connected: false,
      payoutsEnabled: false,
      detailsSubmitted: false,
      accountId: null as string | null,
    };
  }

  const s = getStripe();
  if (!s) {
    return {
      connected: true,
      payoutsEnabled: false,
      detailsSubmitted: false,
      accountId,
    };
  }

  const account = await s.accounts.retrieve(accountId);
  return {
    connected: true,
    payoutsEnabled: Boolean(account.payouts_enabled),
    detailsSubmitted: Boolean(account.details_submitted),
    accountId,
  };
}

export async function transferPayoutToConnect(
  db: DbType,
  clientId: string,
  amountUsd: number,
  payoutId: string,
): Promise<{ transferId: string } | { error: string }> {
  const s = getStripe();
  if (!s) return { error: "Stripe not configured" };

  const status = await getConnectStatus(db, clientId);
  if (!status.payoutsEnabled || !status.accountId) {
    return { error: "Stripe Connect payouts not enabled. Complete onboarding first." };
  }

  const cents = Math.round(amountUsd * 100);
  if (cents < 100) return { error: "Minimum Stripe transfer is $1.00" };

  const transfer = await s.transfers.create({
    amount: cents,
    currency: "usd",
    destination: status.accountId,
    metadata: { payout_id: payoutId, client_id: clientId },
  });

  db.prepare("UPDATE payouts SET stripe_transfer_id = ? WHERE id = ?").run(transfer.id, payoutId);
  return { transferId: transfer.id };
}
