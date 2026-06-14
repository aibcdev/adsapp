export type SponsorBrand = "ramp" | "linear" | "vercel";

const sizeClass = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
} as const;

function RampMark() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className="h-full w-full">
      <rect width="16" height="16" rx="3" fill="#F5C518" />
      <path
        d="M4.5 11V5h2.1c1.2 0 1.9.6 1.9 1.5 0 .7-.4 1.2-1 1.4l1.4 2.1H7.8L6.6 8.3H6v2.7H4.5zm1.5-3.8h.6c.5 0 .8-.2.8-.6 0-.4-.3-.6-.8-.6H6v1.2z"
        fill="#1A1A1A"
      />
    </svg>
  );
}

function LinearMark() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className="h-full w-full">
      <rect width="16" height="16" rx="4" fill="#5E6AD2" />
      <path
        d="M4 11.5L8 4.5l4 7"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="11.5" r="1" fill="white" />
    </svg>
  );
}

function VercelMark() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className="h-full w-full">
      <rect width="16" height="16" rx="3" fill="#000" />
      <path d="M8 3.5L13 12.5H3L8 3.5z" fill="white" />
    </svg>
  );
}

const marks: Record<SponsorBrand, () => JSX.Element> = {
  ramp: RampMark,
  linear: LinearMark,
  vercel: VercelMark,
};

export function SponsorLogo({
  brand,
  size = "sm",
}: {
  brand: SponsorBrand;
  size?: keyof typeof sizeClass;
}) {
  const Mark = marks[brand];
  return (
    <span className={`inline-flex shrink-0 items-center justify-center ${sizeClass[size]}`}>
      <Mark />
    </span>
  );
}
