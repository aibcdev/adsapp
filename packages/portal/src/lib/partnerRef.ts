const STORAGE_KEY = "aibc_advertiser_partner";

export function capturePartnerFromUrl(search: string): void {
  const code = new URLSearchParams(search).get("partner");
  if (code?.trim()) {
    localStorage.setItem(STORAGE_KEY, code.trim().toLowerCase());
  }
}

export function getStoredPartnerCode(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

export function clearStoredPartnerCode(): void {
  localStorage.removeItem(STORAGE_KEY);
}
