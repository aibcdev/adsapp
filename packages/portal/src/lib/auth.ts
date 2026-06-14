const API = import.meta.env.VITE_AIBC_API || "https://api.aibcmedia.com";

export async function startAuthSession(): Promise<string> {
  const res = await fetch(`${API}/v1/auth/extension/start`, { method: "POST" });
  const body = (await res.json()) as { state?: string; error?: string };
  if (!res.ok || !body.state) throw new Error(body.error || "Could not start sign-in");
  sessionStorage.setItem("aibc_auth_state", body.state);
  return body.state;
}

export function getStoredAuthState(): string {
  return sessionStorage.getItem("aibc_auth_state") || "";
}

export function googleRedirectUrl(state: string): string {
  return `${API}/v1/auth/google/redirect?state=${encodeURIComponent(state)}`;
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
