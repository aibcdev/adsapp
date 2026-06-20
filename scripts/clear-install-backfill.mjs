#!/usr/bin/env node
/** Remove synthetic backfill rows — real admin only counts live installs after this. */
import Database from "better-sqlite3";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.AIBC_DB_PATH || join(__dirname, "..", "packages", "api", "src", "aibc.db");

const db = new Database(DB_PATH);
const removed = db.prepare("DELETE FROM install_events WHERE source = 'backfill'").run().changes;
console.log(`Removed ${removed} backfill install events from ${DB_PATH}`);
db.close();
