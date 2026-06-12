interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-start gap-2 p-6 text-left">
      <h3 className="text-sm font-semibold text-aibc-fg">{title}</h3>
      <p className="text-xs leading-relaxed text-aibc-muted">{description}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-2 rounded-md bg-aibc-accent px-3 py-1.5 text-xs font-medium text-aibc-accentFg"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
