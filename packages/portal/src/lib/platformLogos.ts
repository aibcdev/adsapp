import type { InstallKey } from "./installLinks";

export const PLATFORM_LOGOS: Partial<Record<InstallKey, string>> = {
  vscode: "/logos/vscode.svg",
  cursor: "/logos/cursor.svg",
  windsurf: "/logos/windsurf.svg",
  openvsx: "/logos/openvsx.svg",
};

export const PLATFORM_LOGO_BY_ID: Record<string, string> = {
  vscode: "/logos/vscode.svg",
  "vscode-insiders": "/logos/vscode-insiders.svg",
  cursor: "/logos/cursor.svg",
  windsurf: "/logos/windsurf.svg",
  openvsx: "/logos/openvsx.svg",
  "claude-code": "/logos/claude-code.svg",
  "claude-cli": "/logos/claude-cli.svg",
  "github-copilot": "/logos/github-copilot.svg",
  codex: "/logos/codex.svg",
  v0: "/logos/v0.svg",
  antigravity: "/logos/antigravity.svg",
};
