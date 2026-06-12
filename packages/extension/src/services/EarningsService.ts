import type { EarningsSnapshot } from "@aibc/shared";
import { ApiClient } from "./ApiClient";
import { AuthService } from "./AuthService";

export class EarningsService {
  private timer: NodeJS.Timeout | undefined;
  private snapshot: EarningsSnapshot | null = null;
  private onUpdate?: (s: EarningsSnapshot | null) => void;

  constructor(
    private readonly api: ApiClient,
    private readonly auth: AuthService,
  ) {}

  setUpdateHandler(handler: (s: EarningsSnapshot | null) => void): void {
    this.onUpdate = handler;
  }

  getSnapshot(): EarningsSnapshot | null {
    return this.snapshot;
  }

  startPolling(): void {
    if (this.timer) clearInterval(this.timer);
    void this.poll();
    this.timer = setInterval(() => void this.poll(), 1500);
  }

  stopPolling(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
  }

  async poll(): Promise<EarningsSnapshot | null> {
    if (!this.auth.isSignedIn()) {
      this.snapshot = null;
      this.onUpdate?.(null);
      return null;
    }
    try {
      const data = await this.api.json<{
        today: number;
        month?: number;
        lifetime: number;
        pending?: number;
        payable?: number;
        caps?: { hourlyCapHit?: boolean; dailyCapHit?: boolean };
      }>("/v1/earnings");

      this.snapshot = {
        today: data.today,
        month: data.month ?? data.today,
        lifetime: data.lifetime,
        pending: data.pending ?? 0,
        payable: data.payable ?? 0,
        hourlyCapHit: data.caps?.hourlyCapHit,
        dailyCapHit: data.caps?.dailyCapHit,
      };
      this.onUpdate?.(this.snapshot);
      return this.snapshot;
    } catch {
      return null;
    }
  }

  dispose(): void {
    this.stopPolling();
  }
}
