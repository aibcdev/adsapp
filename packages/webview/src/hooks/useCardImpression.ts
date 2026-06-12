import { useEffect, useRef } from "react";
import type { AibcTab } from "@aibc/shared";
import { postToHost } from "../lib/vscode";

const IMPRESSION_MS = 1000;

export function useCardImpression(
  cardId: string,
  tab: AibcTab,
  sponsored?: boolean,
  enabled = true,
) {
  const ref = useRef<HTMLDivElement | null>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    if (!enabled || firedRef.current) return;
    const node = ref.current;
    if (!node) return;

    let timer: number | undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((e) => e.isIntersecting && e.intersectionRatio >= 0.5);
        if (visible && !firedRef.current) {
          timer = window.setTimeout(() => {
            if (firedRef.current) return;
            firedRef.current = true;
            postToHost({
              type: "card_impression",
              cardId,
              tab,
              sponsored,
            });
          }, IMPRESSION_MS);
        } else if (timer) {
          window.clearTimeout(timer);
          timer = undefined;
        }
      },
      { threshold: [0.5] },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      if (timer) window.clearTimeout(timer);
    };
  }, [cardId, tab, sponsored, enabled]);

  return ref;
}
