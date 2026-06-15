export const EXTENSION_ID = "AIBCMedia.aibc";
/** Marketplace search — try both; new listings can take hours to appear in Cursor. */
export const EXTENSION_SEARCH_HINT = "AIBCMedia or aibc";

export const OPEN_VSX_URL = "https://open-vsx.org/extension/AIBCMedia/aibc";
export const VS_MARKETPLACE_URL =
  "https://marketplace.visualstudio.com/items?itemName=AIBCMedia.aibc";

export type InstallKey = "vscode" | "cursor" | "windsurf" | "openvsx";

export type InstallOption = {
  label: string;
  sublabel?: string;
  /** Public listing page (Open VSX or VS Marketplace). */
  storeUrl: string;
  protocols: string[];
  manualSteps: string[];
  /** For Cmd+Shift+P inside the editor — not the Mac terminal. */
  paletteCommand: string;
};

export const INSTALL: Record<InstallKey, InstallOption> = {
  vscode: {
    label: "VS Code",
    sublabel: "(Antigravity, Codex, Claude)",
    storeUrl: VS_MARKETPLACE_URL,
    protocols: [
      "vscode:extension/AIBCMedia.aibc",
      "cursor:extension/AIBCMedia.aibc",
    ],
    manualSteps: [
      "Open VS Code (or a compatible editor)",
      "Press Cmd+Shift+X → search AIBCMedia or aibc → Install",
      "Not listed yet? Cmd+Shift+P → paste the command below → Enter",
      "Or open the VS Marketplace link below",
    ],
    paletteCommand: `ext install ${EXTENSION_ID}`,
  },
  cursor: {
    label: "Cursor",
    storeUrl: VS_MARKETPLACE_URL,
    protocols: [
      "cursor:extension/AIBCMedia.aibc",
      "vscode:extension/AIBCMedia.aibc",
    ],
    manualSteps: [
      "Open Cursor",
      "Press Cmd+Shift+X → search AIBCMedia or aibc → Install",
      "Not listed yet? Cmd+Shift+P → paste the command below → Enter",
      "Or open the VS Marketplace link below",
    ],
    paletteCommand: `ext install ${EXTENSION_ID}`,
  },
  windsurf: {
    label: "Windsurf",
    sublabel: "(via Open VSX)",
    storeUrl: OPEN_VSX_URL,
    protocols: [
      "windsurf:extension/AIBCMedia.aibc",
      "vscode:extension/AIBCMedia.aibc",
    ],
    manualSteps: [
      "Open Windsurf",
      "Press Cmd+Shift+X → search AIBCMedia or aibc → Install",
      "Windsurf uses Open VSX — if search is empty, open the Open VSX link below → Download → Install from VSIX",
      "Or Cmd+Shift+P → paste the command below → Enter",
    ],
    paletteCommand: `ext install ${EXTENSION_ID}`,
  },
  openvsx: {
    label: "Open VSX",
    sublabel: "(VSCodium & more)",
    storeUrl: OPEN_VSX_URL,
    protocols: [],
    manualSteps: [
      "Open your editor's Extensions panel (Cmd+Shift+X)",
      "Search AIBCMedia or aibc → Install",
      "Or open the Open VSX page below → Download → Install from VSIX in your editor",
    ],
    paletteCommand: `ext install ${EXTENSION_ID}`,
  },
};

/** Map marketing platform names to install keys. */
export const PLATFORM_INSTALL_KEY: Record<string, InstallKey> = {
  "VS Code": "vscode",
  Cursor: "cursor",
  Windsurf: "windsurf",
  "Open VSX": "openvsx",
};

/** Attempt editor deep-link; opens store page for Open VSX / fallback. */
export function triggerInstall(key: InstallKey): InstallOption {
  const option = INSTALL[key];
  for (const href of option.protocols) {
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }
  if (key === "openvsx" || key === "windsurf") {
    window.open(option.storeUrl, "_blank", "noopener,noreferrer");
  }
  return option;
}

export function installStoreUrl(key: InstallKey): string {
  return INSTALL[key].storeUrl;
}

export async function copyInstallCommand(command: string) {
  await navigator.clipboard.writeText(command);
}
