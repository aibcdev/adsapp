export const EXTENSION_ID = "AIBCMedia.aibc";
/** Marketplace search — try both; new listings can take hours to appear in Cursor. */
export const EXTENSION_SEARCH_HINT = "AIBCMedia or aibc";

export type InstallKey = "vscode" | "cursor" | "windsurf";

export type InstallOption = {
  label: string;
  sublabel?: string;
  protocols: string[];
  manualSteps: string[];
  /** For Cmd+Shift+P inside the editor — not the Mac terminal. */
  paletteCommand: string;
};

export const INSTALL: Record<InstallKey, InstallOption> = {
  vscode: {
    label: "VS Code",
    sublabel: "(if you use Antigravity, Codex or Claude)",
    protocols: [
      "vscode:extension/AIBCMedia.aibc",
      "cursor:extension/AIBCMedia.aibc",
    ],
    manualSteps: [
      "Open your editor (VS Code, Cursor, Antigravity, etc.)",
      "Press Cmd+Shift+X → search AIBCMedia or aibc → Install",
      "Not listed yet? Cmd+Shift+P → paste the command below → Enter",
    ],
    paletteCommand: `ext install ${EXTENSION_ID}`,
  },
  cursor: {
    label: "Cursor",
    protocols: [
      "cursor:extension/AIBCMedia.aibc",
      "vscode:extension/AIBCMedia.aibc",
    ],
    manualSteps: [
      "Open Cursor",
      "Press Cmd+Shift+X → search AIBCMedia or aibc → Install",
      "Not listed yet? Cmd+Shift+P → paste the command below → Enter",
    ],
    paletteCommand: `ext install ${EXTENSION_ID}`,
  },
  windsurf: {
    label: "Windsurf",
    protocols: [
      "windsurf:extension/AIBCMedia.aibc",
      "vscode:extension/AIBCMedia.aibc",
    ],
    manualSteps: [
      "Open Windsurf",
      "Press Cmd+Shift+X → search AIBCMedia or aibc → Install",
      "Not listed yet? Cmd+Shift+P → paste the command below → Enter",
    ],
    paletteCommand: `ext install ${EXTENSION_ID}`,
  },
};

/** Attempt editor deep-link; always returns manual steps (browsers often block protocol URLs). */
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
  return option;
}

export async function copyInstallCommand(command: string) {
  await navigator.clipboard.writeText(command);
}
