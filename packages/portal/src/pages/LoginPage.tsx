import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AibcLogo } from "../components/brand/AibcLogo";
import { devSignInUrl, GoogleSignInCard } from "../components/auth/GoogleSignInCard";
import { completeAuthFromState, getStoredAuthState, googleRedirectUrl, startAuthSession } from "../lib/auth";
import { getToken, setToken } from "../lib/api";

const API = import.meta.env.VITE_AIBC_API || "https://api.aibcmedia.com";

export function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const stateParam = params.get("state") || "";
  const source = params.get("source") || "portal";
  const [state, setState] = useState(stateParam);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [authConfig, setAuthConfig] = useState({ google: true, devBypass: false });

  useEffect(() => {
    if (getToken()) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    void fetch(`${API}/v1/auth/config`)
      .then((r) => r.json())
      .then((c) =>
        setAuthConfig({
          google: Boolean(c.google),
          devBypass: Boolean(c.devBypass),
        }),
      )
      .catch(() => setAuthConfig({ google: true, devBypass: false }));
  }, []);

  useEffect(() => {
    if (stateParam) {
      setState(stateParam);
      return;
    }
    const stored = getStoredAuthState();
    if (stored) {
      setState(stored);
      return;
    }
    void startAuthSession().then(setState).catch(() => {});
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
      navigate("/dashboard", { replace: true });
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

  const signInGoogle = () => {
    if (!state) return;
    window.location.href = googleRedirectUrl(state);
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

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:flex-row lg:items-stretch lg:justify-center lg:gap-16 lg:px-12 lg:py-20">
        <div className="flex max-w-lg flex-col justify-center pb-10 lg:pb-0 lg:pr-8">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-emerald-700">
            User earnings portal
          </p>
          <h1 className="mt-4 font-brand-heading text-4xl leading-tight text-zinc-950 md:text-5xl">
            Sign in to see your AIBC balance.
          </h1>
          <p className="mt-4 text-lg font-medium leading-relaxed text-zinc-600">
            Your private dashboard shows credited events, payout status, and recent activity from the extension.
          </p>
        </div>

        <div className="w-full max-w-md">
          <GoogleSignInCard
            compact
            showFooter={false}
            busy={busy}
            devBypass={authConfig.devBypass}
            state={state}
            onGoogleSignIn={signInGoogle}
            onDevSignIn={() => {
              if (!state) return;
              window.location.href = devSignInUrl(state);
            }}
            error={error}
          />

          <p className="mt-8 text-center text-xs text-zinc-400">
            <Link to="/terms" className="underline hover:text-zinc-600">
              Terms
            </Link>
            {" / "}
            <Link to="/privacy" className="underline hover:text-zinc-600">
              Privacy
            </Link>
          </p>
        </div>
      </div>

      <footer className="border-t border-zinc-200/80 px-6 py-4 text-xs text-zinc-400 md:px-10">
        <div className="mx-auto flex max-w-6xl justify-between">
          <span>AIBC user portal</span>
          <span>Terms / Privacy</span>
        </div>
      </footer>
    </div>
  );
}
