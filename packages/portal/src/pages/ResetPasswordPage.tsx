import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AibcLogo } from "../components/brand/AibcLogo";
import { resetPassword } from "../lib/auth";
import { setToken } from "../lib/api";

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!token) {
      setError("Invalid reset link.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await resetPassword(token, password);
      setToken(result.accessToken);
      navigate("/dashboard?tab=developer", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
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
        <h1 className="font-brand-heading text-2xl text-zinc-950">Choose a new password</h1>
        <form onSubmit={(e) => void submit(e)} className="mt-6 space-y-4">
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm"
          />
          <input
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm password"
            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm"
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {busy ? "Saving…" : "Update password"}
          </button>
        </form>
        <Link to="/login" className="mt-6 inline-block text-sm text-emerald-700 hover:underline">
          ← Back to sign in
        </Link>
      </div>
    </div>
  );
}
