import * as vscode from "vscode";
import {
  ClaudeCodeAdapter,
  locateClaudeCodeTarget,
} from "./adapters/ClaudeCodeAdapter";
import { ClaudeCliAdapter } from "./adapters/ClaudeCliAdapter";
import { AuthService } from "./services/AuthService";
import { AnalyticsService } from "./services/AnalyticsService";
import { FeatureFlagService } from "./services/FeatureFlagService";
import { FeedService } from "./services/FeedService";
import { MonetizationService } from "./services/MonetizationService";
import { PortfolioService } from "./services/PortfolioService";
import { MetricsService } from "./services/MetricsService";
import { EarningsService } from "./services/EarningsService";
import { KillSwitchService } from "./services/KillSwitchService";
import { LoopbackServer } from "./services/LoopbackServer";
import { StatusBarController } from "./ui/StatusBarController";
import { AibcViewProvider } from "./webview/AibcViewProvider";
import { getDashboardUrl } from "./config";

let feedService: FeedService | undefined;
let analyticsService: AnalyticsService | undefined;
let portfolioService: PortfolioService | undefined;
let earningsService: EarningsService | undefined;
let claudeAdapter: ClaudeCodeAdapter | undefined;
let cliAdapter: ClaudeCliAdapter | undefined;
let statusBar: StatusBarController | undefined;
let enabled = true;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const auth = new AuthService(context);
  const api = auth.getApiClient();
  const featureFlags = new FeatureFlagService();
  const monetization = new MonetizationService();
  analyticsService = new AnalyticsService(auth, context);
  feedService = new FeedService(context);
  portfolioService = new PortfolioService(api, auth);
  const metrics = new MetricsService(api, auth);
  earningsService = new EarningsService(api, auth);
  const killSwitch = new KillSwitchService(api);
  const loopback = new LoopbackServer();

  await analyticsService.initialize();
  const isFirst = await auth.markInstalled();
  if (isFirst) await analyticsService.trackExtensionInstalled();
  await analyticsService.trackExtensionActivated();

  statusBar = new StatusBarController();
  context.subscriptions.push({ dispose: () => statusBar?.dispose() });

  const ccTarget = locateClaudeCodeTarget();
  claudeAdapter = new ClaudeCodeAdapter(ccTarget);
  cliAdapter = new ClaudeCliAdapter();

  const pf = claudeAdapter.preflight();
  if (!pf.compatible) statusBar.setKind("incompatible");

  await loopback.start((adId) => {
    void metrics.send("click", { adId, surface: "spinner" });
  });

  const applyCurrentAd = () => {
    if (!enabled || killSwitch.isPaused()) return;
    const ad = portfolioService?.getCurrentAd();
    if (!ad) return;
    const clickUrl = loopback.getClickUrl(ad.adId, ad.clickUrl);
    claudeAdapter?.updateAd(ad.text, clickUrl);
    cliAdapter?.apply(ad.text, ad.clickUrl, ad.adId);
    void metrics.send("impression_rendered", { adId: ad.adId, surface: "spinner" });
  };

  portfolioService.setRotateHandler(() => applyCurrentAd());

  earningsService.setUpdateHandler((snapshot) => {
    statusBar?.setEarnings(snapshot);
    AibcViewProvider.broadcastEarnings(snapshot, auth.isSignedIn());
  });

  if (auth.isSignedIn()) {
    statusBar.setKind("earning");
    earningsService.startPolling();
  } else {
    statusBar.setKind("sign_in");
  }

  try {
    await killSwitch.refresh();
    if (killSwitch.isPaused()) statusBar.setKind("killed");
    await portfolioService.refresh(pf.version);
    applyCurrentAd();
  } catch {
    statusBar.setKind("offline");
  }

  const provider = new AibcViewProvider(
    context.extensionUri,
    feedService,
    featureFlags,
    analyticsService,
    monetization,
    auth,
    earningsService,
  );

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(AibcViewProvider.viewType, provider, {
      webviewOptions: { retainContextWhenHidden: true },
    }),
    vscode.commands.registerCommand("aibc.signIn", async () => {
      const ok = await auth.signIn();
      if (ok) {
        statusBar?.setKind("earning");
        earningsService?.startPolling();
        await portfolioService?.refresh();
        applyCurrentAd();
        vscode.window.showInformationMessage("aibc: Signed in. Earnings active.");
      }
    }),
    vscode.commands.registerCommand("aibc.signOut", async () => {
      await auth.signOut();
      earningsService?.stopPolling();
      statusBar?.setKind("sign_in");
      statusBar?.setEarnings(null);
    }),
    vscode.commands.registerCommand("aibc.restore", () => {
      claudeAdapter?.restore();
      cliAdapter?.restore();
      vscode.window.showInformationMessage("aibc: Claude Code restored.");
    }),
    vscode.commands.registerCommand("aibc.menu", async () => {
      const pick = await vscode.window.showQuickPick(
        [
          { label: "Sign in", action: "signIn" },
          { label: "Sign out", action: "signOut" },
          { label: "Disable aibc", action: "disable" },
          { label: "Enable aibc", action: "enable" },
          { label: "Restore Claude Code", action: "restore" },
          { label: "Refresh ads", action: "refresh" },
          { label: "Open dashboard", action: "dashboard" },
        ],
        { placeHolder: "aibc menu" },
      );
      if (!pick) return;
      switch (pick.action) {
        case "signIn":
          await vscode.commands.executeCommand("aibc.signIn");
          break;
        case "signOut":
          await vscode.commands.executeCommand("aibc.signOut");
          break;
        case "disable":
          enabled = false;
          statusBar?.setKind("off");
          break;
        case "enable":
          enabled = true;
          statusBar?.setKind(auth.isSignedIn() ? "earning" : "sign_in");
          applyCurrentAd();
          break;
        case "restore":
          await vscode.commands.executeCommand("aibc.restore");
          break;
        case "refresh":
          await portfolioService?.refresh();
          applyCurrentAd();
          break;
        case "dashboard":
          await vscode.env.openExternal(vscode.Uri.parse(getDashboardUrl()));
          break;
      }
    }),
    vscode.commands.registerCommand("aibc.refresh", async () => {
      await feedService?.refresh();
      await portfolioService?.refresh();
      applyCurrentAd();
    }),
    vscode.commands.registerCommand("aibc.openSettings", () => {
      void vscode.commands.executeCommand("workbench.action.openSettings", "aibc");
    }),
    { dispose: () => loopback.dispose() },
    { dispose: () => portfolioService?.dispose() },
    { dispose: () => earningsService?.dispose() },
  );
}

export async function deactivate(): Promise<void> {
  feedService?.dispose();
  await analyticsService?.shutdown();
}
