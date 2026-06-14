type Bulletin = {
  active: boolean;
  headline: string;
  items: { ts: string; text: string }[];
};

export function BulletinBanner({
  bulletin,
  onDismiss,
}: {
  bulletin: Bulletin | null;
  onDismiss: () => void;
}) {
  if (!bulletin?.active) return null;

  return (
    <div className="border-b border-orange-500/30 bg-orange-500/10 px-4 py-3">
      <div className="mx-auto flex max-w-6xl items-start justify-between gap-4">
        <div>
          <p className="font-sans text-sm font-semibold text-orange-400">{bulletin.headline}</p>
          <ul className="mt-1 space-y-0.5 font-mono text-xs text-aibc-muted">
            {bulletin.items.slice(0, 2).map((item) => (
              <li key={item.ts + item.text}>
                {item.ts} — {item.text}
              </li>
            ))}
          </ul>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 text-xs text-aibc-muted hover:text-white"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
