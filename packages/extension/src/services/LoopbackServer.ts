import * as http from "node:http";
import { randomBytes } from "node:crypto";

export class LoopbackServer {
  private server?: http.Server;
  private port = 0;
  private token = randomBytes(16).toString("hex");
  private onClick?: (adId: string) => void;

  async start(onClick: (adId: string) => void): Promise<number> {
    this.onClick = onClick;
    if (this.server) return this.port;

    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        if (req.url?.includes("/click")) {
          const url = new URL(req.url, "http://127.0.0.1");
          const adId = url.searchParams.get("adId") || "unknown";
          this.onClick?.(adId);
          res.writeHead(204);
          res.end();
          return;
        }
        res.writeHead(404);
        res.end();
      });

      this.server.listen(0, "127.0.0.1", () => {
        const addr = this.server!.address();
        this.port = typeof addr === "object" && addr ? addr.port : 0;
        resolve(this.port);
      });
      this.server.on("error", reject);
    });
  }

  getBaseUrl(): string {
    return `http://127.0.0.1:${this.port}/aibc/${this.token}`;
  }

  getClickUrl(adId: string, destination: string): string {
    return `${this.getBaseUrl()}/click?adId=${encodeURIComponent(adId)}&dest=${encodeURIComponent(destination)}`;
  }

  dispose(): void {
    this.server?.close();
    this.server = undefined;
  }
}
