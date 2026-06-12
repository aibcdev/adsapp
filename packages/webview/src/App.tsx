import { useEffect } from "react";
import type { AibcTab } from "@aibc/shared";
import { postToHost, subscribeFromHost } from "./lib/vscode";
import {
  getCardsForTab,
  getEnabledTabs,
  useAibcStore,
} from "./store/aibcStore";
import { TabBar } from "./components/TabBar";
import { CardGrid } from "./components/CardGrid";
import { UpdateList } from "./components/UpdateList";
import { EmptyState } from "./components/EmptyState";
import { SkeletonGrid } from "./components/SkeletonGrid";
import { EarnTab } from "./components/EarnTab";

export function App() {
  const {
    activeTab,
    feed,
    loading,
    error,
    earnings,
    signedIn,
    setActiveTab,
    setFeedState,
    setEarningsState,
    setLoading,
    setError,
  } = useAibcStore();

  useEffect(() => {
    const unsubscribe = subscribeFromHost((message) => {
      switch (message.type) {
        case "feed_state":
          setFeedState(message.payload);
          break;
        case "feed_loading":
          setLoading();
          break;
        case "feed_error":
          setError(message.message);
          break;
        case "earnings_state":
          setEarningsState(message.payload, message.signedIn);
          break;
      }
    });

    postToHost({ type: "ready" });
    return unsubscribe;
  }, [setFeedState, setLoading, setError, setEarningsState]);

  useEffect(() => {
    postToHost({ type: "tab_viewed", tab: activeTab });
  }, [activeTab]);

  const enabledTabs = getEnabledTabs(feed);

  useEffect(() => {
    if (enabledTabs.length > 0 && !enabledTabs.includes(activeTab)) {
      setActiveTab(enabledTabs[0]);
    }
  }, [enabledTabs, activeTab, setActiveTab]);

  const layout = feed?.flags.layout ?? "grid";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="border-b border-aibc-border px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-base font-semibold tracking-tight text-aibc-fg">aibc</h1>
            <p className="text-[11px] text-aibc-muted">Discover, earn, and explore</p>
          </div>
          <button
            type="button"
            onClick={() => postToHost({ type: "refresh_feed" })}
            className="rounded-md border border-aibc-border px-2.5 py-1.5 text-[11px] text-aibc-muted hover:bg-aibc-hover"
          >
            Refresh
          </button>
        </div>
      </header>

      <TabBar activeTab={activeTab} enabledTabs={enabledTabs} onChange={setActiveTab} />

      <main className="min-h-0 flex-1 overflow-y-auto">
        {loading ? <SkeletonGrid /> : null}

        {!loading && error ? (
          <EmptyState
            title="Could not load content"
            description={error}
            actionLabel="Try again"
            onAction={() => postToHost({ type: "refresh_feed" })}
          />
        ) : null}

        {!loading && !error && activeTab === "earn" ? (
          <EarnTab earnings={earnings} signedIn={signedIn} />
        ) : null}

        {!loading && !error && feed && activeTab !== "earn" ? (
          activeTab === "updates" ? (
            feed.updates.length > 0 ? (
              <UpdateList updates={feed.updates} />
            ) : (
              <EmptyState title="No updates yet" description="Announcements will appear here." />
            )
          ) : getCardsForTab(feed, activeTab).length > 0 ? (
            <CardGrid cards={getCardsForTab(feed, activeTab)} tab={activeTab} layout={layout} />
          ) : (
            <EmptyState
              title="Nothing here yet"
              description="Check back soon."
              actionLabel="Refresh"
              onAction={() => postToHost({ type: "refresh_feed" })}
            />
          )
        ) : null}
      </main>
    </div>
  );
}
