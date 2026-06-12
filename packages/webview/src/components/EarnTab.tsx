import type { EarningsSnapshot } from "@aibc/shared";
import { postToHost } from "../lib/vscode";

interface EarnTabProps {
  earnings: EarningsSnapshot | null;
  signedIn: boolean;
}

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

export function EarnTab({ earnings, signedIn }: EarnTabProps) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Today" value={money(earnings?.today ?? 0)} />
        <Stat label="Month" value={money(earnings?.month ?? 0)} />
        <Stat label="Pending" value={money(earnings?.pending ?? 0)} />
        <Stat label="Payable" value={money(earnings?.payable ?? 0)} />
      </div>

      {!signedIn ? (
        <button
          type="button"
          onClick={() => postToHost({ type: "sign_in" })}
          className="rounded-full bg-[#86efac] px-4 py-2 text-xs font-semibold text-black"
        >
          Sign in to earn
        </button>
      ) : null}

      <button
        type="button"
        onClick={() => postToHost({ type: "open_dashboard" })}
        className="rounded-md border border-aibc-border px-3 py-2 text-xs text-aibc-muted hover:bg-aibc-hover"
      >
        Open full dashboard
      </button>

      <p className="text-[10px] leading-relaxed text-aibc-muted">
        Ads show in Claude Code spinners while you wait. Sign in to credit earnings.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-aibc-border bg-aibc-card p-3">
      <p className="text-[10px] uppercase tracking-wide text-aibc-muted">{label}</p>
      <p className="mt-1 font-serif text-lg text-amber-300">{value}</p>
    </div>
  );
}
