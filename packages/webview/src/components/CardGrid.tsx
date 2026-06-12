import type { AibcCard, AibcTab } from "@aibc/shared";
import { CardItem } from "./CardItem";

interface CardGridProps {
  cards: AibcCard[];
  tab: AibcTab;
  layout: "grid" | "list";
}

export function CardGrid({ cards, tab, layout }: CardGridProps) {
  if (cards.length === 0) {
    return null;
  }

  return (
    <div
      className={
        layout === "list"
          ? "flex flex-col gap-3 p-4"
          : "grid grid-cols-1 gap-3 p-4 xl:grid-cols-2"
      }
    >
      {cards.map((card) => (
        <CardItem key={card.id} card={card} tab={tab} layout={layout} />
      ))}
    </div>
  );
}
