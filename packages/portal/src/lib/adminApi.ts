const API = import.meta.env.VITE_AIBC_API || "https://api.aibcmedia.com";

export function adminFetch(path: string, key: string, init?: RequestInit) {
  return fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      Accept: "application/json",
      ...(init?.headers || {}),
    },
  });
}

export function getAdminKey(): string {
  return sessionStorage.getItem("aibc_admin_key") || "";
}

export function setAdminKey(key: string) {
  sessionStorage.setItem("aibc_admin_key", key);
}
