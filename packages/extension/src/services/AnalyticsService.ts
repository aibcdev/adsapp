import { PostHog } from "posthog-node";
import * as vscode from "vscode";
import type { AibcTab } from "@aibc/shared";
import { AuthService } from "./AuthService";

export class AnalyticsService {
  private client: PostHog | null = null;
  private enabled = false;

  constructor(
    private readonly auth: AuthService,
    private readonly context: vscode.ExtensionContext,
  ) {}

  async initialize(): Promise<void> {
    const config = vscode.workspace.getConfiguration("aibc");
    const analyticsEnabled = config.get<boolean>("analyticsEnabled", true);
    const apiKey =
      config.get<string>("posthogKey") || process.env.AIBC_POSTHOG_KEY || "";
    const host =
      config.get<string>("posthogHost") ||
      process.env.AIBC_POSTHOG_HOST ||
      "https://us.i.posthog.com";

    if (!analyticsEnabled || !apiKey) {
      this.enabled = false;
      this.client?.shutdown();
      this.client = null;
      return;
    }

    const distinctId = await this.auth.getDistinctId();
    this.client = new PostHog(apiKey, {
      host,
      flushAt: 1,
      flushInterval: 5000,
    });
    this.client.identify({ distinctId });
    this.enabled = true;
  }

  async trackExtensionInstalled(): Promise<void> {
    await this.capture("extension_installed", {
      ide: vscode.env.appName,
      ide_version: vscode.version,
    });
  }

  async trackExtensionActivated(): Promise<void> {
    await this.capture("extension_activated", {
      ide: vscode.env.appName,
      ide_version: vscode.version,
    });
  }

  async trackTabViewed(tab: AibcTab): Promise<void> {
    await this.capture("tab_viewed", { tab });
  }

  async trackCardImpression(
    cardId: string,
    tab: AibcTab,
    sponsored?: boolean,
  ): Promise<void> {
    await this.capture("card_impression", {
      card_id: cardId,
      tab,
      sponsored: Boolean(sponsored),
    });
  }

  async trackCardClick(
    cardId: string,
    tab: AibcTab,
    url: string,
    sponsored?: boolean,
    affiliate?: boolean,
  ): Promise<void> {
    await this.capture("card_click", {
      card_id: cardId,
      tab,
      url_host: safeHost(url),
      sponsored: Boolean(sponsored),
      affiliate: Boolean(affiliate),
    });
  }

  async shutdown(): Promise<void> {
    if (this.client) {
      await this.client.shutdown();
      this.client = null;
    }
  }

  private async capture(
    event: string,
    properties: Record<string, unknown>,
  ): Promise<void> {
    if (!this.enabled || !this.client) return;

    const distinctId = await this.auth.getDistinctId();
    this.client.capture({
      distinctId,
      event,
      properties: {
        ...properties,
        extension_version: this.context.extension.packageJSON.version,
      },
    });
  }
}

function safeHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return "unknown";
  }
}
