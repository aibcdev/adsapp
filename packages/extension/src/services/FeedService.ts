import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as vscode from "vscode";
import {
  validateFeed,
  type FeedStatePayload,
  type AibcFeed,
} from "@aibc/shared";
import { getApiBase } from "../config";

const CACHE_KEY = "aibc.feed.cache";
const CACHE_AT_KEY = "aibc.feed.cacheAt";

export class FeedService {
  private refreshTimer: NodeJS.Timeout | undefined;
  private onUpdate?: (payload: FeedStatePayload) => void;

  constructor(private readonly context: vscode.ExtensionContext) {}

  setUpdateHandler(handler: (payload: FeedStatePayload) => void): void {
    this.onUpdate = handler;
  }

  async start(): Promise<FeedStatePayload> {
    const cached = this.readCache();
    if (cached) {
      this.scheduleRefresh(cached.feed.flags.refreshIntervalMinutes);
      void this.refreshInBackground();
      return cached;
    }

    const payload = await this.fetchFeed();
    this.scheduleRefresh(payload.feed.flags.refreshIntervalMinutes);
    return payload;
  }

  async refresh(): Promise<FeedStatePayload> {
    return this.fetchFeed();
  }

  dispose(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = undefined;
    }
  }

  private readCache(): FeedStatePayload | null {
    const feed = this.context.globalState.get<AibcFeed>(CACHE_KEY);
    const fetchedAt = this.context.globalState.get<number>(CACHE_AT_KEY, 0);
    if (!feed || !fetchedAt) return null;
    return { feed, source: "cache", fetchedAt };
  }

  private async writeCache(payload: FeedStatePayload): Promise<void> {
    await this.context.globalState.update(CACHE_KEY, payload.feed);
    await this.context.globalState.update(CACHE_AT_KEY, payload.fetchedAt);
  }

  private scheduleRefresh(intervalMinutes: number): void {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
    const ms = Math.max(intervalMinutes, 5) * 60 * 1000;
    this.refreshTimer = setInterval(() => {
      void this.refreshInBackground();
    }, ms);
  }

  private async refreshInBackground(): Promise<void> {
    try {
      const payload = await this.fetchFeed();
      this.onUpdate?.(payload);
    } catch {
      // Keep serving cached/mock content silently.
    }
  }

  private resolveFeedUrl(): string {
    const config = vscode.workspace.getConfiguration("aibc");
    const explicit = config.get<string>("feedUrl");
    if (explicit) return explicit;

    const apiBase = getApiBase();

    return `${apiBase.replace(/\/$/, "")}/feed`;
  }

  private async fetchFeed(): Promise<FeedStatePayload> {
    const url = this.resolveFeedUrl();

    try {
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Feed request failed (${response.status})`);
      }

      const json: unknown = await response.json();
      const feed = validateFeed(json);
      if (!feed) {
        throw new Error("Feed validation failed");
      }

      const payload: FeedStatePayload = {
        feed,
        source: "remote",
        fetchedAt: Date.now(),
      };
      await this.writeCache(payload);
      this.onUpdate?.(payload);
      return payload;
    } catch (error) {
      const mock = await this.loadMockFeed();
      if (mock) {
        const payload: FeedStatePayload = {
          feed: mock,
          source: "mock",
          fetchedAt: Date.now(),
        };
        await this.writeCache(payload);
        this.onUpdate?.(payload);
        return payload;
      }

      const cached = this.readCache();
      if (cached) return cached;

      throw error instanceof Error ? error : new Error("Unable to load feed");
    }
  }

  private async loadMockFeed(): Promise<AibcFeed | null> {
    const mockPath = path.join(this.context.extensionPath, "dist", "mock", "feed.json");
    try {
      const raw = await fs.readFile(mockPath, "utf8");
      return validateFeed(JSON.parse(raw));
    } catch {
      return null;
    }
  }
}
