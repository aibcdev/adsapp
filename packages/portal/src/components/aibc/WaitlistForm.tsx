import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { joinWaitlist } from "../../lib/waitlist";

const inputClass =
  "w-full rounded-lg border border-zinc-700 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-100 focus:border-emerald-500/50 focus:outline-none";

export function WaitlistForm({ referredBy }: { referredBy?: string }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setBusy(true);
    joinWaitlist(name, email, referredBy);
    navigate("/waitlist/success");
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-md space-y-4">
      <div>
        <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-500">Name</label>
        <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Your name" />
      </div>
      <div>
        <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-500">Email</label>
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="you@company.com" />
      </div>
      {referredBy ? <p className="font-mono text-xs text-zinc-500">Referred by code {referredBy}</p> : null}
      <button type="submit" disabled={busy} className="w-full rounded-full bg-white py-3 text-sm font-semibold text-black hover:bg-zinc-200 disabled:opacity-60">
        Reserve Your Spot
      </button>
      <p className="text-center text-xs text-zinc-500">
        Stored in your browser only (demo). Payouts begin once sponsor campaigns launch. No earnings guaranteed.
      </p>
    </form>
  );
}
