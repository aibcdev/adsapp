interface SkeletonProps {
  count?: number;
}

export function SkeletonGrid({ count = 4 }: SkeletonProps) {
  return (
    <div className="grid grid-cols-1 gap-3 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-aibc-border bg-aibc-card p-4"
        >
          <div className="mb-3 h-8 w-8 rounded-lg bg-aibc-hover" />
          <div className="mb-2 h-4 w-2/3 rounded bg-aibc-hover" />
          <div className="mb-4 h-3 w-full rounded bg-aibc-hover" />
          <div className="h-8 w-24 rounded-md bg-aibc-hover" />
        </div>
      ))}
    </div>
  );
}
