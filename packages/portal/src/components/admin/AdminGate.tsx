import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LoginAuthCard } from "../auth/LoginAuthCard";
import { getToken } from "../../lib/api";
import {
  completeAuthFromState,
  completeEmailSignIn,
  consumeLoginRedirect,
  devSignInUrl,
  ensureAuthSession,
  googleRedirectUrl,
  storeLoginRedirect,
} from "../../lib/auth";
import { checkAdminAccess } from "../../lib/adminApi";

type GateState = "loading" | "login" | "denied" | "ready";

export function AdminGate({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [state, setState] = useState<GateState>("loading");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [authConfig, setAuthConfig] = useState({ devBypass: false });
  const [signInState, setSignInState] = useState("");

  const redirectPath = `${location.pathname}${location.search}`;

  const verify = async () => {
    if (!getToken()) {
      setState("login");
      return;
    }
    const result = await checkAdminAccess();
    if (result.ok) {
      setEmail(result.email);
      setState("ready");
      return;
    }
    if (result.status === 403) {
      const { api } = await import("../../lib/api");
      try {
        const me = await api<{ email?: string }>("/v1/me");
        setEmail(me.email || "");
      } catch {
        /* ignore */
      }
      setState("denied");
      return;
    }
    setState("login");
  };

  useEffect(() => {
    void fetch(`${import.meta.env.VITE_AIBC_API || "https://api.aibcmedia.com"}/v1/auth/config`)
      .then((r) => r.json())
      .then((c) => setAuthConfig({ devBypass: Boolean(c.devBypass) }))
      .catch(() => {});
    void ensureAuthSession().then(setSignInState).catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const authState = params.get("auth_state");
    if (authState) {
      setBusy(true);
      void completeAuthFromState(authState)
        .then(async ({ accessToken }) => {
          const { setToken } = await import("../../lib/api");
          setToken(accessToken);
          await verify();
        })
        .catch(() => setError("Sign-in failed. Try again."))
        .finally(() => setBusy(false));
      return;
    }
    void verify();
  }, [location.search]);

  const signInGoogle = async () => {
    setBusy(true);
    setError("");
    try {
      const s = await ensureAuthSession(signInState);
      setSignInState(s);
      storeLoginRedirect(redirectPath);
      window.location.href = googleRedirectUrl(s);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start Google sign-in");
      setBusy(false);
    }
  };

  const signInEmail = async (addr: string) => {
    setBusy(true);
    setError("");
    try {
      const s = await ensureAuthSession(signInState);
      setSignInState(s);
      const result = await completeEmailSignIn(s, addr);
      const { setToken } = await import("../../lib/api");
      setToken(result.accessToken);
      await verify();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Email sign-in failed");
      throw err;
    } finally {
      setBusy(false);
    }
  };

  if (state === "loading") {
    return <p className="text-sm text-zinc-500">Checking access…</p>;
  }

  if (state === "denied") {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center">
        <p className="font-mono text-[10px] uppercase tracking-widest text-red-400">Access denied</p>
        <p className="mt-3 text-sm text-zinc-400">
          This area is restricted. Signed in as {email || "unknown"}.
        </p>
        <Link to="/dashboard" className="mt-6 inline-block text-sm text-emerald-400 hover:underline">
          Go to dashboard
        </Link>
      </div>
    );
  }

  if (state === "login") {
    return (
      <div className="mx-auto max-w-md">
        <p className="mb-4 text-sm text-zinc-400">Sign in with your admin Google account to continue.</p>
        <LoginAuthCard
          busy={busy}
          error={error}
          devBypass={authConfig.devBypass}
          onGoogleSignIn={signInGoogle}
          onEmailSignIn={signInEmail}
          onDevSignIn={() => {
            void ensureAuthSession(signInState).then((s) => {
              storeLoginRedirect(redirectPath);
              window.location.href = devSignInUrl(s);
            });
          }}
        />
      </div>
    );
  }

  return <>{children}</>;
}
