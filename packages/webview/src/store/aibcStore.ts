import { create } from "zustand";
import type {
  EarningsSnapshot,
  FeedStatePayload,
  AibcFeed,
  AibcTab,
} from "@aibc/shared";
import { DEFAULT_FEATURE_FLAGS } from "@aibc/shared";

interface aibcStore {
  activeTab: AibcTab;
  feed: AibcFeed | null;
  source: FeedStatePayload["source"] | null;
  fetchedAt: number | null;
  loading: boolean;
  error: string | null;
  impressedCards: Set<string>;
  earnings: EarningsSnapshot | null;
  signedIn: boolean;
  setActiveTab: (tab: AibcTab) => void;
  setFeedState: (payload: FeedStatePayload) => void;
  setEarningsState: (payload: EarningsSnapshot | null, signedIn: boolean) => void;
  setLoading: () => void;
  setError: (message: string) => void;
  markImpressed: (cardId: string) => boolean;
}

export const useAibcStore = create<aibcStore>((set, get) => ({
  activeTab: "discover",
  feed: null,
  source: null,
  fetchedAt: null,
  loading: true,
  error: null,
  impressedCards: new Set<string>(),
  earnings: null,
  signedIn: false,

  setActiveTab: (tab) => set({ activeTab: tab }),

  setFeedState: (payload) =>
    set({
      feed: payload.feed,
      source: payload.source,
      fetchedAt: payload.fetchedAt,
      loading: false,
      error: null,
    }),

  setLoading: () => set({ loading: true, error: null }),

  setError: (message) => set({ loading: false, error: message }),

  setEarningsState: (payload, signedIn) => set({ earnings: payload, signedIn }),

  markImpressed: (cardId) => {
    const { impressedCards } = get();
    if (impressedCards.has(cardId)) return false;
    const next = new Set(impressedCards);
    next.add(cardId);
    set({ impressedCards: next });
    return true;
  },
}));

export function getEnabledTabs(feed: AibcFeed | null): AibcTab[] {
  const tabs = feed?.flags.tabs ?? DEFAULT_FEATURE_FLAGS.tabs;
  return (Object.entries(tabs) as [AibcTab, boolean][])
    .filter(([, enabled]) => enabled)
    .map(([tab]) => tab);
}

export function getCardsForTab(feed: AibcFeed, tab: AibcTab) {
  switch (tab) {
    case "discover":
      return feed.discover;
    case "featured":
      return feed.featured;
    case "resources":
      return feed.resources;
    default:
      return [];
  }
}
