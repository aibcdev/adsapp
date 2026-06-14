type Size = "sm" | "md" | "lg";
type Variant = "light" | "dark";

const SIZES: Record<
  Size,
  { ring: string; dot: string; text: string; tracking: string }
> = {
  sm: { ring: "h-5 w-5 border-[1.5px]", dot: "h-1.5 w-1.5", text: "text-sm", tracking: "tracking-[0.14em]" },
  md: { ring: "h-6 w-6 border-2", dot: "h-2 w-2", text: "text-base", tracking: "tracking-[0.16em]" },
  lg: { ring: "h-7 w-7 border-2", dot: "h-2.5 w-2.5", text: "text-lg", tracking: "tracking-[0.18em]" },
};

export function AibcLogo({
  size = "md",
  wordmark = true,
  variant = "dark",
}: {
  size?: Size;
  wordmark?: boolean;
  variant?: Variant;
}) {
  const s = SIZES[size];
  const onDark = variant === "dark";
  const ringClass = onDark ? "border-white" : "border-zinc-950";
  const dotClass = onDark ? "bg-white" : "bg-zinc-950";
  const textClass = onDark ? "text-white" : "text-zinc-950";

  return (
    <span className="inline-flex items-center gap-2.5" aria-label="AIBC">
      <span
        className={`relative flex shrink-0 items-center justify-center rounded-full ${s.ring} ${ringClass}`}
        aria-hidden
      >
        <span className={`rounded-full ${s.dot} ${dotClass}`} />
      </span>
      {wordmark ? (
        <span className={`font-sans font-bold uppercase leading-none ${s.text} ${s.tracking} ${textClass}`}>
          AIBC
        </span>
      ) : null}
    </span>
  );
}
