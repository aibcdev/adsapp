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
  onEmailRegister,
  onEmailPasswordSignIn,
  onMagicLink,
  onDevSignIn,
  devBypass = false,
}: {
  busy?: boolean;
  error?: string;
  onGoogleSignIn: () => void | Promise<void>;
  onEmailRegister: (email: string, password: string) => void | Promise<void>;
  onEmailPasswordSignIn: (email: string, password: string) => void | Promise<void>;
  onMagicLink: (email: string) => void | Promise<void>;
  onDevSignIn?: () => void;
  devBypass?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [info, setInfo] = useState("");
  const [localError, setLocalError] = useState("");

  const validEmail = () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setLocalError("Enter a valid email address.");
      return false;
    }
    return true;
  };

  const runRegister = async () => {
    setLocalError("");
    setInfo("");
    if (!validEmail()) return;
    if (password.length < 8) {
      setLocalError("Password must be at least 8 characters.");
      return;
    }
    try {
      await onEmailRegister(email.trim().toLowerCase(), password);
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : "Could not create account");
    }
  };

  const runSignIn = async () => {
    setLocalError("");
    setInfo("");
    if (!validEmail()) return;
    if (!password) {
      setLocalError("Enter your password.");
      return;
    }
    try {
      await onEmailPasswordSignIn(email.trim().toLowerCase(), password);
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : "Sign-in failed");
    }
  };

  const runMagicLink = async () => {
    setLocalError("");
    setInfo("");
    if (!validEmail()) return;
    try {
      await onMagicLink(email.trim().toLowerCase());
      setInfo("Check your email for a sign-in link.");
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : "Could not send sign-in link");
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
        onClick={() => document.getElementById("aibc-login-email")?.focus()}
        className={oauthBtn}
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
          placeholder="Password (8+ characters)"
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => void runSignIn()}
          className="rounded-xl border border-zinc-200 bg-white py-3 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-50"
        >
          Sign in
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void runRegister()}
          className="rounded-xl border border-zinc-200 bg-white py-3 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-50"
        >
          Create account
        </button>
      </div>

      <div className="mt-3 space-y-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void runMagicLink()}
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-50"
        >
          Email me a sign-in link
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
        <Link to="/forgot-password" className="text-emerald-700 hover:text-emerald-800">
          Forgot password?
        </Link>
        <Link to="/" className="text-zinc-500 hover:text-zinc-800">
          ← back
        </Link>
      </div>
    </div>
  );
}
