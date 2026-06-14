import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { atomicWriteFile } from "../util/atomicWrite.js";

export const AIBC_DIR = path.join(os.homedir(), ".aibc");
export const AD_CACHE_FILE = path.join(AIBC_DIR, "ad-cache.json");
export const STATUSLINE_FILE = path.join(AIBC_DIR, "statusline.cjs");
export const SETTINGS_BACKUP = path.join(AIBC_DIR, "claude-settings.backup.json");
export const CLAUDE_SETTINGS = path.join(os.homedir(), ".claude", "settings.json");

const AIBC_STATUS_CMD = `node "${STATUSLINE_FILE}"`;

export function writeAdCache(adText: string, clickUrl: string, adId: string): void {
  fs.mkdirSync(AIBC_DIR, { recursive: true });
  atomicWriteFile(
    AD_CACHE_FILE,
    JSON.stringify({ adText, clickUrl, adId, ts: Date.now() }, null, 2),
  );
}

/** Parse settings.json tolerating // line comments (no stripJsonc comma bug). */
export function parseSettingsJson(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    const stripped = raw
      .split("\n")
      .filter((line) => !/^\s*\/\//.test(line))
      .join("\n")
      .replace(/\/\*[\s\S]*?\*\//g, "");
    return JSON.parse(stripped) as Record<string, unknown>;
  }
}

export function cleanupAibcArtifacts(): void {
  for (const file of [AD_CACHE_FILE, STATUSLINE_FILE, SETTINGS_BACKUP]) {
    try {
      if (fs.existsSync(file)) fs.unlinkSync(file);
    } catch {
      /* skip */
    }
  }
  try {
    if (fs.existsSync(AIBC_DIR) && fs.readdirSync(AIBC_DIR).length === 0) {
      fs.rmdirSync(AIBC_DIR);
    }
  } catch {
    /* skip */
  }
}

export class ClaudeCliAdapter {
  private installed = false;

  preflight(): { compatible: boolean; reason?: string } {
    return { compatible: true };
  }

  apply(adText: string, clickUrl: string, adId = "aibc-ad"): boolean {
    try {
      this.ensureStatuslineScript();
      this.ensureSettings();
      writeAdCache(adText, clickUrl, adId);
      this.installed = true;
      return true;
    } catch {
      return false;
    }
  }

  restore(): boolean {
    let restored = false;
    try {
      if (fs.existsSync(SETTINGS_BACKUP)) {
        atomicWriteFile(CLAUDE_SETTINGS, fs.readFileSync(SETTINGS_BACKUP, "utf8"));
        fs.unlinkSync(SETTINGS_BACKUP);
        restored = true;
      } else if (fs.existsSync(CLAUDE_SETTINGS)) {
        const raw = fs.readFileSync(CLAUDE_SETTINGS, "utf8");
        const settings = parseSettingsJson(raw);
        const existing = settings.statusLine as { command?: string } | undefined;
        const cmd = existing?.command || "";
        if (cmd.includes(AIBC_STATUS_CMD) || cmd.includes(".aibc/statusline.cjs")) {
          delete settings.statusLine;
          atomicWriteFile(CLAUDE_SETTINGS, JSON.stringify(settings, null, 2));
          restored = true;
        }
      }
      cleanupAibcArtifacts();
    } catch {
      /* best effort */
    }
    return restored;
  }

  isInstalled(): boolean {
    return this.installed;
  }

  private ensureStatuslineScript(): void {
    fs.mkdirSync(AIBC_DIR, { recursive: true });
    if (fs.existsSync(STATUSLINE_FILE)) return;

    const bundled = path.join(__dirname, "assets", "cli", "statusline.cjs");
    if (fs.existsSync(bundled)) {
      fs.copyFileSync(bundled, STATUSLINE_FILE);
      return;
    }

    atomicWriteFile(
      STATUSLINE_FILE,
      `const fs=require("fs"),p=require("path"),c=p.join(require("os").homedir(),".aibc","ad-cache.json");
try{const o=JSON.parse(fs.readFileSync(c,"utf8"));if(o.adText)process.stdout.write("ad· "+o.adText);}catch{}`,
    );
  }

  private ensureSettings(): void {
    const raw = fs.existsSync(CLAUDE_SETTINGS)
      ? fs.readFileSync(CLAUDE_SETTINGS, "utf8")
      : "{}";

    if (!fs.existsSync(SETTINGS_BACKUP)) {
      atomicWriteFile(SETTINGS_BACKUP, raw);
    }

    const settings = parseSettingsJson(raw);
    const existing = settings.statusLine as { command?: string } | undefined;
    const existingCmd = existing?.command || "";

    if (existingCmd.includes(AIBC_STATUS_CMD) || existingCmd.includes(".aibc/statusline.cjs")) {
      return;
    }

    settings.statusLine = {
      type: "command",
      command: AIBC_STATUS_CMD,
    };

    fs.mkdirSync(path.dirname(CLAUDE_SETTINGS), { recursive: true });
    atomicWriteFile(CLAUDE_SETTINGS, JSON.stringify(settings, null, 2));
  }
}
