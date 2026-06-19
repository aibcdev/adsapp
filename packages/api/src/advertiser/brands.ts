import { randomUUID } from "node:crypto";
import type { Database as DbType } from "better-sqlite3";

export function listBrands(db: DbType, clientId: string) {
  const rows = db
    .prepare(
      "SELECT id, name, logo_url as logoUrl, created_at as createdAt FROM advertiser_brands WHERE client_id = ? ORDER BY name ASC",
    )
    .all(clientId) as Array<{ id: string; name: string; logoUrl: string | null; createdAt: number }>;

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    logoUrl: r.logoUrl,
    createdAt: new Date(r.createdAt).toISOString(),
  }));
}

export function createBrand(
  db: DbType,
  clientId: string,
  name: string,
  logoUrl?: string | null,
): { id: string; name: string } {
  const trimmed = name.trim();
  if (trimmed.length < 1 || trimmed.length > 64) {
    throw new Error("Brand name must be 1–64 characters");
  }
  const id = randomUUID();
  db.prepare(
    "INSERT INTO advertiser_brands (id, client_id, name, logo_url, created_at) VALUES (?, ?, ?, ?, ?)",
  ).run(id, clientId, trimmed, logoUrl || null, Date.now());
  return { id, name: trimmed };
}

export function updateBrand(
  db: DbType,
  clientId: string,
  brandId: string,
  patch: { name?: string; logoUrl?: string | null },
): boolean {
  const row = db
    .prepare("SELECT id FROM advertiser_brands WHERE id = ? AND client_id = ?")
    .get(brandId, clientId);
  if (!row) return false;

  if (patch.name !== undefined) {
    const trimmed = patch.name.trim();
    if (trimmed.length < 1 || trimmed.length > 64) throw new Error("Brand name must be 1–64 characters");
    db.prepare("UPDATE advertiser_brands SET name = ? WHERE id = ?").run(trimmed, brandId);
  }
  if (patch.logoUrl !== undefined) {
    db.prepare("UPDATE advertiser_brands SET logo_url = ? WHERE id = ?").run(patch.logoUrl, brandId);
  }
  return true;
}

export function resolveBrandForCampaign(
  db: DbType,
  clientId: string,
  brandId?: string | null,
  brandName?: string | null,
): { brandId: string | null; brandName: string | null } {
  if (brandId) {
    const brand = db
      .prepare("SELECT id, name FROM advertiser_brands WHERE id = ? AND client_id = ?")
      .get(brandId, clientId) as { id: string; name: string } | undefined;
    if (brand) return { brandId: brand.id, brandName: brand.name };
  }

  if (brandName?.trim()) {
    const created = createBrand(db, clientId, brandName.trim());
    return { brandId: created.id, brandName: created.name };
  }

  return { brandId: null, brandName: brandName?.trim() || null };
}
