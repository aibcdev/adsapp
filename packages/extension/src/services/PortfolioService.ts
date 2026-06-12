import type { PortfolioAd, PortfolioResponse } from "@aibc/shared";
import { ApiClient } from "./ApiClient";
import { AuthService } from "./AuthService";

export class PortfolioService {
  private queue: PortfolioAd[] = [];
  private index = 0;
  private rotationMs = 120_000;
  private viewThresholdSeconds = 5;
  private timer: NodeJS.Timeout | undefined;
  private onRotate?: (ad: PortfolioAd) => void;

  constructor(
    private readonly api: ApiClient,
    private readonly auth: AuthService,
  ) {}

  setRotateHandler(handler: (ad: PortfolioAd) => void): void {
    this.onRotate = handler;
  }

  getCurrentAd(): PortfolioAd | null {
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
    this.scheduleRotation();
    if (this.queue[0]) this.onRotate?.(this.queue[0]);
    return resp;
  }

  rotateNext(): PortfolioAd | null {
    if (this.queue.length === 0) return null;
    this.index = (this.index + 1) % this.queue.length;
    const ad = this.queue[this.index];
    this.onRotate?.(ad);
    return ad;
  }

  dispose(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private scheduleRotation(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => this.rotateNext(), this.rotationMs);
  }
}
