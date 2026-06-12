import type { AibcUpdate } from "@aibc/shared";
import { postToHost } from "../lib/vscode";

interface UpdateListProps {
  updates: AibcUpdate[];
}

export function UpdateList({ updates }: UpdateListProps) {
  if (updates.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 p-4">
      {updates.map((update) => (
        <article
          key={update.id}
          className="rounded-xl border border-aibc-border bg-aibc-card p-4 shadow-card"
        >
          <div className="mb-1 flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-aibc-fg">{update.title}</h3>
            {update.version ? (
              <span className="rounded-full border border-aibc-border px-2 py-0.5 text-[10px] text-aibc-muted">
                v{update.version}
              </span>
            ) : null}
          </div>
          <p className="mb-2 text-[11px] text-aibc-muted">{update.date}</p>
          <p className="mb-3 text-xs leading-relaxed text-aibc-muted">
            {update.summary}
          </p>
          {update.url ? (
            <button
              type="button"
              onClick={() =>
                postToHost({
                  type: "card_click",
                  cardId: update.id,
                  tab: "updates",
                  url: update.url!,
                })
              }
              className="text-xs font-medium text-aibc-accentFg underline opacity-80 hover:opacity-100"
              style={{ color: "var(--vscode-textLink-foreground)" }}
            >
              Read more
            </button>
          ) : null}
        </article>
      ))}
    </div>
  );
}
