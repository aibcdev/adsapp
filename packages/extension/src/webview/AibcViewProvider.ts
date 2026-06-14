import * as vscode from "vscode";
import type { EarningsSnapshot, WebviewToHostMessage } from "@aibc/shared";
import { AnalyticsService } from "../services/AnalyticsService";
import { AuthService } from "../services/AuthService";
import { EarningsService } from "../services/EarningsService";
import { FeatureFlagService } from "../services/FeatureFlagService";
import { FeedService } from "../services/FeedService";
import { MonetizationService } from "../services/MonetizationService";
import {
  createMessenger,
  getWebviewContent,
  getWebviewOptions,
} from "./getWebviewContent";
import { getDashboardUrl } from "../config";

export class AibcViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "aibc.sidebar";
  private static instance?: AibcViewProvider;
  private view?: vscode.WebviewView;

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly feedService: FeedService,
    private readonly featureFlags: FeatureFlagService,
    private readonly analytics: AnalyticsService,
    private readonly monetization: MonetizationService,
    private readonly auth: AuthService,
    private readonly earnings: EarningsService,
  ) {
    AibcViewProvider.instance = this;
    this.feedService.setUpdateHandler((payload) => {
      this.featureFlags.updateFromFeed(payload.feed);
      if (this.view) {
        createMessenger(this.view.webview).postFeedState(payload);
      }
    });
  }

  static broadcastEarnings(
    payload: EarningsSnapshot | null,
    signedIn: boolean,
  ): void {
    if (AibcViewProvider.instance?.view) {
      AibcViewProvider.instance.view.webview.postMessage({
        type: "earnings_state",
        payload,
        signedIn,
      });
    }
  }

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ): void {
    this.view = webviewView;
    webviewView.webview.options = getWebviewOptions(this.extensionUri);
    webviewView.webview.html = getWebviewContent(
      webviewView.webview,
      this.extensionUri,
    );

    const messenger = createMessenger(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (raw: WebviewToHostMessage) => {
      switch (raw.type) {
        case "ready":
          messenger.postFeedLoading();
          try {
            const payload = await this.feedService.start();
            this.featureFlags.updateFromFeed(payload.feed);
            messenger.postFeedState(payload);
            messenger.postEarnings(
              this.earnings.getSnapshot(),
              this.auth.isSignedIn(),
            );
          } catch (error) {
            messenger.postFeedError(
              error instanceof Error ? error.message : "Failed to load feed",
            );
          }
          break;
        case "refresh_feed":
          messenger.postFeedLoading();
          try {
            const payload = await this.feedService.refresh();
            this.featureFlags.updateFromFeed(payload.feed);
            messenger.postFeedState(payload);
          } catch (error) {
            messenger.postFeedError(
              error instanceof Error ? error.message : "Failed to refresh feed",
            );
          }
          break;
        case "sign_in":
          await vscode.commands.executeCommand("aibc.signIn");
          messenger.postEarnings(
            this.earnings.getSnapshot(),
            this.auth.isSignedIn(),
          );
          break;
        case "open_dashboard":
          await vscode.env.openExternal(vscode.Uri.parse(getDashboardUrl()));
          break;
        case "tab_viewed":
          await this.analytics.trackTabViewed(raw.tab);
          break;
        case "card_impression":
          await this.analytics.trackCardImpression(
            raw.cardId,
            raw.tab,
            raw.sponsored,
          );
          break;
        case "card_click":
          await this.analytics.trackCardClick(
            raw.cardId,
            raw.tab,
            raw.url,
            raw.sponsored,
            raw.affiliate,
          );
          await this.monetization.openExternal(raw.url);
          break;
      }
    });
  }
}
