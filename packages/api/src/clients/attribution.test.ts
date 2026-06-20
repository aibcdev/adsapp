import assert from "node:assert/strict";
import Database from "better-sqlite3";
import { describe, it, beforeEach } from "node:test";
import {
  ensureAttributionColumns,
  getAcquisitionStats,
  parseAttributionInput,
  recordClientAttribution,
} from "./attribution.js";

describe("attribution", () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(":memory:");
    db.exec(`
      CREATE TABLE clients (
        id TEXT PRIMARY KEY,
        email TEXT,
        created_at INTEGER NOT NULL
      );
      CREATE TABLE auth_states (
        state TEXT PRIMARY KEY,
        client_id TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL
      );
    `);
    ensureAttributionColumns(db);
  });

  it("parses utm fields from snake_case", () => {
    const attr = parseAttributionInput({
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "earn",
    });
    assert.deepEqual(attr, {
      utmSource: "google",
      utmMedium: "cpc",
      utmCampaign: "earn",
      utmContent: undefined,
      utmTerm: undefined,
      landingPath: undefined,
    });
  });

  it("records first-touch attribution only once", () => {
    db.prepare("INSERT INTO clients (id, email, created_at) VALUES (?, ?, ?)").run(
      "c1",
      "dev@example.com",
      Date.now(),
    );

    recordClientAttribution(db, "c1", {
      utmSource: "google",
      utmMedium: "cpc",
      utmCampaign: "earn",
    });
    recordClientAttribution(db, "c1", {
      utmSource: "tiktok",
      utmMedium: "paid",
      utmCampaign: "other",
    });

    const row = db
      .prepare("SELECT signup_utm_source, signup_utm_campaign FROM clients WHERE id = ?")
      .get("c1") as { signup_utm_source: string; signup_utm_campaign: string };

    assert.equal(row.signup_utm_source, "google");
    assert.equal(row.signup_utm_campaign, "earn");
  });

  it("groups acquisition stats by source", () => {
    const now = Date.now();
    db.prepare(
      "INSERT INTO clients (id, email, created_at, signup_utm_source, signup_utm_medium, signup_utm_campaign) VALUES (?, ?, ?, ?, ?, ?)",
    ).run("c1", "a@example.com", now, "google", "cpc", "earn");
    db.prepare(
      "INSERT INTO clients (id, email, created_at, signup_utm_source, signup_utm_medium, signup_utm_campaign) VALUES (?, ?, ?, ?, ?, ?)",
    ).run("c2", "b@example.com", now, "google", "cpc", "earn");
    db.prepare("INSERT INTO clients (id, email, created_at) VALUES (?, ?, ?)").run(
      "c3",
      "c@example.com",
      now,
    );

    const stats = getAcquisitionStats(db);
    assert.equal(stats.totals.signupsWithEmail, 3);
    assert.equal(stats.totals.attributed, 2);
    assert.equal(stats.totals.direct, 1);
    assert.equal(stats.rows[0]?.source, "google");
    assert.equal(stats.rows[0]?.signups, 2);
  });
});
