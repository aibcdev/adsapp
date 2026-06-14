export const INSTALL = {
  vscode: {
    label: "VS Code",
    href: "vscode:extension/aibcdev.aibc",
    fallback: "https://marketplace.visualstudio.com/items?itemName=aibcdev.aibc",
  },
  openvsx: {
    label: "Open VSX",
    href: "https://open-vsx.org/extension/aibcdev/aibc",
    fallback: "https://open-vsx.org/extension/aibcdev/aibc",
  },
  cursor: {
    label: "Cursor",
    href: "cursor:extension/aibcdev.aibc",
    fallback: "https://marketplace.visualstudio.com/items?itemName=aibcdev.aibc",
  },
  windsurf: {
    label: "Windsurf",
    href: "https://open-vsx.org/extension/aibcdev/aibc",
    fallback: "https://open-vsx.org/extension/aibcdev/aibc",
  },
} as const;

export type InstallKey = keyof typeof INSTALL;

export function openInstall(key: InstallKey) {
  const link = INSTALL[key];
  try {
    window.location.href = link.href;
  } catch {
    window.open(link.fallback, "_blank", "noopener,noreferrer");
  }
}
