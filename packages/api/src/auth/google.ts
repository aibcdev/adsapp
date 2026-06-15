import type { Database as DbType } from "better-sqlite3";
import { config } from "../config.js";
import { mintToken } from "../db/schema.js";
import { ensureClientProfile } from "../clients/profile.js";
import { resolveAuthClientId } from "../clients/identity.js";

interface GoogleTokenResponse {
  access_token?: string;
  id_token?: string;
  error?: string;
}

interface GoogleUserInfo {
  email?: string;
  sub?: string;
}

export async function completeGoogleAuth(
  db: DbType,
  code: string,
  state: string,
): Promise<{ ok: true; email: string } | { ok: false; error: string }> {
  if (!config.googleClientId || !config.googleClientSecret) {
    return { ok: false, error: "Google OAuth not configured" };
  }

  const row = db
    .prepare("SELECT client_id, completed FROM auth_states WHERE state = ?")
    .get(state) as { client_id: string; completed: number } | undefined;

  if (!row) return { ok: false, error: "Invalid sign-in session" };
  if (row.completed === 1) return { ok: false, error: "Session already used" };

  const redirect = `${config.publicUrl}/v1/auth/google/callback`;
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: config.googleClientId,
      client_secret: config.googleClientSecret,
      redirect_uri: redirect,
      grant_type: "authorization_code",
    }),
  });

  const tokens = (await tokenRes.json()) as GoogleTokenResponse;
  if (!tokens.access_token) {
    return { ok: false, error: tokens.error || "Token exchange failed" };
  }

  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const user = (await userRes.json()) as GoogleUserInfo;
  const email = user.email;
  if (!email) return { ok: false, error: "No email from Google" };

  const clientId = resolveAuthClientId(db, row.client_id, email);
  ensureClientProfile(db, clientId);

  const token = mintToken(db, clientId, email);
  db.prepare(
    "UPDATE auth_states SET completed = 1, token = ?, email = ?, client_id = ? WHERE state = ?",
  ).run(token, email, clientId, state);

  return { ok: true, email };
}

export function googleCallbackHtml(
  success: boolean,
  state?: string,
  email?: string,
): string {
  if (success && state) {
    const redirect = `${config.portalUrl}/dashboard?auth_state=${encodeURIComponent(state)}`;
    return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Signing in…</title>
<meta http-equiv="refresh" content="0;url=${redirect}">
<style>body{font-family:system-ui;background:#f4f4f5;color:#18181b;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}</style>
</head>
<body><p>Signing you in…</p><script>location.replace(${JSON.stringify(redirect)})</script></body></html>`;
  }
  if (success) {
    return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Signed in</title>
<style>body{font-family:system-ui;background:#f4f4f5;color:#18181b;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
.box{text-align:center;padding:2rem;border:1px solid #e4e4e7;border-radius:12px;background:#fff}
h1{color:#059669;font-size:1.5rem}</style></head>
<body><div class="box"><h1>Signed in</h1><p>${email || ""}</p><p>Return to AIBC Media and close this tab.</p></div></body></html>`;
  }
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>Sign-in failed</title>
<meta http-equiv="refresh" content="0;url=${config.portalUrl}/login?error=google_failed">
</head><body style="font-family:system-ui;background:#f4f4f5;color:#18181b;padding:2rem">
<h1>Sign-in failed</h1><p>Redirecting…</p>
<script>location.replace(${JSON.stringify(`${config.portalUrl}/login?error=google_failed`)})</script>
</body></html>`;
}
