import type { Context } from "hono";
import type { Database as DbType } from "better-sqlite3";
import { parseTargetCountries } from "./tables.js";

/** Resolve ISO country from Cloudflare, dev header, or stored client profile. */
export function resolveCountryFromRequest(c: Context, db?: DbType, clientId?: string | null): string | null {
  const cf = c.req.header("cf-ipcountry");
  if (cf && cf !== "XX" && /^[A-Z]{2}$/i.test(cf)) {
    return cf.toUpperCase();
  }

  const devHeader = c.req.header("x-aibc-country");
  if (devHeader && /^[A-Z]{2}$/i.test(devHeader)) {
    return devHeader.toUpperCase();
  }

  if (db && clientId) {
    const row = db
      .prepare("SELECT country_code FROM clients WHERE id = ?")
      .get(clientId) as { country_code: string | null } | undefined;
    if (row?.country_code) return row.country_code.toUpperCase();
  }

  return null;
}

export function updateClientCountry(db: DbType, clientId: string, countryCode: string | null): void {
  if (!countryCode || !/^[A-Z]{2}$/.test(countryCode)) return;
  db.prepare("UPDATE clients SET country_code = ? WHERE id = ?").run(countryCode, clientId);
}

export function campaignMatchesGeo(targetCountriesJson: string | null, countryCode: string | null): boolean {
  const targets = parseTargetCountries(targetCountriesJson);
  if (targets.length === 0) return true;
  if (!countryCode) return true;
  return targets.includes(countryCode.toUpperCase());
}
