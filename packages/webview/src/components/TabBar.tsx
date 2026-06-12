import type { AibcTab } from "@aibc/shared";

const LABELS: Record<AibcTab, string> = {
  earn: "Earn",
  discover: "Discover",
  featured: "Featured",
  resources: "Resources",
  updates: "Updates",
};

interface TabBarProps {
  activeTab: AibcTab;
  enabledTabs: AibcTab[];
  onChange: (tab: AibcTab) => void;
}

export function TabBar({ activeTab, enabledTabs, onChange }: TabBarProps) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-aibc-border px-3 pb-0 pt-3">
      {enabledTabs.map((tab) => {
        const active = tab === activeTab;
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            className={[
              "shrink-0 rounded-t-md px-3 py-2 text-xs font-medium transition-colors",
              active
                ? "bg-aibc-card text-aibc-fg shadow-card"
                : "text-aibc-muted hover:bg-aibc-hover hover:text-aibc-fg",
            ].join(" ")}
          >
            {LABELS[tab]}
          </button>
        );
      })}
    </div>
  );
}
