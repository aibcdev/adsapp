const STORAGE_KEY = "aibc_signup_attribution";

export type SignupAttribution = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  landingPath?: string;
};

function clean(value: string | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim().slice(0, 120);
  return trimmed.length > 0 ? trimmed : undefined;
}

function buildFromParams(params: URLSearchParams, path: string): SignupAttribution | null {
  const gclid = params.get("gclid");
  const ttclid = params.get("ttclid");

  const attr: SignupAttribution = {
    utmSource: clean(params.get("utm_source")) ?? (gclid ? "google" : ttclid ? "tiktok" : undefined),
    utmMedium: clean(params.get("utm_medium")) ?? (gclid ? "cpc" : ttclid ? "paid" : undefined),
    utmCampaign: clean(params.get("utm_campaign")),
    utmContent: clean(params.get("utm_content")),
    utmTerm: clean(params.get("utm_term")),
    landingPath: path.slice(0, 120) || "/",
  };

  const hasTag =
    attr.utmSource ||
    attr.utmMedium ||
    attr.utmCampaign ||
    params.get("utm_source") ||
    params.get("gclid") ||
    params.get("ttclid");

  return hasTag ? attr : null;
}

/** First-touch: keep the first ad link the visitor arrived on. */
export function captureAttributionFromUrl(search: string, path: string): void {
  if (typeof localStorage === "undefined") return;
  if (localStorage.getItem(STORAGE_KEY)) return;

  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const attr = buildFromParams(params, path);
  if (!attr) return;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(attr));
}

export function getStoredAttribution(): SignupAttribution | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SignupAttribution;
  } catch {
    return null;
  }
}

export function attributionRequestBody(): { attribution?: SignupAttribution } {
  const attribution = getStoredAttribution();
  return attribution ? { attribution } : {};
}
