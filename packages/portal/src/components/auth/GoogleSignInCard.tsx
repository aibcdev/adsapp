import { Link } from "react-router-dom";
import { BrandHeading } from "../brand/BrandHeading";

const API = import.meta.env.VITE_AIBC_API || "https://api.aibcmedia.com";

export function GoogleSignInCard({
  title = "Sign in to see your AIBC balance.",
  subtitle = "Your private dashboard shows credited events, payout status, and recent activity from the extension.",
  busy = false,
  googleEnabled = true,
  devBypass = false,
  state = "",
  onGoogleSignIn,
  onDevSignIn,
  error,
  compact,
  showFooter = true,
}: {
  title?: string;
  subtitle?: string;
  busy?: boolean;
  googleEnabled?: boolean;
  devBypass?: boolean;
  state?: string;
  onGoogleSignIn: () => void;
  onDevSignIn?: () => void;
  error?: string;
  compact?: boolean;
  showFooter?: boolean;
}) {
  return (
    <div className={compact ? "aibc-card w-full p-6" : "aibc-card w-full max-w-md p-8"}>
      {!compact ? (
        <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">User earnings portal</p>
      ) : null}
      {!compact ? (
        <BrandHeading as="h1" className={`mt-2 text-3xl md:text-4xl text-zinc-950`}>
          {title}
        </BrandHeading>
      ) : null}
      {!compact ? (
        <p className={`mt-3 text-base font-medium text-zinc-600`}>{subtitle}</p>
      ) : null}

      {compact ? (
        <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-zinc-500">Sign in</p>
      ) : null}

      {googleEnabled ? (
        <button
          type="button"
          disabled={!state || busy}
          onClick={onGoogleSignIn}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white py-3.5 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-50 disabled:opacity-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>
      ) : (
        <p className="mt-6 text-sm text-zinc-500">Google sign-in is not configured on this server.</p>
      )}

      {devBypass && onDevSignIn ? (
        <button
          type="button"
          disabled={!state || busy}
          onClick={onDevSignIn}
          className="mt-3 w-full rounded-xl border border-dashed border-zinc-300 py-3 text-sm text-zinc-500 hover:border-emerald-400"
        >
          Dev sign-in (local only)
        </button>
      ) : null}

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      {!compact && showFooter ? (
        <p className="mt-8 text-center text-xs text-zinc-400">
          <Link to="/privacy" className="underline hover:text-zinc-600">
            Privacy
          </Link>
          {" · "}
          <Link to="/terms" className="underline hover:text-zinc-600">
            Terms
          </Link>
        </p>
      ) : null}
    </div>
  );
}

export function devSignInUrl(state: string) {
  return `${API}/v1/auth/dev-complete?state=${encodeURIComponent(state)}`;
}
