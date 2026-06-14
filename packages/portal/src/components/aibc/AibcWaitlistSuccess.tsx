import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Clipboard, ArrowLeft } from "lucide-react";

export function AibcWaitlistSuccess({
  email,
  position,
  referrals,
  refCode,
  referralLinkUrl,
}: {
  email: string;
  position: number;
  referrals: number;
  refCode: string;
  referralLinkUrl: string;
}) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(referralLinkUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-6 py-24 font-sans text-zinc-900">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[450px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-[150px]" />

      <div className="relative z-10 mx-auto w-full max-w-xl space-y-8 rounded-[2.5rem] border border-zinc-200/80 bg-zinc-900/40 p-8 text-center shadow-2xl backdrop-blur-xl md:p-12">
        <div className="mx-auto flex h-16 w-16 animate-bounce items-center justify-center rounded-full border border-emerald-500/25 bg-emerald-500/15 text-emerald-400">
          <Check className="h-8 w-8" />
        </div>

        <div className="space-y-3">
          <span className="block font-mono text-xs uppercase tracking-widest text-zinc-500">Waitlist confirmed</span>
          <h1 className="font-brand-heading text-5xl leading-none tracking-tight text-zinc-900 md:text-6xl">
            You&apos;re <span className="text-emerald-500 italic">in.</span>
          </h1>
          <p className="text-base font-medium text-zinc-700">Welcome to the founding cohort.</p>
          <div className="inline-block rounded-full border border-emerald-500/10 bg-emerald-500/5 px-3 py-1 font-mono text-[11px] text-emerald-400">
            {email}
          </div>
        </div>

        <p className="mx-auto max-w-sm text-sm font-light leading-relaxed text-zinc-600">
          AIBC Media rewards developers for the attention they already spend inside their IDE. Install the extension when you&apos;re ready.
        </p>

        <div className="grid grid-cols-3 gap-3 rounded-2xl border border-zinc-200 bg-black/40 p-5">
          <div className="space-y-1 text-center">
            <span className="block font-mono text-[10px] uppercase tracking-wider text-zinc-500">Position</span>
            <span className="font-sans text-lg font-bold text-zinc-900 md:text-xl">#{position.toLocaleString()}</span>
          </div>
          <div className="space-y-1 border-x border-zinc-200 text-center">
            <span className="block font-mono text-[10px] uppercase tracking-wider text-zinc-500">Referrals</span>
            <span className="font-sans text-lg font-bold text-emerald-400 md:text-xl">{referrals}</span>
          </div>
          <div className="space-y-1 text-center">
            <span className="block font-mono text-[10px] uppercase tracking-wider text-zinc-500">Cohort goal</span>
            <span className="font-sans text-lg font-bold text-zinc-600 md:text-xl">15,000</span>
          </div>
        </div>

        <div className="space-y-4">
          <label className="mb-1.5 block text-center font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            Your referral link
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-900 p-2.5">
            <span className="flex-1 truncate px-2 font-mono text-xs text-zinc-600 select-all">{referralLinkUrl}</span>
            <button
              type="button"
              onClick={() => void copyToClipboard()}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                copied ? "bg-emerald-500 text-black" : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Copied
                </>
              ) : (
                <>
                  <Clipboard className="h-3.5 w-3.5" />
                  Copy
                </>
              )}
            </button>
          </div>
          <p className="mx-auto max-w-sm text-xs font-light leading-relaxed text-zinc-500">
            Invite friends to move up. Code: <span className="font-mono text-zinc-600">{refCode}</span>
          </p>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-zinc-200 pt-4 sm:flex-row">
          <Link
            to="/"
            className="group flex items-center gap-1.5 font-mono text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Back to homepage
          </Link>
          <Link
            to="/#install"
            className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-400 transition-all hover:bg-emerald-500 hover:text-zinc-950"
          >
            Install extension
          </Link>
        </div>
      </div>
    </div>
  );
}
