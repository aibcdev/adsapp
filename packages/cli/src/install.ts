import * as fs from "node:fs";
import * as path from "node:path";
import { installStatuslineScript } from "./api";
import {
  AUTH_FILE,
  CLAUDE_SETTINGS,
  AIBC_DIR,
  SETTINGS_BACKUP,
  STATUSLINE_FILE,
  ensureAibcDir,
  readJson,
} from "./paths";

interface ClaudeSettings {
  statusLine?: { type: string; command?: string };
  [key: string]: unknown;
}

export function installClaudeTerminal(): void {
  ensureAibcDir();
  installStatuslineScript();

  const raw = fs.existsSync(CLAUDE_SETTINGS)
    ? fs.readFileSync(CLAUDE_SETTINGS, "utf8")
    : "{}";

  if (!fs.existsSync(SETTINGS_BACKUP)) {
    fs.writeFileSync(SETTINGS_BACKUP, raw);
  }

  const settings = JSON.parse(raw) as ClaudeSettings;
  settings.statusLine = {
    type: "command",
    command: `node "${STATUSLINE_FILE}"`,
  };

  fs.mkdirSync(path.dirname(CLAUDE_SETTINGS), { recursive: true });
  fs.writeFileSync(CLAUDE_SETTINGS, JSON.stringify(settings, null, 2));
  console.log("aibc installed for Claude Code terminal.");
  console.log("Restart your claude session to see ads in the status line.");
}

export function restoreClaudeTerminal(): void {
  if (!fs.existsSync(SETTINGS_BACKUP)) {
    console.log("No backup found — nothing to restore.");
    return;
  }
  fs.writeFileSync(CLAUDE_SETTINGS, fs.readFileSync(SETTINGS_BACKUP, "utf8"));
  fs.unlinkSync(SETTINGS_BACKUP);
  console.log("Claude settings restored.");
}

export function status(): void {
  const settings = readJson<ClaudeSettings>(CLAUDE_SETTINGS);
  const installed =
    settings?.statusLine?.command?.includes(".aibc") ||
    settings?.statusLine?.command?.includes("aibc");

  console.log("aibc CLI status");
  console.log("  Config dir:", AIBC_DIR);
  console.log("  Terminal hook:", installed ? "installed" : "not installed");
  console.log("  Signed in:", fs.existsSync(path.join(AIBC_DIR, "auth.json")) ? "yes" : "no");
}
