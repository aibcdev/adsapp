import { getToken } from "./api";

const API = import.meta.env.VITE_AIBC_API || "https://api.aibcmedia.com";

export function getStoredAuthState(): string {
  return sessionStorage.getItem("aibc_auth_state") || "";
}

export async function startAuthSession(referralCode?: string): Promise<string> {
  const res = await fetch(`${API}/v1/auth/extension/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(referralCode ? { referralCode } : {}),
  });
  const body = (await res.json()) as { state?: string; error?: string };
  if (!res.ok || !body.state) throw new Error(body.error || "Could not start sign-in");
  sessionStorage.setItem("aibc_auth_state", body.state);
  return body.state;
}

export function storeReferralCode(code: string) {
  sessionStorage.setItem("aibc_referral_code", code.trim().toUpperCase());
}

export function getStoredReferralCode(): string {
  return sessionStorage.getItem("aibc_referral_code") || "";
}

export async function ensureAuthSession(existing = ""): Promise<string> {
  if (existing) return existing;
  const stored = getStoredAuthState();
  if (stored) return stored;
  return startAuthSession(getStoredReferralCode() || undefined);
}

export function googleRedirectUrl(state: string): string {
  return `${API}/v1/auth/google/redirect?state=${encodeURIComponent(state)}`;
}

export async function linkExtensionSession(
  state: string,
  accessToken?: string,
): Promise<{ email: string }> {
  const bearer = accessToken || getToken();
  if (!bearer) throw new Error("Not signed in");

  const res = await fetch(`${API}/v1/auth/extension/link`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${bearer}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ state }),
  });
  const body = (await res.json().catch(() => ({}))) as { error?: string; email?: string };
  if (!res.ok) throw new Error(body.error || "Could not link editor sign-in");
  return { email: body.email || "" };
}

export async function pollAuthState(state: string): Promise<{ accessToken: string; email: string } | null> {
  const res = await fetch(`${API}/v1/auth/extension/poll?state=${encodeURIComponent(state)}`);
  const body = (await res.json()) as { status: string; accessToken?: string; email?: string };
  if (body.status === "complete" && body.accessToken) {
    return { accessToken: body.accessToken, email: body.email || "" };
  }
  return null;
}

export async function completeAuthFromState(state: string, maxAttempts = 40): Promise<{ accessToken: string; email: string }> {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await pollAuthState(state);
    if (result) return result;
    await new Promise((r) => setTimeout(r, 750));
  }
  throw new Error("Sign-in timed out. Try again.");
}

export async function completeEmailSignIn(state: string, email: string): Promise<{ accessToken: string; email: string }> {
  const res = await fetch(`${API}/v1/auth/email/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state, email: email.trim().toLowerCase() }),
  });
  const body = (await res.json()) as { ok?: boolean; error?: string; email?: string };
  if (!res.ok) throw new Error(body.error || "Email sign-in failed");
  return completeAuthFromState(state);
}

export function devSignInUrl(state: string): string {
  return `${API}/v1/auth/dev-complete?state=${encodeURIComponent(state)}`;
}
