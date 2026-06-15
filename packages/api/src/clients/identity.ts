import type { Database as DbType } from "better-sqlite3";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function findCanonicalClientByEmail(db: DbType, email: string): string | null {
  const row = db
    .prepare(
      "SELECT id FROM clients WHERE lower(email) = ? ORDER BY created_at ASC LIMIT 1",
    )
    .get(normalizeEmail(email)) as { id: string } | undefined;
  return row?.id ?? null;
}

/** Move all data from `fromId` into `intoId`, then delete `fromId`. */
export function mergeClients(db: DbType, fromId: string, intoId: string): void {
  if (fromId === intoId) return;

  const run = db.transaction(() => {
    db.prepare("INSERT OR IGNORE INTO earnings (client_id) VALUES (?)").run(intoId);
    db.prepare("INSERT OR IGNORE INTO earnings (client_id) VALUES (?)").run(fromId);

    const fromE = db
      .prepare(
        "SELECT today, month, lifetime, pending, payable FROM earnings WHERE client_id = ?",
      )
      .get(fromId) as
      | { today: number; month: number; lifetime: number; pending: number; payable: number }
      | undefined;

    if (fromE) {
      db.prepare(`
        UPDATE earnings SET
          today = today + ?,
          month = month + ?,
          lifetime = lifetime + ?,
          pending = pending + ?,
          payable = payable + ?
        WHERE client_id = ?
      `).run(
        fromE.today,
        fromE.month,
        fromE.lifetime,
        fromE.pending,
        fromE.payable,
        intoId,
      );
      db.prepare("DELETE FROM earnings WHERE client_id = ?").run(fromId);
    }

    db.prepare("UPDATE impressions SET client_id = ? WHERE client_id = ?").run(intoId, fromId);
    db.prepare("UPDATE pending_credits SET client_id = ? WHERE client_id = ?").run(intoId, fromId);
    db.prepare("UPDATE payouts SET client_id = ? WHERE client_id = ?").run(intoId, fromId);
    db.prepare("UPDATE sessions SET client_id = ? WHERE client_id = ?").run(intoId, fromId);
    db.prepare("UPDATE auth_states SET client_id = ? WHERE client_id = ?").run(intoId, fromId);
    db.prepare("UPDATE clients SET referred_by_client_id = ? WHERE referred_by_client_id = ?").run(
      intoId,
      fromId,
    );
    db.prepare("UPDATE campaigns SET client_id = ? WHERE client_id = ?").run(intoId, fromId);

    const fromBal = db
      .prepare("SELECT balance FROM advertiser_balance WHERE client_id = ?")
      .get(fromId) as { balance: number } | undefined;
    if (fromBal) {
      db.prepare("INSERT OR IGNORE INTO advertiser_balance (client_id, balance) VALUES (?, 0)").run(
        intoId,
      );
      db.prepare("UPDATE advertiser_balance SET balance = balance + ? WHERE client_id = ?").run(
        fromBal.balance,
        intoId,
      );
      db.prepare("DELETE FROM advertiser_balance WHERE client_id = ?").run(fromId);
    }

    const fromPm = db
      .prepare("SELECT rail, handle FROM payout_methods WHERE client_id = ?")
      .get(fromId) as { rail: string; handle: string } | undefined;
    const intoPm = db.prepare("SELECT 1 FROM payout_methods WHERE client_id = ?").get(intoId);
    if (fromPm && !intoPm) {
      db.prepare(
        "INSERT OR REPLACE INTO payout_methods (client_id, rail, handle) VALUES (?, ?, ?)",
      ).run(intoId, fromPm.rail, fromPm.handle);
    }
    db.prepare("DELETE FROM payout_methods WHERE client_id = ?").run(fromId);
    db.prepare("DELETE FROM clients WHERE id = ?").run(fromId);
  });

  run();
}

/**
 * After OAuth/email sign-in: reuse existing wallet for this email, or attach email to provisional ID.
 */
export function resolveAuthClientId(db: DbType, provisionalId: string, email: string): string {
  const normalized = normalizeEmail(email);
  const canonical = findCanonicalClientByEmail(db, normalized);

  if (!canonical) {
    db.prepare("UPDATE clients SET email = ? WHERE id = ?").run(normalized, provisionalId);
    return provisionalId;
  }

  if (canonical !== provisionalId) {
    mergeClients(db, provisionalId, canonical);
  } else {
    db.prepare("UPDATE clients SET email = ? WHERE id = ?").run(normalized, provisionalId);
  }

  return canonical;
}

/** Merge duplicate rows that share the same email (keeps oldest client). */
export function dedupeClientsByEmail(db: DbType): number {
  const dupes = db
    .prepare(`
      SELECT lower(email) as em, GROUP_CONCAT(id) as ids, MIN(created_at) as oldest
      FROM clients
      WHERE email IS NOT NULL AND trim(email) != ''
      GROUP BY lower(email)
      HAVING COUNT(*) > 1
    `)
    .all() as Array<{ em: string; ids: string; oldest: number }>;

  let merged = 0;
  for (const row of dupes) {
    const ids = row.ids.split(",");
    const canonical = db
      .prepare("SELECT id FROM clients WHERE lower(email) = ? ORDER BY created_at ASC LIMIT 1")
      .get(row.em) as { id: string };
    for (const id of ids) {
      if (id !== canonical.id) {
        mergeClients(db, id, canonical.id);
        merged++;
      }
    }
  }
  return merged;
}
