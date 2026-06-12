import { ApiClient } from "./ApiClient";

export class KillSwitchService {
  private paused = false;

  constructor(private readonly api: ApiClient) {}

  isPaused(): boolean {
    return this.paused;
  }

  async refresh(): Promise<boolean> {
    try {
      const data = await this.api.json<{ paused: boolean }>("/v1/killswitch");
      this.paused = Boolean(data.paused);
    } catch {
      /* keep last state */
    }
    return this.paused;
  }
}
