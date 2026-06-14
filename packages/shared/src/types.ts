export type AibcTab = "discover" | "featured" | "resources" | "updates" | "earn";

export interface AibcCta {
  label: string;
  url: string;
  affiliate?: boolean;
}

export interface AibcCard {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  category: string;
  cta: AibcCta;
  sponsored?: boolean;
  premium?: boolean;
}

export interface AibcUpdate {
  id: string;
  title: string;
  summary: string;
  date: string;
  version?: string;
  url?: string;
}

export interface AibcFeatureFlags {
  tabs: {
    discover: boolean;
    featured: boolean;
    resources: boolean;
    updates: boolean;
    earn: boolean;
  };
  layout: "grid" | "list";
  refreshIntervalMinutes: number;
}

export interface AibcFeed {
  version: string;
  flags: AibcFeatureFlags;
  discover: AibcCard[];
  featured: AibcCard[];
  resources: AibcCard[];
  updates: AibcUpdate[];
}

export interface PortfolioAd {
  adId: string;
  text: string;
  clickUrl: string;
  brand?: string;
}

export interface PortfolioResponse {
  ads: PortfolioAd[];
  rotationIntervalMs: number;
  view_threshold_seconds: number;
  session_token: string;
  expires_at: number;
}

export interface EarningsSnapshot {
  today: number;
  lifetime: number;
  month: number;
  pending: number;
  payable: number;
  hourlyCapHit?: boolean;
  dailyCapHit?: boolean;
  hourlyResetMinutes?: number;
  dailyResetMinutes?: number;
}

export interface ActivityEvent {
  id: string;
  type: "impression" | "click";
  adId: string;
  amount: number;
  createdAt: string;
}

export interface Campaign {
  id: string;
  adLine: string;
  destinationUrl: string;
  brandName?: string;
  bidPer1k: number;
  blocks: number;
  showOnLeaderboard: boolean;
  status: "active" | "paused";
  impressions: number;
  spend: number;
  createdAt: string;
}

export type AuthSessionType = "anonymous" | "email" | "oauth";

export interface AnonymousSession {
  type: "anonymous";
  deviceId: string;
}

export interface AuthenticatedSession {
  type: "email" | "oauth";
  deviceId: string;
  userId: string;
  email?: string;
  accessToken?: string;
  subscriptionTier?: "free" | "premium";
}

export type AuthSession = AnonymousSession | AuthenticatedSession;

export interface FeedStatePayload {
  feed: AibcFeed;
  source: "cache" | "remote" | "mock";
  fetchedAt: number;
}

export type WebviewToHostMessage =
  | { type: "ready" }
  | { type: "tab_viewed"; tab: AibcTab }
  | { type: "card_impression"; cardId: string; tab: AibcTab; sponsored?: boolean }
  | { type: "card_click"; cardId: string; tab: AibcTab; url: string; sponsored?: boolean; affiliate?: boolean }
  | { type: "refresh_feed" }
  | { type: "sign_in" }
  | { type: "open_dashboard" };

export type HostToWebviewMessage =
  | { type: "feed_state"; payload: FeedStatePayload }
  | { type: "feed_error"; message: string }
  | { type: "feed_loading" }
  | { type: "earnings_state"; payload: EarningsSnapshot | null; signedIn: boolean };

export const DEFAULT_FEATURE_FLAGS: AibcFeatureFlags = {
  tabs: {
    discover: true,
    featured: true,
    resources: true,
    updates: true,
    earn: true,
  },
  layout: "grid",
  refreshIntervalMinutes: 30,
};
