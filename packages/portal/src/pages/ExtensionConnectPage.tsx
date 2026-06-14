import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AibcLogo } from "../components/brand/AibcLogo";
import { getToken } from "../lib/api";
import { linkExtensionSession } from "../lib/auth";

type Status = "connecting" | "done" | "needs_login" | "error";

export function ExtensionConnectPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const state = params.get("state") || "";
  const [status, setStatus] = useState<Status>("connecting");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!state) {
      setStatus("error");
      setError("Missing sign-in session. Return to your editor and click Sign in again.");
      return;
    }

    const token = getToken();
    if (!token) {
      setStatus("needs_login");
      navigate(`/login?state=${encodeURIComponent(state)}&source=extension`, { replace: true });
      return;
    }

    let cancelled = false;
    void linkExtensionSession(state, token)
      .then((result) => {
        if (cancelled) return;
        setEmail(result.email);
        setStatus("done");
      })
      .catch((err) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Could not connect editor";
        if (message.includes("401") || message.toLowerCase().includes("unauthorized")) {
          setStatus("needs_login");
          navigate(`/login?state=${encodeURIComponent(state)}&source=extension`, { replace: true });
          return;
        }
        setStatus("error");
        setError(message);
      });

    return () => {
      cancelled = true;
    };
  }, [state, navigate]);

  return (
    <div className="login-shell flex min-h-screen flex-col">
      <header className="border-b border-zinc-200/80 bg-white/80 px-6 py-4 backdrop-blur md:px-10">
        <Link to="/">
          <AibcLogo size="sm" variant="light" />
        </Link>
      </header>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="aibc-card max-w-md p-8 text-center">
          {status === "connecting" || status === "needs_login" ? (
            <>
              <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Connecting editor</p>
              <p className="mt-2 font-brand-heading text-2xl text-zinc-950">Linking your account…</p>
              <p className="mt-4 text-sm text-zinc-500">
                If you are already signed in on AIBC, this only takes a moment. Return to Cursor or VS Code when
                done.
              </p>
            </>
          ) : null}

          {status === "done" ? (
            <>
              <p className="font-mono text-[10px] uppercase tracking-widest text-emerald-700">Connected</p>
              <p className="mt-2 font-brand-heading text-2xl text-zinc-950">Editor linked</p>
              {email ? <p className="mt-2 text-sm text-zinc-600">{email}</p> : null}
              <p className="mt-4 text-sm text-zinc-500">Return to your editor. You can close this tab.</p>
            </>
          ) : null}

          {status === "error" ? (
            <>
              <p className="font-mono text-[10px] uppercase tracking-widest text-red-600">Connection failed</p>
              <p className="mt-2 text-sm text-zinc-600">{error}</p>
              <Link
                to={`/login?state=${encodeURIComponent(state)}&source=extension`}
                className="mt-6 inline-block rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white"
              >
                Sign in manually
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
