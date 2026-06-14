export type SponsorBrand =
  | "ramp"
  | "linear"
  | "vercel"
  | "supabase"
  | "neon"
  | "clerk"
  | "sentry";

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

function SupabaseMark() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className="h-full w-full">
      <rect width="16" height="16" rx="3" fill="#3ECF8E" />
      <path
        d="M8.2 3.5 4.5 8.2c-.3.4-.05 1 .45 1h2.1l.6 2.8c.1.5.7.7 1 .3l3.7-4.7c.3-.4.05-1-.45-1H9.3L8.7 3.8c-.1-.5-.7-.7-1-.3Z"
        fill="#1A1A1A"
      />
    </svg>
  );
}

function NeonMark() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className="h-full w-full">
      <rect width="16" height="16" rx="3" fill="#00E599" />
      <circle cx="8" cy="8" r="3.5" stroke="#0B0F14" strokeWidth="1.5" fill="none" />
      <circle cx="8" cy="8" r="1.2" fill="#0B0F14" />
    </svg>
  );
}

function ClerkMark() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className="h-full w-full">
      <rect width="16" height="16" rx="3" fill="#6C47FF" />
      <path
        d="M8 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm-4.5 7.5c.8-1.6 2.4-2.5 4.5-2.5s3.7.9 4.5 2.5"
        stroke="white"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SentryMark() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className="h-full w-full">
      <rect width="16" height="16" rx="3" fill="#362D59" />
      <path
        d="M8 3 3 11h3.5l1.5-2.5L8 11l1-2.5L10.5 11H13L8 3Z"
        fill="#E1567C"
      />
    </svg>
  );
}

const marks: Record<SponsorBrand, () => JSX.Element> = {
  ramp: RampMark,
  linear: LinearMark,
  vercel: VercelMark,
  supabase: SupabaseMark,
  neon: NeonMark,
  clerk: ClerkMark,
  sentry: SentryMark,
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
