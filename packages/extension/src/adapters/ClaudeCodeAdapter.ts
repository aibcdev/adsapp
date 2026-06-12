import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

const MARKER_START = "/* AIBC-AD-START */";
const MARKER_END = "/* AIBC-AD-END */";

export interface AdapterPreflight {
  compatible: boolean;
  reason?: string;
  version?: string;
}

export function locateClaudeCodeTarget(): string | null {
  const roots = [
    path.join(os.homedir(), ".cursor", "extensions"),
    path.join(os.homedir(), ".vscode", "extensions"),
    path.join(os.homedir(), ".vscode-insiders", "extensions"),
  ];

  for (const root of roots) {
    try {
      if (!fs.existsSync(root)) continue;
      const hits = fs
        .readdirSync(root)
        .filter((n) => n.startsWith("anthropic.claude-code-"))
        .map((n) => path.join(root, n, "webview", "index.js"))
        .filter((p) => fs.existsSync(p))
        .sort();
      if (hits.length) return hits[hits.length - 1];
    } catch {
      /* skip */
    }
  }
  return null;
}

export class ClaudeCodeAdapter {
  private backupPath: string | null = null;

  constructor(private readonly target: string | null) {}

  preflight(): AdapterPreflight {
    if (!this.target || !fs.existsSync(this.target)) {
      return { compatible: false, reason: "Claude Code not found" };
    }
    const m = /anthropic\.claude-code-(\d+\.\d+\.\d+)/.exec(this.target);
    return { compatible: true, version: m?.[1] || "unknown" };
  }

  apply(adText: string, clickUrl: string): boolean {
    if (!this.target) return false;
    const pf = this.preflight();
    if (!pf.compatible) return false;

    const content = fs.readFileSync(this.target, "utf8");
    if (!this.backupPath) {
      this.backupPath = `${this.target}.aibc-backup`;
      if (!fs.existsSync(this.backupPath)) {
        fs.writeFileSync(this.backupPath, content);
      }
    }

    const injection = buildInjection(adText, clickUrl);
    const stripped = stripInjection(content);
    fs.writeFileSync(this.target, stripped + injection);
    return true;
  }

  restore(): boolean {
    if (!this.target || !this.backupPath || !fs.existsSync(this.backupPath)) {
      return false;
    }
    fs.writeFileSync(this.target, fs.readFileSync(this.backupPath, "utf8"));
    return true;
  }

  updateAd(adText: string, clickUrl: string): void {
    if (!this.target) return;
    const content = fs.readFileSync(this.target, "utf8");
    if (!content.includes(MARKER_START)) {
      this.apply(adText, clickUrl);
      return;
    }
    const stripped = stripInjection(content);
    fs.writeFileSync(this.target, stripped + buildInjection(adText, clickUrl));
  }
}

function stripInjection(content: string): string {
  const start = content.indexOf(MARKER_START);
  if (start === -1) return content;
  const end = content.indexOf(MARKER_END);
  if (end === -1) return content.slice(0, start);
  return content.slice(0, start) + content.slice(end + MARKER_END.length);
}

function buildInjection(adText: string, clickUrl: string): string {
  const safeText = JSON.stringify(adText);
  const safeUrl = JSON.stringify(clickUrl);
  return `${MARKER_START}
(function(){
  var AD_TEXT=${safeText};
  var CLICK_URL=${safeUrl};
  function inject(){
    var nodes=document.querySelectorAll('[class*="spinner"], [class*="Spinner"], [data-testid*="spinner"]');
    if(!nodes.length) nodes=document.querySelectorAll('span,div');
    for(var i=0;i<nodes.length;i++){
      var n=nodes[i];
      if(!n||!n.textContent) continue;
      if(/ing\\.\\.\\.$|ing…$/.test(n.textContent.trim())){
        n.innerHTML='<a href="'+CLICK_URL+'" style="color:#a5b4fc;text-decoration:underline;cursor:pointer">'+AD_TEXT+'</a>';
        return;
      }
    }
  }
  setInterval(inject,800);
  inject();
})();
${MARKER_END}`;
}
