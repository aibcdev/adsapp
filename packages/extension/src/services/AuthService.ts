import * as crypto from "node:crypto";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";
import * as vscode from "vscode";
import type { AuthSession } from "@aibc/shared";
import { ApiClient } from "./ApiClient";

const DEVICE_ID_KEY = "aibc.deviceId";
const INSTALLED_KEY = "aibc.installed";
const TOKEN_KEY = "aibc.accessToken";
const EMAIL_KEY = "aibc.email";
const CLIENT_ID_KEY = "aibc.clientId";
const AUTH_DIR = path.join(os.homedir(), ".aibc");
const AUTH_FILE = path.join(AUTH_DIR, "auth.json");

export class AuthService {
  private accessToken?: string;
  private email?: string;
  private clientId?: string;
  private api: ApiClient;

  constructor(private readonly context: vscode.ExtensionContext) {
    this.api = new ApiClient(() => this.accessToken);
    void this.loadVault();
  }

  getApiClient(): ApiClient {
    return this.api;
  }

  async getSession(): Promise<AuthSession> {
    const deviceId = await this.getOrCreateDeviceId();
    if (this.accessToken && this.clientId) {
      return {
        type: "oauth",
        deviceId,
        userId: this.clientId,
        email: this.email,
        accessToken: this.accessToken,
      };
    }
    return { type: "anonymous", deviceId };
  }

  isSignedIn(): boolean {
    return Boolean(this.accessToken);
  }

  getToken(): string | undefined {
    return this.accessToken;
  }

  getEmail(): string | undefined {
    return this.email;
  }

  getClientId(): string | undefined {
    return this.clientId;
  }

  async markInstalled(): Promise<boolean> {
    const installed = this.context.globalState.get<boolean>(INSTALLED_KEY, false);
    if (installed) return false;
    await this.context.globalState.update(INSTALLED_KEY, true);
    return true;
  }

  async getDistinctId(): Promise<string> {
    const deviceId = await this.getOrCreateDeviceId();
    return crypto.createHash("sha256").update(deviceId).digest("hex").slice(0, 32);
  }

  async signIn(): Promise<boolean> {
    const start = await this.api.json<{
      state: string;
      authUrl: string;
      clientId: string;
    }>("/v1/auth/extension/start", { method: "POST" });

    this.clientId = start.clientId;
    const opened = await vscode.env.openExternal(vscode.Uri.parse(start.authUrl));
    if (!opened) {
      await vscode.env.clipboard.writeText(start.authUrl);
      const pick = await vscode.window.showWarningMessage(
        "aibc: Browser did not open. Sign-in URL copied to clipboard — paste it in your browser.",
        "Try again",
      );
      if (pick === "Try again") {
        await vscode.env.openExternal(vscode.Uri.parse(start.authUrl));
      }
    }

    const deadline = Date.now() + 120_000;
    while (Date.now() < deadline) {
      await sleep(1500);
      const poll = await this.api.json<{
        status: string;
        accessToken?: string;
        email?: string;
        clientId?: string;
      }>(`/v1/auth/extension/poll?state=${encodeURIComponent(start.state)}`);

      if (poll.status === "complete" && poll.accessToken) {
        this.accessToken = poll.accessToken;
        this.email = poll.email;
        this.clientId = poll.clientId || start.clientId;
        await this.persist();
        await this.context.globalState.update(TOKEN_KEY, this.accessToken);
        await this.context.globalState.update(EMAIL_KEY, this.email);
        await this.context.globalState.update(CLIENT_ID_KEY, this.clientId);
        return true;
      }
    }
    return false;
  }

  async signOut(): Promise<void> {
    if (this.accessToken) {
      try {
        await this.api.fetch("/v1/auth/signout", { method: "POST" });
      } catch {
        /* ignore */
      }
    }
    this.accessToken = undefined;
    this.email = undefined;
    await this.context.globalState.update(TOKEN_KEY, undefined);
    await this.context.globalState.update(EMAIL_KEY, undefined);
    await this.persist();
  }

  private async getOrCreateDeviceId(): Promise<string> {
    const existing = this.context.globalState.get<string>(DEVICE_ID_KEY);
    if (existing) return existing;
    const deviceId = crypto.randomUUID();
    await this.context.globalState.update(DEVICE_ID_KEY, deviceId);
    return deviceId;
  }

  private async loadVault(): Promise<void> {
    this.accessToken = this.context.globalState.get<string>(TOKEN_KEY);
    this.email = this.context.globalState.get<string>(EMAIL_KEY);
    this.clientId = this.context.globalState.get<string>(CLIENT_ID_KEY);
    try {
      const raw = await fs.readFile(AUTH_FILE, "utf8");
      const data = JSON.parse(raw) as { accessToken?: string; email?: string; clientId?: string };
      this.accessToken = this.accessToken || data.accessToken;
      this.email = this.email || data.email;
      this.clientId = this.clientId || data.clientId;
    } catch {
      /* no vault yet */
    }
  }

  private async persist(): Promise<void> {
    await fs.mkdir(AUTH_DIR, { recursive: true });
    await fs.writeFile(
      AUTH_FILE,
      JSON.stringify({
        accessToken: this.accessToken,
        email: this.email,
        clientId: this.clientId,
      }),
      "utf8",
    );
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
