import { useState } from "react";
import { Link } from "react-router-dom";
import { AibcLogo } from "../components/brand/AibcLogo";
import { requestPasswordReset } from "../lib/auth";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await requestPasswordReset(email.trim().toLowerCase());
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send reset email");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6">
      <Link to="/" className="mb-8">
        <AibcLogo size="sm" variant="light" />
      </Link>
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="font-brand-heading text-2xl text-zinc-950">Reset password</h1>
        <p className="mt-2 text-sm text-zinc-600">We will email you a link to choose a new password.</p>
        {sent ? (
          <p className="mt-6 text-sm text-emerald-700">If an account exists, check your email for a reset link.</p>
        ) : (
          <form onSubmit={(e) => void submit(e)} className="mt-6 space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm"
            />
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {busy ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}
        <Link to="/login" className="mt-6 inline-block text-sm text-emerald-700 hover:underline">
          ← Back to sign in
        </Link>
      </div>
    </div>
  );
}
