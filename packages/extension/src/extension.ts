import * as vscode from "vscode";
import {
  ClaudeCodeAdapter,
  locateClaudeCodeTarget,
} from "./adapters/ClaudeCodeAdapter";
import { ClaudeCliAdapter, cleanupAibcArtifacts } from "./adapters/ClaudeCliAdapter";
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
import { getSignedInDashboardUrl } from "./config";

let feedService: FeedService | undefined;
let analyticsService: AnalyticsService | undefined;
let portfolioService: PortfolioService | undefined;
let earningsService: EarningsService | undefined;
let claudeAdapter: ClaudeCodeAdapter | undefined;
let cliAdapter: ClaudeCliAdapter | undefined;
let statusBar: StatusBarController | undefined;
let killSwitch: KillSwitchService | undefined;
let metricsService: MetricsService | undefined;
let enabled = true;
let relocateTimer: NodeJS.Timeout | undefined;
let killPollTimer: NodeJS.Timeout | undefined;

const ACTIVATION_KEY = "aibc.activationFailed";

function syncAuthUi(
  auth: AuthService,
  earningsService: EarningsService,
  statusBar: StatusBarController,
): void {
  const signedIn = auth.isSignedIn();
  statusBar.setKind(signedIn ? "earning" : "sign_in");
  AibcViewProvider.broadcastEarnings(earningsService.getSnapshot(), signedIn);
  if (signedIn) {
    void earningsService.poll();
  }
}

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const auth = new AuthService(context);
  await auth.whenReady();
  const api = auth.getApiClient();
  const featureFlags = new FeatureFlagService();
  const monetization = new MonetizationService();
  analyticsService = new AnalyticsService(auth, context);
  feedService = new FeedService(context);
  portfolioService = new PortfolioService(api, auth);
  metricsService = new MetricsService(api, auth);
  earningsService = new EarningsService(api, auth);
  killSwitch = new KillSwitchService(api);
  const loopback = new LoopbackServer();

  await analyticsService.initialize();
  const isFirst = await auth.markInstalled();
  if (isFirst) await analyticsService.trackExtensionInstalled();
  await analyticsService.trackExtensionActivated();

  statusBar = new StatusBarController();
  context.subscriptions.push({ dispose: () => statusBar?.dispose() });

  claudeAdapter = new ClaudeCodeAdapter(locateClaudeCodeTarget());
  cliAdapter = new ClaudeCliAdapter();

  const refreshTarget = () => {
    const next = locateClaudeCodeTarget();
    claudeAdapter?.setTarget(next);
    return next;
  };

  const pf = claudeAdapter.preflight();
  if (!pf.compatible) {
    statusBar.setKind("incompatible");
    const reason = pf.reason || "Claude Code not compatible";
    const failed = context.globalState.get<boolean>(ACTIVATION_KEY, false);
    if (failed) {
      void vscode.window
        .showWarningMessage(`aibc: ${reason}`, "Retry")
        .then((choice) => {
          if (choice === "Retry") void vscode.commands.executeCommand("aibc.refresh");
        });
    }
  }

  await loopback.start(
    (adId, dest) => {
      void metricsService?.send("click", { adId, surface: "spinner", dest });
    },
    (adId) => {
      void metricsService?.send("view_threshold_met", { adId, surface: "webview" });
    },
  );

  const viewTimers = new Map<string, NodeJS.Timeout>();

  const syncSession = () => {
    const token = portfolioService?.getSessionToken();
    metricsService?.setSessionToken(token);
  };

  const applyCurrentAd = () => {
    if (!enabled || killSwitch?.isPaused()) return;
    syncSession();
    const ad = portfolioService?.getCurrentAd();
    if (!ad) {
      void portfolioService?.refreshIfStale().then(() => {
        syncSession();
        const retry = portfolioService?.getCurrentAd();
        if (retry) applyCurrentAd();
      });
      return;
    }
    const clickUrl = loopback.getClickUrl(ad.adId, ad.clickUrl);
    const viewUrl = loopback.getViewUrl();
    const viewMs = (portfolioService?.getViewThresholdSeconds() ?? 5) * 1000;
    claudeAdapter?.updateAd(ad.text, clickUrl, viewUrl, viewMs);
    cliAdapter?.apply(ad.text, clickUrl, ad.adId);
    void metricsService?.send("impression_rendered", { adId: ad.adId, surface: "spinner" });
    const prev = viewTimers.get(ad.adId);
    if (prev) clearTimeout(prev);
    viewTimers.set(
      ad.adId,
      setTimeout(() => {
        void metricsService?.send("view_threshold_met", { adId: ad.adId, surface: "spinner" });
      }, viewMs),
    );
  };

  portfolioService.setRotateHandler(() => applyCurrentAd());
  portfolioService.setSessionExpiredHandler(() => {
    void portfolioService?.refreshIfStale().then(() => applyCurrentAd());
  });

  earningsService.setUpdateHandler((snapshot) => {
    statusBar?.setEarnings(snapshot);
    AibcViewProvider.broadcastEarnings(snapshot, auth.isSignedIn());
  });

  if (auth.isSignedIn()) {
    earningsService.startPolling();
  }
  syncAuthUi(auth, earningsService, statusBar);

  const runActivation = async () => {
    try {
      await killSwitch!.refresh();
      const wasPaused = killSwitch!.isPaused();
      if (wasPaused) {
        statusBar!.setKind("killed");
      } else {
        await portfolioService!.refresh(pf.version);
        syncSession();
        applyCurrentAd();
        await context.globalState.update(ACTIVATION_KEY, false);
        if (auth.isSignedIn()) statusBar!.setKind("earning");
      }
    } catch {
      await context.globalState.update(ACTIVATION_KEY, true);
      statusBar!.setKind("offline");
    }
  };

  await runActivation();

  killPollTimer = setInterval(async () => {
    const wasPaused = killSwitch!.isPaused();
    await killSwitch!.refresh();
    const paused = killSwitch!.isPaused();
    if (wasPaused && !paused) {
      await portfolioService!.refresh();
      syncSession();
      applyCurrentAd();
      if (auth.isSignedIn()) statusBar!.setKind("earning");
    } else if (!wasPaused && paused) {
      statusBar!.setKind("killed");
    }
  }, 30_000);

  relocateTimer = setInterval(() => {
    const prev = claudeAdapter?.getTarget();
    const next = refreshTarget();
    if (next && next !== prev) {
      applyCurrentAd();
      if (claudeAdapter?.preflight().compatible) statusBar!.setKind(auth.isSignedIn() ? "earning" : "sign_in");
    }
  }, 5 * 60_000);

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
        earningsService?.startPolling();
        syncAuthUi(auth, earningsService!, statusBar!);
        await portfolioService?.refresh();
        syncSession();
        applyCurrentAd();
        vscode.window.showInformationMessage(
          `aibc: Signed in${auth.getEmail() ? ` as ${auth.getEmail()}` : ""}. Earnings active.`,
        );
      } else {
        const retry = await vscode.window.showWarningMessage(
          "aibc: Still waiting for browser sign-in. Finish Google login in your browser, then click Try again.",
          "Try again",
        );
        if (retry === "Try again") {
          await vscode.commands.executeCommand("aibc.signIn");
        }
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
      cleanupAibcArtifacts();
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
          syncSession();
          applyCurrentAd();
          break;
        case "dashboard":
          await vscode.env.openExternal(
            vscode.Uri.parse(
              await getSignedInDashboardUrl(async () => {
                if (!auth.isSignedIn()) return null;
                const data = await auth.getApiClient().json<{ handoff?: string }>(
                  "/v1/auth/handoff",
                  { method: "POST" },
                );
                return data.handoff ?? null;
              }),
            ),
          );
          break;
      }
    }),
    vscode.commands.registerCommand("aibc.refresh", async () => {
      refreshTarget();
      await feedService?.refresh();
      await portfolioService?.refresh();
      syncSession();
      applyCurrentAd();
    }),
    vscode.commands.registerCommand("aibc.openSettings", () => {
      void vscode.commands.executeCommand("workbench.action.openSettings", "aibc");
    }),
    { dispose: () => loopback.dispose() },
    { dispose: () => portfolioService?.dispose() },
    { dispose: () => earningsService?.dispose() },
    {
      dispose: () => {
        if (relocateTimer) clearInterval(relocateTimer);
        if (killPollTimer) clearInterval(killPollTimer);
      },
    },
  );
}

export async function deactivate(): Promise<void> {
  if (relocateTimer) clearInterval(relocateTimer);
  if (killPollTimer) clearInterval(killPollTimer);
  claudeAdapter?.restore();
  cliAdapter?.restore();
  cleanupAibcArtifacts();
  feedService?.dispose();
  await analyticsService?.shutdown();
}
