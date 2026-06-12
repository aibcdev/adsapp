import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { DEFAULT_API_BASE } from "@aibc/shared";

export const AIBC_DIR = path.join(os.homedir(), ".aibc");
export const AUTH_FILE = path.join(AIBC_DIR, "auth.json");
export const AD_CACHE_FILE = path.join(AIBC_DIR, "ad-cache.json");
export const STATUSLINE_FILE = path.join(AIBC_DIR, "statusline.cjs");
export const SETTINGS_BACKUP = path.join(AIBC_DIR, "claude-settings.backup.json");
export const CLAUDE_SETTINGS = path.join(os.homedir(), ".claude", "settings.json");

export const DEFAULT_API = process.env.AIBC_API_BASE || DEFAULT_API_BASE;

export function ensureAibcDir() {
  fs.mkdirSync(AIBC_DIR, { recursive: true });
}

export function readJson<T>(file: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as T;
  } catch {
    return null;
  }
}

export function writeJson(file: string, data: unknown) {
  ensureAibcDir();
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

export interface AdCache {
  adText: string;
  clickUrl: string;
  adId: string;
  ts: number;
}

export function writeAdCache(adText: string, clickUrl: string, adId: string) {
  writeJson(AD_CACHE_FILE, { adText, clickUrl, adId, ts: Date.now() } satisfies AdCache);
}
