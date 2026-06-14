import { DEFAULT_API_BASE } from "@aibc/shared";

const API = import.meta.env.VITE_AIBC_API || DEFAULT_API_BASE;

let token = localStorage.getItem("aibc_token") || "";

export function setToken(t: string) {
  token = t;
  localStorage.setItem("aibc_token", t);
}

export function getToken() {
  return token;
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init?.body) headers.set("Content-Type", "application/json");
  const res = await fetch(`${API}${path}`, { ...init, headers });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || `${path} ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function publicApi<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`${path} ${res.status}`);
  return res.json() as Promise<T>;
}

export async function signIn(): Promise<string> {
  const start = await api<{ state: string; authUrl: string }>("/v1/auth/extension/start", {
    method: "POST",
  });
  window.open(start.authUrl, "_blank", "noopener,noreferrer");
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 1500));
    const poll = await api<{ status: string; accessToken?: string; email?: string }>(
      `/v1/auth/extension/poll?state=${encodeURIComponent(start.state)}`,
    );
    if (poll.status === "complete" && poll.accessToken) {
      setToken(poll.accessToken);
      return poll.email || "signed-in@aibc.local";
    }
  }
  throw new Error("Sign in timed out");
}

export async function startDeposit(amountUsd: number): Promise<void> {
  try {
    const checkout = await api<{ url: string }>("/v1/advertiser/deposit/checkout", {
      method: "POST",
      body: JSON.stringify({ amount: amountUsd }),
    });
    window.location.href = checkout.url;
    return;
  } catch {
    /* fall through */
  }
  await api("/v1/advertiser/deposit", {
    method: "POST",
    body: JSON.stringify({ amount: amountUsd }),
  });
}

export async function startCampaignCheckout(payload: Record<string, unknown>): Promise<void> {
  const res = await fetch(`${API}/v1/billing/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  const body = (await res.json()) as { checkout_url?: string; detail?: unknown };
  if (res.ok && body.checkout_url) {
    window.location.assign(body.checkout_url);
    return;
  }
  const detail = body.detail;
  throw new Error(typeof detail === "string" ? detail : "Checkout failed");
}
