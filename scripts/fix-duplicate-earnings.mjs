#!/usr/bin/env node
/**
 * One-time cleanup: merge duplicate accounts by email, strip seed-ad credits, recalc balances.
 *
 * Usage:
 *   AIBC_DB_PATH=/data/aibc.db node scripts/fix-duplicate-earnings.mjs
 *   AIBC_DB_PATH=/data/aibc.db node scripts/fix-duplicate-earnings.mjs watchaibc@gmail.com
 */
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

execSync("npm run build --workspace=@aibc/api", { cwd: root, stdio: "inherit" });

const { createDb } = await import(join(root, "packages/api/dist/db/schema.js"));
const { dedupeClientsByEmail, findCanonicalClientByEmail } = await import(
  join(root, "packages/api/dist/clients/identity.js")
);
const {
  stripSeedCreditsFromLedger,
  recalcEarningsFromImpressions,
} = await import(join(root, "packages/api/dist/billing/earningsPeriod.js"));

const emailFilter = process.argv[2]?.trim().toLowerCase();

const db = createDb();

console.log("[fix] Merging duplicate accounts by email…");
const merged = dedupeClientsByEmail(db);
console.log(`[fix] Merged ${merged} duplicate account(s).`);

console.log("[fix] Stripping seed/sample ad credits…");
const stripped = stripSeedCreditsFromLedger(db);
console.log(`[fix] Zeroed ${stripped} seed impression credit(s).`);

const clients = emailFilter
  ? (() => {
      const id = findCanonicalClientByEmail(db, emailFilter);
      return id ? [id] : [];
    })()
  : (db
      .prepare("SELECT DISTINCT client_id FROM impressions WHERE client_id IS NOT NULL")
      .all() as Array<{ client_id: string }>).map((r) => r.client_id);

if (emailFilter && clients.length === 0) {
  console.warn(`[fix] No client found for ${emailFilter}`);
}

for (const clientId of clients) {
  recalcEarningsFromImpressions(db, clientId);
}

console.log(`[fix] Recalculated earnings for ${clients.length} client(s).`);
console.log("[fix] Done.");
