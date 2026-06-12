import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

export const AIBC_DIR = path.join(os.homedir(), ".aibc");
export const AD_CACHE_FILE = path.join(AIBC_DIR, "ad-cache.json");
export const STATUSLINE_FILE = path.join(AIBC_DIR, "statusline.cjs");
export const SETTINGS_BACKUP = path.join(AIBC_DIR, "claude-settings.backup.json");
export const CLAUDE_SETTINGS = path.join(os.homedir(), ".claude", "settings.json");

export function writeAdCache(adText: string, clickUrl: string, adId: string): void {
  fs.mkdirSync(AIBC_DIR, { recursive: true });
  fs.writeFileSync(
    AD_CACHE_FILE,
    JSON.stringify({ adText, clickUrl, adId, ts: Date.now() }, null, 2),
  );
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
    try {
      if (fs.existsSync(SETTINGS_BACKUP)) {
        fs.writeFileSync(CLAUDE_SETTINGS, fs.readFileSync(SETTINGS_BACKUP, "utf8"));
        fs.unlinkSync(SETTINGS_BACKUP);
      }
      return true;
    } catch {
      return false;
    }
  }

  private ensureStatuslineScript(): void {
    fs.mkdirSync(AIBC_DIR, { recursive: true });
    if (fs.existsSync(STATUSLINE_FILE)) return;

    const bundled = path.join(__dirname, "assets", "cli", "statusline.cjs");
    if (fs.existsSync(bundled)) {
      fs.copyFileSync(bundled, STATUSLINE_FILE);
      return;
    }

    // Fallback inline minimal script
    fs.writeFileSync(
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
      fs.writeFileSync(SETTINGS_BACKUP, raw);
    }

    const settings = JSON.parse(raw) as Record<string, unknown>;
    settings.statusLine = {
      type: "command",
      command: `node "${STATUSLINE_FILE}"`,
    };

    fs.mkdirSync(path.dirname(CLAUDE_SETTINGS), { recursive: true });
    fs.writeFileSync(CLAUDE_SETTINGS, JSON.stringify(settings, null, 2));
  }
}
