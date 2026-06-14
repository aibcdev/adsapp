import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { atomicWriteFile } from "../util/atomicWrite.js";

const MARKER_START = "/* AIBC-AD-START */";
const MARKER_END = "/* AIBC-AD-END */";

export interface AdapterPreflight {
  compatible: boolean;
  reason?: string;
  version?: string;
}

function extensionRoots(): string[] {
  const home = os.homedir();
  const roots = [
    path.join(home, ".cursor", "extensions"),
    path.join(home, ".vscode", "extensions"),
    path.join(home, ".vscode-insiders", "extensions"),
  ];

  if (process.platform === "win32") {
    const appData = process.env.APPDATA;
    const userProfile = process.env.USERPROFILE || home;
    if (appData) {
      roots.push(path.join(appData, "Code", "extensions"));
      roots.push(path.join(appData, "Code - Insiders", "extensions"));
      roots.push(path.join(appData, "Cursor", "extensions"));
    }
    roots.push(path.join(userProfile, ".vscode", "extensions"));
    roots.push(path.join(userProfile, ".vscode-insiders", "extensions"));
    roots.push(path.join(userProfile, ".cursor", "extensions"));
  }

  return roots;
}

export function locateClaudeCodeTarget(): string | null {
  for (const root of extensionRoots()) {
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

  constructor(private target: string | null) {}

  getTarget(): string | null {
    return this.target;
  }

  setTarget(target: string | null): void {
    if (target !== this.target) {
      this.target = target;
      this.backupPath = null;
    }
  }

  preflight(): AdapterPreflight {
    if (!this.target || !fs.existsSync(this.target)) {
      return {
        compatible: false,
        reason: "Claude Code extension not installed — install it from the marketplace, then reload.",
      };
    }
    const m = /anthropic\.claude-code-(\d+\.\d+\.\d+)/.exec(this.target);
    const version = m?.[1];
    if (!version) {
      return {
        compatible: false,
        reason: "Claude Code found but version unknown — update Claude Code and reload.",
      };
    }
    return { compatible: true, version };
  }

  apply(adText: string, clickUrl: string, viewUrl: string, viewThresholdMs: number): boolean {
    if (!this.target) return false;
    const pf = this.preflight();
    if (!pf.compatible) return false;

    const content = fs.readFileSync(this.target, "utf8");
    if (!this.backupPath) {
      this.backupPath = `${this.target}.aibc-backup`;
      if (!fs.existsSync(this.backupPath)) {
        atomicWriteFile(this.backupPath, content);
      }
    }

    const injection = buildInjection(adText, clickUrl, viewUrl, viewThresholdMs);
    const stripped = stripInjection(content);
    atomicWriteFile(this.target, stripped + injection);
    return true;
  }

  restore(): boolean {
    let restored = false;
    try {
      if (this.target && fs.existsSync(this.target)) {
        if (this.backupPath && fs.existsSync(this.backupPath)) {
          atomicWriteFile(this.target, fs.readFileSync(this.backupPath, "utf8"));
          restored = true;
        } else {
          const content = fs.readFileSync(this.target, "utf8");
          const stripped = stripInjection(content);
          if (stripped !== content) {
            atomicWriteFile(this.target, stripped);
            restored = true;
          }
        }
        if (this.backupPath && fs.existsSync(this.backupPath)) {
          fs.unlinkSync(this.backupPath);
          this.backupPath = null;
        }
      }
    } catch {
      /* best effort */
    }
    return restored;
  }

  updateAd(
    adText: string,
    clickUrl: string,
    viewUrl: string,
    viewThresholdMs: number,
  ): void {
    if (!this.target) return;
    const content = fs.readFileSync(this.target, "utf8");
    if (!content.includes(MARKER_START)) {
      this.apply(adText, clickUrl, viewUrl, viewThresholdMs);
      return;
    }
    const stripped = stripInjection(content);
    atomicWriteFile(
      this.target,
      stripped + buildInjection(adText, clickUrl, viewUrl, viewThresholdMs),
    );
  }
}

function stripInjection(content: string): string {
  const start = content.indexOf(MARKER_START);
  if (start === -1) return content;
  const end = content.indexOf(MARKER_END);
  if (end === -1) return content.slice(0, start);
  return content.slice(0, start) + content.slice(end + MARKER_END.length);
}

function buildInjection(
  adText: string,
  clickUrl: string,
  viewUrl: string,
  viewThresholdMs: number,
): string {
  const safeText = JSON.stringify(adText);
  const safeUrl = JSON.stringify(clickUrl);
  const safeViewUrl = JSON.stringify(viewUrl);
  return `${MARKER_START}
(function(){
  var AD_TEXT=${safeText};
  var CLICK_URL=${safeUrl};
  var VIEW_URL=${safeViewUrl};
  var VIEW_MS=${viewThresholdMs};
  var viewSent=false;
  function reportView(adId){
    if(viewSent) return;
    viewSent=true;
    try{
      fetch(VIEW_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({adId:adId||"unknown"})}).catch(function(){});
    }catch(e){}
  }
  function inject(){
    var nodes=document.querySelectorAll('[class*="spinner"], [class*="Spinner"], [data-testid*="spinner"]');
    if(!nodes.length) nodes=document.querySelectorAll('span,div');
    for(var i=0;i<nodes.length;i++){
      var n=nodes[i];
      if(!n||!n.textContent) continue;
      if(/ing\\.\\.\\.$|ing…$/.test(n.textContent.trim())){
        n.innerHTML='<a href="'+CLICK_URL+'" style="color:#a5b4fc;text-decoration:underline;cursor:pointer">'+AD_TEXT+'</a>';
        setTimeout(function(){ reportView("spinner"); }, VIEW_MS);
        return;
      }
    }
  }
  setInterval(inject,800);
  inject();
})();
${MARKER_END}`;
}
