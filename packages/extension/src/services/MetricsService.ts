import { randomUUID } from "node:crypto";
import * as vscode from "vscode";
import { ApiClient } from "./ApiClient";
import { AuthService } from "./AuthService";

function editorBucket(): string {
  const name = vscode.env.appName.toLowerCase();
  if (name.includes("cursor")) return "cursor";
  if (name.includes("windsurf")) return "windsurf";
  if (name.includes("vscodium")) return "vscodium";
  return "vscode";
}

export class MetricsService {
  private sessionToken?: string;

  constructor(
    private readonly api: ApiClient,
    private readonly auth: AuthService,
  ) {}

  setSessionToken(token: string | undefined): void {
    this.sessionToken = token;
  }

  getSessionToken(): string | undefined {
    return this.sessionToken;
  }

  async send(
    event: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    if (!this.auth.isSignedIn()) return;

    try {
      await this.api.fetch("/v1/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event,
          event_type: event,
          kind: event,
          nonce: randomUUID(),
          session_token: this.sessionToken,
          editor: editorBucket(),
          ...payload,
        }),
      });
    } catch {
      /* offline */
    }
  }
}
