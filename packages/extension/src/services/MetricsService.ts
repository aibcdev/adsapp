import { ApiClient } from "./ApiClient";
import { AuthService } from "./AuthService";

export class MetricsService {
  constructor(
    private readonly api: ApiClient,
    private readonly auth: AuthService,
  ) {}

  async send(
    event: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const path = this.auth.isSignedIn() ? "/v1/metrics" : "/v1/metrics/demo";
    try {
      await this.api.fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event, kind: event, ...payload }),
      });
    } catch {
      /* offline */
    }
  }
}
