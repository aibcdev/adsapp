import { Link } from "react-router-dom";
import { useState } from "react";

const oauthBtn =
  "flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white py-3 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50";

function GoogleIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
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
  );
}

function AppleIcon() {
  return (
    <svg className="h-5 w-5 shrink-0 text-zinc-900" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.365 1.43c0 1.14-.417 2.087-1.249 2.84-.898.812-1.966 1.214-3.203 1.187-.033-1.09.406-2.087 1.311-2.992.905-.905 1.992-1.358 3.141-1.35.012.437.012.875 0 1.315zM20.754 17.094c-.741 1.703-1.641 3.281-2.703 4.734-1.422 1.922-2.586 3.25-3.492 3.984-.906.734-1.992 1.109-3.258 1.125-1.031 0-1.875-.297-2.531-.891-.656-.594-1.422-.906-2.297-.937-.906-.031-1.781.281-2.625.937-1.547 1.203-2.953 1.359-4.219.469 1.031-2.469 2.094-4.781 3.188-6.937.563-1.203 1.219-2.203 1.969-3 .75-.797 1.547-1.195 2.391-1.195.906 0 1.656.258 2.25.773.594.516 1.313.773 2.156.773.797 0 1.531-.258 2.203-.773.672-.516 1.453-.773 2.344-.773 1.125 0 2.063.656 2.813 1.969-2.25 1.219-3.375 2.938-3.375 5.156 0 1.969.703 3.594 2.109 4.875z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="h-5 w-5 shrink-0 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function OrDivider() {
  return (
    <div className="relative my-4">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-zinc-200" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-white px-3 text-xs font-medium uppercase tracking-wider text-zinc-400">or</span>
      </div>
    </div>
  );
}

export function LoginAuthCard({
  busy = false,
  error,
  onGoogleSignIn,
  onEmailSignIn,
  onDevSignIn,
  devBypass = false,
}: {
  busy?: boolean;
  error?: string;
  onGoogleSignIn: () => void | Promise<void>;
  onEmailSignIn: (email: string) => void | Promise<void>;
  onDevSignIn?: () => void;
  devBypass?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [info, setInfo] = useState("");
  const [localError, setLocalError] = useState("");

  const runEmail = async (mode: "signin" | "create" | "magic") => {
    setLocalError("");
    setInfo("");
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setLocalError("Enter a valid email address.");
      return;
    }
    try {
      await onEmailSignIn(email.trim().toLowerCase());
      if (mode === "magic") setInfo("Signed in. Redirecting to your dashboard…");
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : "Sign-in failed");
    }
  };

  const displayError = error || localError;

  return (
    <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg shadow-zinc-200/50 md:p-8">
      <button type="button" disabled={busy} onClick={() => void onGoogleSignIn()} className={oauthBtn}>
        <GoogleIcon />
        {busy ? "Signing in…" : "Continue with Google"}
      </button>

      <OrDivider />

      <button
        type="button"
        disabled={busy}
        onClick={() => setLocalError("Apple sign-in is not set up yet. Use Google or email below.")}
        className={oauthBtn}
      >
        <AppleIcon />
        Continue with Apple
      </button>

      <button
        type="button"
        disabled={busy}
        onClick={() => {
          setLocalError("");
          document.getElementById("aibc-login-email")?.focus();
        }}
        className={`${oauthBtn} mt-3`}
      >
        <MailIcon />
        Continue with email
      </button>

      <div className="mt-4 space-y-3">
        <input
          id="aibc-login-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => void runEmail("signin")}
          className="rounded-xl border border-zinc-200 bg-white py-3 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-50"
        >
          Sign in
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void runEmail("create")}
          className="rounded-xl border border-zinc-200 bg-white py-3 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-50"
        >
          Create account
        </button>
      </div>

      <div className="mt-3 space-y-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void runEmail("magic")}
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-50"
        >
          Email me a sign-in link
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => setInfo("No verification email needed — sign in with Google or use your email above.")}
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-50"
        >
          Resend verification email
        </button>
      </div>

      {displayError ? <p className="mt-4 text-sm text-red-600">{displayError}</p> : null}
      {info ? <p className="mt-4 text-sm text-emerald-700">{info}</p> : null}

      {devBypass && onDevSignIn ? (
        <button
          type="button"
          disabled={busy}
          onClick={onDevSignIn}
          className="mt-4 w-full rounded-xl border border-dashed border-zinc-300 py-3 text-sm text-zinc-500 hover:border-emerald-400"
        >
          Dev sign-in (local only)
        </button>
      ) : null}

      <div className="mt-6 flex items-center justify-between text-sm">
        <button
          type="button"
          disabled={busy}
          onClick={() => void runEmail("magic")}
          className="text-emerald-700 hover:text-emerald-800 disabled:opacity-50"
        >
          Use a magic link instead
        </button>
        <Link to="/" className="text-zinc-500 hover:text-zinc-800">
          ← back
        </Link>
      </div>
    </div>
  );
}
