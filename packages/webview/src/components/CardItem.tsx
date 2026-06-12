import type { AibcCard, AibcTab } from "@aibc/shared";
import { useCardImpression } from "../hooks/useCardImpression";
import { postToHost } from "../lib/vscode";

interface CardItemProps {
  card: AibcCard;
  tab: AibcTab;
  layout: "grid" | "list";
}

export function CardItem({ card, tab, layout }: CardItemProps) {
  const ref = useCardImpression(card.id, tab, card.sponsored);

  const handleClick = () => {
    postToHost({
      type: "card_click",
      cardId: card.id,
      tab,
      url: card.cta.url,
      sponsored: card.sponsored,
      affiliate: card.cta.affiliate,
    });
  };

  return (
    <article
      ref={ref}
      className={[
        "group rounded-xl border border-aibc-border bg-aibc-card p-4 shadow-card transition-colors hover:border-[rgba(127,127,127,0.35)]",
        layout === "list" ? "flex gap-4" : "",
      ].join(" ")}
    >
      <div className={layout === "list" ? "min-w-0 flex-1" : ""}>
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-3">
            {card.imageUrl ? (
              <img
                src={card.imageUrl}
                alt=""
                className="h-8 w-8 shrink-0 rounded-lg bg-aibc-hover object-contain p-1"
                loading="lazy"
              />
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-aibc-hover text-xs font-semibold">
                {card.title.slice(0, 1)}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-sm font-semibold text-aibc-fg">
                  {card.title}
                </h3>
                {card.sponsored ? (
                  <span className="rounded-full border border-aibc-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-aibc-muted">
                    Sponsored
                  </span>
                ) : null}
                {card.premium ? (
                  <span className="rounded-full border border-aibc-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-aibc-muted">
                    Premium
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 text-[11px] text-aibc-muted">{card.category}</p>
            </div>
          </div>
        </div>

        <p className="mb-4 text-xs leading-relaxed text-aibc-muted">
          {card.description}
        </p>

        <button
          type="button"
          onClick={handleClick}
          className="rounded-md bg-aibc-accent px-3 py-1.5 text-xs font-medium text-aibc-accentFg transition-opacity hover:opacity-90"
        >
          {card.cta.label}
        </button>
      </div>
    </article>
  );
}
