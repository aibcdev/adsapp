/** Platforms where aibc is supported today vs coming soon. */
export type PlatformCategory = "ide" | "ai" | "terminal";

export interface Platform {
  id: string;
  name: string;
  category: PlatformCategory;
  installKey?: "vscode" | "cursor" | "windsurf" | "openvsx";
  note?: string;
  /** Shown on marketing grid — only supported platforms are listed by default */
  supported?: boolean;
}

export const PLATFORMS: Platform[] = [
  { id: "vscode", name: "VS Code", category: "ide", installKey: "vscode", note: "Extension", supported: true },
  { id: "cursor", name: "Cursor", category: "ide", installKey: "cursor", note: "Extension", supported: true },
  { id: "windsurf", name: "Windsurf", category: "ide", installKey: "windsurf", note: "Extension", supported: true },
  { id: "openvsx", name: "Open VSX", category: "ide", installKey: "openvsx", note: "VSCodium", supported: true },
  { id: "vscode-insiders", name: "VS Code Insiders", category: "ide", installKey: "vscode", note: "Extension", supported: true },
  { id: "claude-code", name: "Claude Code", category: "ai", note: "Spinner in IDE", supported: true },
  { id: "claude-cli", name: "Claude CLI", category: "terminal", note: "aibc install claude", supported: true },
  { id: "github-copilot", name: "GitHub Copilot", category: "ai", note: "Via supported IDE", supported: true },
  { id: "codex", name: "OpenAI Codex", category: "ai", note: "Via supported IDE", supported: true },
  { id: "bolt", name: "Bolt", category: "ai", note: "Coming soon", supported: false },
  { id: "lovable", name: "Lovable", category: "ai", note: "Coming soon", supported: false },
  { id: "v0", name: "v0", category: "ai", note: "Coming soon", supported: false },
  { id: "replit", name: "Replit", category: "ai", note: "Coming soon", supported: false },
  { id: "gemini", name: "Google Gemini", category: "ai", note: "Coming soon", supported: false },
  { id: "copilot", name: "Microsoft Copilot", category: "ai", note: "Coming soon", supported: false },
  { id: "opencode", name: "OpenCode", category: "ai", note: "Coming soon", supported: false },
  { id: "antigravity", name: "Antigravity", category: "ai", note: "Coming soon", supported: false },
  { id: "github", name: "GitHub Codespaces", category: "ai", note: "Coming soon", supported: false },
  { id: "jetbrains", name: "JetBrains IDEs", category: "ide", note: "Coming soon", supported: false },
  { id: "neovim", name: "Neovim", category: "ide", note: "Coming soon", supported: false },
];

export const SUPPORTED_PLATFORMS = PLATFORMS.filter((p) => p.supported !== false);
export const IDE_PLATFORMS = PLATFORMS.filter((p) => p.category === "ide");
export const AI_PLATFORMS = PLATFORMS.filter((p) => p.category === "ai");
export const TERMINAL_PLATFORMS = PLATFORMS.filter((p) => p.category === "terminal");
