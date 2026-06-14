import { useState } from "react";

const MIN_PAYOUT = 10;

type PayoutLimits = {
  requestsToday: number;
  requestsThisWeek: number;
  usdToday: number;
  maxRequestsPerDay: number;
  maxRequestsPerWeek: number;
  maxUsdPerDay: number;
};

export function PayoutsPanel({
  payable,
  rail,
  handle,
  payoutLimits,
  onSaveMethod,
  onRequestPayout,
}: {
  payable: number;
  rail: string;
  handle: string;
  payoutLimits?: PayoutLimits;
  onSaveMethod: (rail: string, handle: string) => Promise<void>;
  onRequestPayout: () => Promise<void>;
}) {
  const [localRail, setLocalRail] = useState(rail || "wise");
  const [localHandle, setLocalHandle] = useState(handle);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [setupOpen, setSetupOpen] = useState(!handle.trim());
  const toGo = Math.max(0, MIN_PAYOUT - payable);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      await fn();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="aibc-card flex h-full flex-col p-6">
      <h2 className="font-brand-heading text-xl text-zinc-900">Payouts</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Connect Wise, PayPal, or UPI. Minimum payout is ${MIN_PAYOUT}. We review every request manually.
      </p>

      <div className="mt-4 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4">
        <p className="font-medium text-zinc-800">Payable balance</p>
        <p className="mt-1 font-brand-heading text-3xl text-emerald-700">${payable.toFixed(2)}</p>

        {payable < MIN_PAYOUT ? (
          <p className="mt-2 text-xs text-zinc-500">${toGo.toFixed(2)} to go before you can cash out.</p>
        ) : (
          <p className="mt-2 text-xs text-emerald-700">You meet the ${MIN_PAYOUT} minimum — request a payout anytime.</p>
        )}

        {!setupOpen && handle.trim() ? (
          <div className="mt-4 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600">
            {rail.toUpperCase()} · {handle}
            <button
              type="button"
              onClick={() => setSetupOpen(true)}
              className="ml-2 text-emerald-700 underline hover:text-emerald-800"
            >
              Edit
            </button>
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            <select
              value={localRail}
              onChange={(e) => setLocalRail(e.target.value)}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
            >
              <option value="wise">Wise</option>
              <option value="paypal">PayPal</option>
              <option value="upi">UPI</option>
            </select>
            <input
              value={localHandle}
              onChange={(e) => setLocalHandle(e.target.value)}
              placeholder="Account email or handle"
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
            />
          </div>
        )}

        <div className="mt-4 flex flex-col gap-2">
          {setupOpen || !handle.trim() ? (
            <button
              type="button"
              disabled={busy || !localHandle.trim()}
              onClick={() =>
                void run(async () => {
                  await onSaveMethod(localRail, localHandle.trim());
                  setMsg("Payout method saved.");
                  setSetupOpen(false);
                })
              }
              className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              Set up payouts
            </button>
          ) : null}
          <button
            type="button"
            disabled={busy || payable < MIN_PAYOUT || !handle.trim()}
            onClick={() =>
              void run(async () => {
                await onRequestPayout();
                setMsg("Payout requested. We will review and send manually.");
              })
            }
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Request payout
          </button>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-zinc-500">
        Every payout is manually reviewed for fraud. Click-farm and bot earnings will not be paid.
      </p>
      {payoutLimits ? (
        <p className="mt-2 text-xs text-zinc-500">
          Withdrawal limits: {payoutLimits.requestsToday}/{payoutLimits.maxRequestsPerDay} today ·{" "}
          {payoutLimits.requestsThisWeek}/{payoutLimits.maxRequestsPerWeek} this week · $
          {payoutLimits.usdToday.toFixed(2)}/${payoutLimits.maxUsdPerDay} withdrawn today.
        </p>
      ) : null}

      {msg ? <p className="mt-3 text-sm text-emerald-700">{msg}</p> : null}
      {err ? <p className="mt-3 text-sm text-red-600">{err}</p> : null}
    </div>
  );
}
