import type { PortfolioAd, PortfolioResponse } from "@aibc/shared";
import { ApiClient } from "./ApiClient";
import { AuthService } from "./AuthService";

const SESSION_TTL_MS = 120_000;

export class PortfolioService {
  private queue: PortfolioAd[] = [];
  private index = 0;
  private rotationMs = 120_000;
  private viewThresholdSeconds = 5;
  private sessionToken?: string;
  private sessionExpiresAt = 0;
  private timer: NodeJS.Timeout | undefined;
  private staleTimer: NodeJS.Timeout | undefined;
  private onRotate?: (ad: PortfolioAd) => void;
  private onSessionExpired?: () => void;

  constructor(
    private readonly api: ApiClient,
    private readonly auth: AuthService,
  ) {}

  setRotateHandler(handler: (ad: PortfolioAd) => void): void {
    this.onRotate = handler;
  }

  setSessionExpiredHandler(handler: () => void): void {
    this.onSessionExpired = handler;
  }

  getSessionToken(): string | undefined {
    return this.isSessionFresh() ? this.sessionToken : undefined;
  }

  isSessionFresh(): boolean {
    return Boolean(this.sessionToken && Date.now() < this.sessionExpiresAt - 5_000);
  }

  getCurrentAd(): PortfolioAd | null {
    if (!this.isSessionFresh()) return null;
    return this.queue[this.index] ?? null;
  }

  getViewThresholdSeconds(): number {
    return this.viewThresholdSeconds;
  }

  getRotationMs(): number {
    return this.rotationMs;
  }

  async refresh(ccVersion = "0.0.0"): Promise<PortfolioResponse> {
    const session = await this.auth.getSession();
    let resp: PortfolioResponse;

    if (this.auth.isSignedIn()) {
      resp = await this.api.json<PortfolioResponse>(
        `/v1/portfolio?claude_code_version=${encodeURIComponent(ccVersion)}`,
      );
    } else {
      const deviceId = session.type === "anonymous" ? session.deviceId : "demo";
      resp = await this.api.json<PortfolioResponse>(
        `/v1/portfolio/demo?claude_code_version=${encodeURIComponent(ccVersion)}&client_id=${encodeURIComponent(deviceId)}`,
      );
    }

    this.queue = resp.ads;
    this.index = 0;
    this.rotationMs = resp.rotationIntervalMs;
    this.viewThresholdSeconds = resp.view_threshold_seconds;
    this.sessionToken = resp.session_token;
    this.sessionExpiresAt = resp.expires_at;
    this.scheduleRotation();
    this.scheduleStaleCheck();
    if (this.queue[0]) this.onRotate?.(this.queue[0]);
    return resp;
  }

  rotateNext(): PortfolioAd | null {
    if (!this.isSessionFresh()) {
      void this.refreshIfStale();
      return null;
    }
    if (this.queue.length === 0) return null;
    this.index = (this.index + 1) % this.queue.length;
    const ad = this.queue[this.index];
    this.onRotate?.(ad);
    return ad;
  }

  async refreshIfStale(): Promise<void> {
    if (this.isSessionFresh()) return;
    try {
      await this.refresh();
    } catch {
      this.onSessionExpired?.();
    }
  }

  dispose(): void {
    if (this.timer) clearInterval(this.timer);
    if (this.staleTimer) clearInterval(this.staleTimer);
  }

  private scheduleRotation(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      void this.refreshIfStale().then(() => this.rotateNext());
    }, this.rotationMs);
  }

  private scheduleStaleCheck(): void {
    if (this.staleTimer) clearInterval(this.staleTimer);
    const ms = Math.min(SESSION_TTL_MS - 10_000, this.rotationMs);
    this.staleTimer = setInterval(() => {
      if (!this.isSessionFresh()) void this.refreshIfStale();
    }, Math.max(ms, 30_000));
  }
}
