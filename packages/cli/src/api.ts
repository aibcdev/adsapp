import * as fs from "node:fs";
import * as path from "node:path";
import {
  AIBC_DIR,
  AUTH_FILE,
  DEFAULT_API,
  ensureAibcDir,
  ensureDeviceId,
  readJson,
  writeJson,
  writeAdCache,
} from "./paths";

interface AuthVault {
  accessToken?: string;
  email?: string;
  clientId?: string;
}

export function getToken(): string | undefined {
  return readJson<AuthVault>(AUTH_FILE)?.accessToken;
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init?.body) headers.set("Content-Type", "application/json");
  const res = await fetch(`${DEFAULT_API}${path}`, { ...init, headers });
  if (!res.ok) throw new Error(`API ${path} failed (${res.status})`);
  return res.json() as Promise<T>;
}

export async function reportCliInstall(): Promise<void> {
  const deviceId = ensureDeviceId();
  try {
    await fetch(`${DEFAULT_API}/v1/installs/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ channel: "cli", deviceId, source: "cli" }),
    });
  } catch {
    /* non-blocking */
  }
}

export async function login(): Promise<string> {
  ensureAibcDir();
  const start = await api<{ state: string; authUrl: string; clientId: string }>(
    "/v1/auth/extension/start",
    { method: "POST" },
  );

  console.log("Open this URL to sign in:\n", start.authUrl);

  for (let i = 0; i < 80; i++) {
    await new Promise((r) => setTimeout(r, 1500));
    const poll = await api<{
      status: string;
      accessToken?: string;
      email?: string;
      clientId?: string;
    }>(`/v1/auth/extension/poll?state=${encodeURIComponent(start.state)}`);

    if (poll.status === "complete" && poll.accessToken) {
      writeJson(AUTH_FILE, {
        accessToken: poll.accessToken,
        email: poll.email,
        clientId: poll.clientId || start.clientId,
      });
      return poll.email || "signed-in@aibc.local";
    }
  }
  throw new Error("Sign in timed out");
}

export async function refreshAds(): Promise<void> {
  const vault = readJson<{ clientId?: string }>(AUTH_FILE);
  const clientId = vault?.clientId || "cli-anonymous";
  const apiPath = getToken()
    ? "/v1/portfolio?claude_code_version=0.0.0"
    : `/v1/portfolio/demo?client_id=${encodeURIComponent(clientId)}`;

  const portfolio = await api<{
    ads: { adId: string; text: string; clickUrl: string }[];
  }>(apiPath);

  const ad = portfolio.ads[0];
  if (!ad) throw new Error("No ads in portfolio");

  writeAdCache(ad.text, ad.clickUrl, ad.adId);
  console.log("Ad updated:", ad.text);
}

export function installStatuslineScript(): void {
  ensureAibcDir();
  const assetsDir = path.join(__dirname, "..", "assets");
  for (const file of ["statusline.cjs", "heartbeat.cjs"]) {
    fs.copyFileSync(path.join(assetsDir, file), path.join(AIBC_DIR, file));
  }
}
