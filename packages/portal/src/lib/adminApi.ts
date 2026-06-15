import { getToken } from "./api";

const API = import.meta.env.VITE_AIBC_API || "https://api.aibcmedia.com";

export async function adminFetch(path: string, init?: RequestInit) {
  const token = getToken();
  if (!token) {
    return new Response(JSON.stringify({ error: "Not signed in" }), { status: 401 });
  }
  return fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(init?.headers || {}),
    },
  });
}

export async function checkAdminAccess(): Promise<{ ok: true; email: string } | { ok: false; status: number; error: string }> {
  const token = getToken();
  if (!token) return { ok: false, status: 401, error: "Sign in required" };

  const res = await adminFetch("/v1/admin/me");
  const body = (await res.json()) as { email?: string; error?: string };
  if (!res.ok) {
    return { ok: false, status: res.status, error: body.error || "Access denied" };
  }
  return { ok: true, email: body.email || "" };
}
