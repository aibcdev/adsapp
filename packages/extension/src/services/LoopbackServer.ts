import * as http from "node:http";
import { randomBytes } from "node:crypto";
import { isLoopbackHost } from "../util/loopback.js";

export type LoopbackViewHandler = (adId: string) => void;
export type LoopbackClickHandler = (adId: string, dest?: string) => void;

export class LoopbackServer {
  private server?: http.Server;
  private port = 0;
  private token = randomBytes(16).toString("hex");
  private onClick?: LoopbackClickHandler;
  private onView?: LoopbackViewHandler;

  async start(
    onClick: LoopbackClickHandler,
    onView?: LoopbackViewHandler,
  ): Promise<number> {
    this.onClick = onClick;
    this.onView = onView;
    if (this.server) return this.port;

    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        const origin = req.headers.origin;
        if (origin && isLoopbackHost(new URL(origin).hostname)) {
          res.setHeader("Access-Control-Allow-Origin", origin);
        } else {
          res.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1");
        }
        if (req.method === "OPTIONS") {
          res.writeHead(204, {
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "content-type",
          });
          res.end();
          return;
        }

        const url = req.url ? new URL(req.url, "http://127.0.0.1") : null;
        if (!url || !this.validatePath(url.pathname)) {
          res.writeHead(403);
          res.end();
          return;
        }

        if (url.pathname.endsWith("/click")) {
          const adId = url.searchParams.get("adId") || "unknown";
          const dest = url.searchParams.get("dest") || "";
          this.onClick?.(adId, dest || undefined);
          if (dest && dest.startsWith("http")) {
            res.writeHead(302, { Location: dest });
            res.end();
            return;
          }
          res.writeHead(204);
          res.end();
          return;
        }

        if (url.pathname.endsWith("/view") && req.method === "POST") {
          let body = "";
          req.on("data", (chunk) => {
            body += chunk;
          });
          req.on("end", () => {
            try {
              const parsed = JSON.parse(body || "{}") as { adId?: string };
              const adId = parsed.adId || url.searchParams.get("adId") || "unknown";
              this.onView?.(adId);
              res.writeHead(204);
              res.end();
            } catch {
              res.writeHead(400);
              res.end();
            }
          });
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

  private validatePath(pathname: string): boolean {
    return pathname.startsWith(`/aibc/${this.token}/`);
  }

  getBaseUrl(): string {
    return `http://127.0.0.1:${this.port}/aibc/${this.token}`;
  }

  getClickUrl(adId: string, destination: string): string {
    return `${this.getBaseUrl()}/click?adId=${encodeURIComponent(adId)}&dest=${encodeURIComponent(destination)}`;
  }

  getViewUrl(): string {
    return `${this.getBaseUrl()}/view`;
  }

  dispose(): void {
    this.server?.close();
    this.server = undefined;
  }
}
