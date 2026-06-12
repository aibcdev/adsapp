/** Production defaults — override per package via env or VS Code settings. */
export const DEFAULT_API_BASE = "https://api.aibcmedia.com";
export const DEFAULT_PORTAL_BASE = "https://aibcmedia.com";
export const DEFAULT_FEED_URL = `${DEFAULT_API_BASE}/feed`;

export function portalDashboardUrl(portalBase = DEFAULT_PORTAL_BASE): string {
  return `${portalBase.replace(/\/$/, "")}/dashboard`;
}
