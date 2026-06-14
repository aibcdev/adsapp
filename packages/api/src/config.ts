export const config = {
  port: Number(process.env.PORT || 8787),
  /** Public API URL (no trailing slash). Used for OAuth redirects. */
  publicUrl: (process.env.AIBC_PUBLIC_URL || "http://127.0.0.1:8787").replace(
    /\/$/,
    "",
  ),
  portalUrl: (process.env.AIBC_PORTAL_URL || "https://aibcmedia.com").replace(
    /\/$/,
    "",
  ),
  devBypass: process.env.AIBC_DEV_BYPASS === "1",
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  corsOrigins: (
    process.env.AIBC_CORS_ORIGINS ||
    "https://aibcmedia.com,https://www.aibcmedia.com,http://localhost:5175,http://127.0.0.1:5175"
  )
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  viewThresholdSeconds: Number(process.env.AIBC_VIEW_THRESHOLD_SECONDS || 5),
  /** Bearer token for /v1/admin/* routes (payout queue, etc.) */
  adminKey: process.env.AIBC_ADMIN_KEY || "",
};

export function emailAuthEnabled(): boolean {
  return true;
}

export function googleAuthUrl(state: string): string {
  if (!config.googleClientId) {
    throw new Error("Google OAuth not configured");
  }
  const redirect = `${config.publicUrl}/v1/auth/google/callback`;
  const params = new URLSearchParams({
    client_id: config.googleClientId,
    redirect_uri: redirect,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "offline",
    prompt: "consent",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export function authStartUrl(state: string, source = "extension"): string {
  if (config.devBypass) {
    return `${config.publicUrl}/v1/auth/dev-complete?state=${encodeURIComponent(state)}`;
  }
  const params = new URLSearchParams({ state });
  return `${config.portalUrl}/extension/connect?${params}`;
}

export function stripeEnabled(): boolean {
  return Boolean(config.stripeSecretKey);
}
