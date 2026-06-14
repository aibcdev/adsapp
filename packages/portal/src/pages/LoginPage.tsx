import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AibcLogo } from "../components/brand/AibcLogo";
import { LoginAuthCard } from "../components/auth/LoginAuthCard";
import {
  completeAuthFromState,
  completeEmailSignIn,
  devSignInUrl,
  ensureAuthSession,
  getStoredAuthState,
  googleRedirectUrl,
  storeReferralCode,
} from "../lib/auth";
import { getToken, setToken } from "../lib/api";

const API = import.meta.env.VITE_AIBC_API || "https://api.aibcmedia.com";

export function LoginPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const stateParam = params.get("state") || "";
  const refParam = params.get("ref") || "";
  const source = params.get("source") || "portal";
  const [state, setState] = useState(stateParam || getStoredAuthState());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(params.get("error") === "google_failed" ? "Google sign-in failed. Try again." : "");
  const [authConfig, setAuthConfig] = useState({ devBypass: false });

  useEffect(() => {
    if (refParam) storeReferralCode(refParam);
  }, [refParam]);

  useEffect(() => {
    if (getToken()) {
      navigate("/dashboard?tab=developer", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    void fetch(`${API}/v1/auth/config`)
      .then((r) => r.json())
      .then((c) => setAuthConfig({ devBypass: Boolean(c.devBypass) }))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (stateParam) {
      setState(stateParam);
      return;
    }
    void ensureAuthSession(state)
      .then(setState)
      .catch(() => {});
  }, [stateParam]);

  const finishSignIn = async (authState: string) => {
    setBusy(true);
    setError("");
    try {
      const result = await completeAuthFromState(authState, 60);
      setToken(result.accessToken);
      if (source === "extension") {
        navigate(`/login?poll=done&source=extension&email=${encodeURIComponent(result.email)}`, { replace: true });
        return;
      }
      navigate("/dashboard?tab=developer", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    const authState = params.get("auth_state");
    if (authState) void finishSignIn(authState);
  }, []);

  useEffect(() => {
    if (params.get("poll") === "1" && state) void finishSignIn(state);
  }, [params, state]);

  if (params.get("poll") === "done" && source === "extension") {
    const email = params.get("email") || "";
    return (
      <div className="login-shell flex min-h-screen flex-col">
        <header className="border-b border-zinc-200/80 bg-white/80 px-6 py-4 backdrop-blur md:px-10">
          <AibcLogo size="sm" variant="light" />
        </header>
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="aibc-card max-w-md p-8 text-center">
            <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Signed in</p>
            <p className="mt-2 font-brand-heading text-2xl text-zinc-950">You are all set</p>
            {email ? <p className="mt-2 text-sm text-zinc-600">{email}</p> : null}
            <p className="mt-4 text-sm text-zinc-500">Return to your editor. You can close this tab.</p>
          </div>
        </div>
      </div>
    );
  }

  const signInGoogle = async () => {
    setBusy(true);
    setError("");
    try {
      const s = await ensureAuthSession(state);
      setState(s);
      window.location.href = googleRedirectUrl(s);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start Google sign-in");
      setBusy(false);
    }
  };

  const signInEmail = async (email: string) => {
    setBusy(true);
    setError("");
    try {
      const s = await ensureAuthSession(state);
      setState(s);
      const result = await completeEmailSignIn(s, email);
      setToken(result.accessToken);
      if (source === "extension") {
        navigate(`/login?poll=done&source=extension&email=${encodeURIComponent(result.email)}`, { replace: true });
        return;
      }
      navigate("/dashboard?tab=developer", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Email sign-in failed");
      throw err;
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-shell flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-zinc-200/80 bg-white/80 px-6 py-4 backdrop-blur md:px-10">
        <Link to="/">
          <AibcLogo size="sm" variant="light" />
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/" className="text-zinc-600 hover:text-zinc-900">
            Home
          </Link>
          <Link to="/privacy" className="text-zinc-600 hover:text-zinc-900">
            Privacy
          </Link>
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:flex-row lg:items-center lg:justify-center lg:gap-20 lg:px-12 lg:py-16">
        <div className="mb-10 max-w-xl lg:mb-0">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-emerald-800">
            <span className="live-dot h-2 w-2 rounded-full bg-emerald-500" />
            User earnings portal
          </span>
          <h1 className="mt-6 font-brand-heading text-4xl leading-[1.05] text-zinc-950 md:text-5xl lg:text-[3.25rem]">
            Sign in to see your AIBC balance.
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-zinc-600">
            Your private dashboard shows credited events, payout status, and recent activity from the extension.
          </p>
        </div>

        <LoginAuthCard
          busy={busy}
          error={error}
          devBypass={authConfig.devBypass}
          onGoogleSignIn={signInGoogle}
          onEmailSignIn={signInEmail}
          onDevSignIn={() => {
            void ensureAuthSession(state).then((s) => {
              window.location.href = devSignInUrl(s);
            });
          }}
        />
      </div>

      <footer className="border-t border-zinc-200/80 px-6 py-4 text-xs text-zinc-400 md:px-10">
        <div className="mx-auto flex max-w-6xl justify-between">
          <span>AIBC user portal</span>
          <span>
            <Link to="/terms" className="hover:text-zinc-600">
              Terms
            </Link>
            {" / "}
            <Link to="/privacy" className="hover:text-zinc-600">
              Privacy
            </Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
