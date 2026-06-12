import type { AibcFeatureFlags, AibcFeed } from "@aibc/shared";
import { DEFAULT_FEATURE_FLAGS } from "@aibc/shared";

export class FeatureFlagService {
  private flags: AibcFeatureFlags = DEFAULT_FEATURE_FLAGS;

  updateFromFeed(feed: AibcFeed): void {
    this.flags = feed.flags;
  }

  getFlags(): AibcFeatureFlags {
    return this.flags;
  }

  isTabEnabled(tab: keyof AibcFeatureFlags["tabs"]): boolean {
    return this.flags.tabs[tab];
  }
}
